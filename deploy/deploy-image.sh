#!/usr/bin/env bash
set -euo pipefail

readonly HOST_CONFIG="/etc/detective-reader/host.env"
readonly RUNTIME_DIR="/run/detective-reader"
readonly SECRET_ENV="${RUNTIME_DIR}/azure-speech.env"
readonly DEPLOY_LOCK="/run/lock/detective-reader-deploy.lock"

log() {
  printf '%s %s\n' "$(date --iso-8601=seconds)" "$*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

[[ "${EUID}" -eq 0 ]] || fail "This deployment script must run as root."
[[ -r "${HOST_CONFIG}" ]] || fail "Missing ${HOST_CONFIG}."

# shellcheck disable=SC1090
source "${HOST_CONFIG}"

for required_name in \
  APP_DIR \
  AWS_REGION \
  CADDY_IMAGE \
  CLOUDWATCH_LOG_GROUP \
  ECR_REPOSITORY_URL \
  SECRET_ID \
  SITE_ADDRESS; do
  [[ -n "${!required_name:-}" ]] || fail "${required_name} is not configured."
done

[[ "$#" -eq 2 ]] || fail "Usage: detective-reader-deploy IMAGE_URI@DIGEST COMMIT_SHA"

readonly CANDIDATE_IMAGE="$1"
readonly CANDIDATE_COMMIT="$2"
readonly EXPECTED_IMAGE_PREFIX="${ECR_REPOSITORY_URL}@sha256:"
readonly CANDIDATE_DIGEST="${CANDIDATE_IMAGE#"${EXPECTED_IMAGE_PREFIX}"}"

[[ "${CANDIDATE_IMAGE}" == "${EXPECTED_IMAGE_PREFIX}"* ]] || fail "Image is not from the approved ECR repository."
[[ "${CANDIDATE_DIGEST}" =~ ^[0-9a-f]{64}$ ]] || fail "Image must use an immutable sha256 digest."
[[ "${CANDIDATE_COMMIT}" =~ ^[0-9a-f]{40}$ ]] || fail "Commit must be a full lowercase Git SHA."

install -d -m 0700 "${RUNTIME_DIR}" "${APP_DIR}"

exec 9>"${DEPLOY_LOCK}"
flock --wait 600 9 || fail "Another deployment held the host lock for more than ten minutes."

refresh_secret() {
  local secret_json azure_key azure_region secret_tmp

  log "Refreshing the Azure Speech runtime secret."
  secret_json="$(
    aws secretsmanager get-secret-value \
      --region "${AWS_REGION}" \
      --secret-id "${SECRET_ID}" \
      --query SecretString \
      --output text
  )"

  azure_key="$(jq -er '.AZURE_SPEECH_KEY | strings | select(length > 0)' <<<"${secret_json}")"
  azure_region="$(jq -er '.AZURE_SPEECH_REGION | strings | select(length > 0)' <<<"${secret_json}")"

  [[ "${azure_region}" =~ ^[a-z0-9-]+$ ]] || fail "AZURE_SPEECH_REGION has an invalid format."
  [[ "${azure_key}" != *$'\n'* && "${azure_key}" != *$'\r'* ]] || fail "AZURE_SPEECH_KEY must be a single line."

  secret_tmp="$(mktemp "${RUNTIME_DIR}/azure-speech.env.XXXXXX")"
  chmod 0600 "${secret_tmp}"
  {
    printf 'AZURE_SPEECH_KEY=%s\n' "${azure_key}"
    printf 'AZURE_SPEECH_REGION=%s\n' "${azure_region}"
    printf 'AZURE_SPEECH_VOICE=en-US-AvaNeural\n'
    printf 'AZURE_SPEECH_FORMAT=audio-24khz-48kbitrate-mono-mp3\n'
    printf 'AZURE_SPEECH_PITCH=-6%%\n'
  } >"${secret_tmp}"
  mv -f "${secret_tmp}" "${SECRET_ENV}"

  unset secret_json azure_key
}

write_deploy_env() {
  local image="$1" deploy_tmp

  deploy_tmp="$(mktemp "${APP_DIR}/deploy.env.XXXXXX")"
  chmod 0600 "${deploy_tmp}"
  {
    printf 'APP_IMAGE=%s\n' "${image}"
    printf 'AWS_REGION=%s\n' "${AWS_REGION}"
    printf 'CADDY_IMAGE=%s\n' "${CADDY_IMAGE}"
    printf 'CLOUDWATCH_LOG_GROUP=%s\n' "${CLOUDWATCH_LOG_GROUP}"
    printf 'SITE_ADDRESS=%s\n' "${SITE_ADDRESS}"
  } >"${deploy_tmp}"
  mv -f "${deploy_tmp}" "${APP_DIR}/deploy.env"
}

record_release() {
  local image="$1" commit="$2" release_tmp

  release_tmp="$(mktemp "${APP_DIR}/current-release.XXXXXX")"
  chmod 0600 "${release_tmp}"
  printf '%s|%s\n' "${image}" "${commit}" >"${release_tmp}"
  mv -f "${release_tmp}" "${APP_DIR}/current-release"
}

probe_application() {
  local attempt

  for attempt in $(seq 1 12); do
    if "${COMPOSE[@]}" exec -T app python -c \
      "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/api/ready', timeout=5).read()" \
      >/dev/null 2>&1; then
      return 0
    fi
    sleep 5
  done

  return 1
}

probe_azure_speech() {
  local probe_text
  probe_text="Production voice check $(date +%s)-${RANDOM}-${RANDOM}."

  "${COMPOSE[@]}" exec -T \
    --env SPEECH_PROBE_TEXT="${probe_text}" \
    app python -c \
    "import json, os, urllib.request; request=urllib.request.Request('http://127.0.0.1:8080/api/speech', data=json.dumps({'text':os.environ['SPEECH_PROBE_TEXT'],'rate':1.0}).encode(), headers={'Content-Type':'application/json','X-Detective-Reader':'1'}, method='POST'); response=urllib.request.urlopen(request, timeout=65); audio=response.read(); assert response.headers['X-Speech-Voice']=='en-US-AvaNeural' and len(audio)>0" \
    >/dev/null 2>&1
}

activate_image() {
  local image="$1"

  write_deploy_env "${image}"

  if ! "${COMPOSE[@]}" pull; then
    log "Image pull failed."
    return 1
  fi

  if ! "${COMPOSE[@]}" up \
    --detach \
    --remove-orphans \
    --wait \
    --wait-timeout 180; then
    log "Docker Compose did not report a healthy candidate."
    return 1
  fi

  if ! probe_application; then
    log "Candidate readiness probe failed."
    return 1
  fi

  if ! probe_azure_speech; then
    log "Azure Ava speech probe failed."
    return 1
  fi

  return 0
}

previous_release=""
previous_image=""
previous_commit=""
if [[ -r "${APP_DIR}/current-release" ]]; then
  previous_release="$(<"${APP_DIR}/current-release")"
  previous_image="${previous_release%%|*}"
  previous_commit="${previous_release#*|}"
fi

refresh_secret

registry="${ECR_REPOSITORY_URL%%/*}"
aws ecr get-login-password --region "${AWS_REGION}" |
  docker login --username AWS --password-stdin "${registry}" >/dev/null

readonly -a COMPOSE=(
  docker compose
  --project-directory "${APP_DIR}"
  --env-file "${APP_DIR}/deploy.env"
  --file "${APP_DIR}/compose.yaml"
)

log "Activating ${CANDIDATE_IMAGE} from commit ${CANDIDATE_COMMIT}."
if activate_image "${CANDIDATE_IMAGE}"; then
  record_release "${CANDIDATE_IMAGE}" "${CANDIDATE_COMMIT}"
  log "Deployment is healthy."
  exit 0
fi

log "Candidate failed; beginning rollback."
if [[ "${previous_image}" == "${EXPECTED_IMAGE_PREFIX}"* &&
      "${previous_image#"${EXPECTED_IMAGE_PREFIX}"}" =~ ^[0-9a-f]{64}$ &&
      "${previous_commit}" =~ ^[0-9a-f]{40}$ ]]; then
  if activate_image "${previous_image}"; then
    record_release "${previous_image}" "${previous_commit}"
    log "Rollback to ${previous_image} succeeded."
  else
    log "ERROR: rollback candidate also failed readiness."
  fi
else
  log "No prior healthy release exists; stopping the failed first deployment."
  "${COMPOSE[@]}" down --remove-orphans || true
fi

exit 1
