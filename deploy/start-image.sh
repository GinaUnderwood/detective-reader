#!/usr/bin/env bash
set -euo pipefail

readonly HOST_CONFIG="/etc/detective-reader/host.env"

[[ "${EUID}" -eq 0 ]] || {
  echo "This startup script must run as root." >&2
  exit 1
}

# shellcheck disable=SC1090
source "${HOST_CONFIG}"

release=""
for attempt in $(seq 1 12); do
  if release="$(
    aws ssm get-parameter \
      --region "${AWS_REGION}" \
      --name "${CURRENT_RELEASE_PARAMETER}" \
      --query Parameter.Value \
      --output text 2>/dev/null
  )"; then
    break
  fi
  sleep 5
done

if [[ -z "${release}" || "${release}" == "not-deployed" ]]; then
  echo "No confirmed production release has been recorded yet."
  exit 0
fi

image="${release%%|*}"
commit="${release#*|}"

exec /usr/local/sbin/detective-reader-deploy "${image}" "${commit}"
