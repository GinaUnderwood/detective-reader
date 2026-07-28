resource "aws_secretsmanager_secret" "azure_speech" {
  name                    = local.secret_name
  description             = "Azure Speech runtime configuration for ${local.name}; value is populated out of band."
  recovery_window_in_days = 30

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ssm_parameter" "current_release" {
  name        = local.current_release_parameter
  description = "Last production image digest and Git commit confirmed healthy by the deployment workflow."
  type        = "String"
  value       = "not-deployed"

  lifecycle {
    ignore_changes = [value]
  }
}
