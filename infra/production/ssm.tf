locals {
  escaped_ecr_repository_url = replace(aws_ecr_repository.app.repository_url, ".", "\\.")
}

resource "aws_ssm_document" "deploy" {
  name            = "${local.name}-deploy"
  document_type   = "Command"
  document_format = "JSON"

  content = jsonencode({
    schemaVersion = "2.2"
    description   = "Deploy one approved Detective Reader ECR digest with host-side health checks and rollback."
    parameters = {
      ImageUri = {
        type           = "String"
        description    = "Full ECR repository URI pinned by sha256 digest."
        allowedPattern = "^${local.escaped_ecr_repository_url}@sha256:[0-9a-f]{64}$"
      }
      CommitSha = {
        type           = "String"
        description    = "Full Git commit corresponding to the image."
        allowedPattern = "^[0-9a-f]{40}$"
      }
    }
    mainSteps = [
      {
        action = "aws:runShellScript"
        name   = "deployDigest"
        inputs = {
          timeoutSeconds = "900"
          runCommand = [
            "set -euo pipefail",
            "cloud-init status --wait",
            "test -x /usr/local/sbin/detective-reader-deploy",
            "/usr/local/sbin/detective-reader-deploy '{{ ImageUri }}' '{{ CommitSha }}'",
          ]
        }
      },
    ]
  })

  tags = {
    Name = "${local.name}-deploy"
  }
}
