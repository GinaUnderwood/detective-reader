# Detective Reader production deployment

This stack runs one Docker host on Amazon EC2. GitHub Actions builds an
immutable image, pushes it to private ECR, and invokes an allow-listed Systems
Manager document. The host replaces the running app, waits for
`/api/ready`, and restores the previous digest if readiness fails. This is a
cost-conscious single-instance deployment, not a zero-downtime or multi-AZ
design.

## What Terraform creates

- A dedicated VPC, public subnet, internet gateway, Elastic IP, and security
  group exposing only ports 80 and 443
- An encrypted Amazon Linux 2023 EC2 instance with IMDSv2 required, no SSH
  ingress, and Systems Manager access
- A private immutable ECR repository retaining the newest 25 release images
- A Secrets Manager container for Azure Speech configuration; Terraform never
  creates or reads the secret value
- A narrowly scoped GitHub deployment role trusted only from the repository's
  protected `production` environment
- A custom SSM deployment document, CloudWatch container log group, and EC2
  status-check alarm
- An optional Route 53 `A` record when both a hostname and hosted zone ID are
  supplied

## Prerequisites

- AWS CLI access through IAM Identity Center/SSO or another short-lived
  administrator session for the one-time bootstrap
- Terraform 1.15.8
- Repository administrator access in GitHub
- An Azure Speech key and region. The runtime is fixed to
  `en-US-AvaNeural`, `-6%` pitch, and
  `audio-24khz-48kbitrate-mono-mp3`.
- A domain name for trusted HTTPS. HTTP on the Elastic IP is suitable only for
  an initial smoke test.

No long-lived AWS access key belongs in GitHub.

## 1. Bootstrap state and GitHub OIDC

Confirm the intended account first:

```powershell
aws sts get-caller-identity
aws configure get region
```

Then run the bootstrap root locally:

```powershell
Set-Location infra/bootstrap
Copy-Item terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

GitHub's OIDC provider is account-wide. If
`token.actions.githubusercontent.com` already exists, set
`create_github_oidc_provider = false` and put its ARN in
`existing_github_oidc_provider_arn`; do not create a second owner for it.

The first apply uses local bootstrap state because the state bucket does not
exist yet. After it succeeds, copy `backend.tf.example` to the ignored
`backend.tf`, replace its bucket placeholder with `state_bucket_name`, confirm
the region, then migrate:

```powershell
terraform init -migrate-state
```

Keep S3 bucket deletion protection enabled. The bucket uses encryption,
versioning, blocked public access, TLS-only access, and S3 lockfiles.

## 2. Configure the GitHub production environment

Create a GitHub environment named `production`. Restrict deployment branches to
`main` and add approval protection if the repository plan supports it.

Add these environment or repository variables from bootstrap outputs:

| Variable | Value |
| --- | --- |
| `AWS_REGION` | Deployment region, such as `us-east-1` |
| `AWS_TERRAFORM_ROLE_ARN` | `terraform_production_role_arn` |
| `TF_STATE_BUCKET` | `state_bucket_name` |

Optional Terraform inputs are `INSTANCE_TYPE`, `DOMAIN_NAME`,
`ROUTE53_ZONE_ID`, and `ALARM_SNS_TOPIC_ARN`.

The OIDC subject is exact:

```text
repo:GinaUnderwood/detective-reader:environment:production
```

Pull requests and pushes only format and validate in the standalone Terraform
workflow. The production release workflow always plans and applies Terraform
before deploying the image for that same commit, so infrastructure and
application releases cannot race each other.

## 3. Apply production and populate Azure Speech

For the first deployment, keep the GitHub `production` environment behind an
approval, manually run the **Terraform** workflow after the three bootstrap
variables above are present, and approve that apply. The application deployment
workflow cannot succeed yet because its deploy role is intentionally created by
this first production apply.

The release workflow reads its deploy role, ECR, SSM, CloudWatch, and public URL
directly from Terraform outputs. They do not need to be duplicated as GitHub
variables.

Only after the Azure secret below is populated should the first **Deploy
production** run be approved. Subsequent `main` pushes first run the release
tests, then apply Terraform, then deploy automatically, subject to the
environment's configured protection.

Populate `azure_speech_secret_name` through the AWS Secrets Manager console or
from a short-lived local file. Its JSON schema is:

```json
{
  "AZURE_SPEECH_KEY": "replace-locally",
  "AZURE_SPEECH_REGION": "eastus"
}
```

The voice, pitch, and audio format are pinned in deployment code rather than
stored as mutable secret fields. Each candidate release must complete one
short Ava synthesis before it is recorded healthy.

If using the CLI, avoid putting the value directly in shell history:

```powershell
aws secretsmanager put-secret-value `
  --secret-id detective-reader/production/azure-speech `
  --secret-string file://azure-speech.secret.json
```

Keep that local JSON file out of Git and remove it securely after use.

## 4. DNS and first release

When Route 53 is not authoritative, create an `A` record at the current DNS
provider pointing the chosen hostname to Terraform's `public_ip`. Set
`DOMAIN_NAME` and `PRODUCTION_URL=https://your-hostname` before the production
apply/deploy. Caddy obtains and renews the certificate after DNS resolves.

Every push to `main` runs CI, builds or reuses the commit's immutable ECR image,
deploys its digest through SSM, probes the public `/api/ready`, and records the
confirmed digest in Parameter Store. GitHub and the host both serialize
deployments.

For a manual rollback, run **Deploy production** with:

- `image_digest`: an existing `sha256:...` digest from ECR
- `commit_sha`: its full 40-character source commit

The ECR lifecycle retains 25 tagged releases. Do not delete a digest that may
still be needed for rollback or host recovery.

## Operations

Use Session Manager rather than SSH:

```powershell
aws ssm start-session --target INSTANCE_ID
```

Useful host checks:

```bash
sudo systemctl status detective-reader
sudo docker compose --env-file /opt/detective-reader/deploy.env \
  --file /opt/detective-reader/compose.yaml ps
sudo docker compose --env-file /opt/detective-reader/deploy.env \
  --file /opt/detective-reader/compose.yaml logs --tail 200
```

Application and Caddy logs also go to
`/detective-reader/production/containers`. The default alarm has no notification
destination unless `ALARM_SNS_TOPIC_ARN` is configured.

Because this is one EC2 instance, OS replacement, host failure, and container
replacement can cause an outage. The next resilience step would be an ALB plus
an Auto Scaling Group across two availability zones.
