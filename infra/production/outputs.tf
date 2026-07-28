output "instance_id" {
  value = aws_instance.app.id
}

output "public_ip" {
  value = aws_eip.app.public_ip
}

output "site_url" {
  value = var.domain_name != "" ? "https://${lower(var.domain_name)}" : "http://${aws_eip.app.public_ip}"
}

output "ecr_repository_name" {
  value = aws_ecr_repository.app.name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "github_deploy_role_arn" {
  description = "Set this as the GitHub AWS_DEPLOY_ROLE_ARN variable."
  value       = aws_iam_role.github_deploy.arn
}

output "ssm_deploy_document_name" {
  value = aws_ssm_document.deploy.name
}

output "current_release_parameter" {
  value = aws_ssm_parameter.current_release.name
}

output "azure_speech_secret_name" {
  description = "Populate this secret out of band; Terraform creates no secret version."
  value       = aws_secretsmanager_secret.azure_speech.name
}

output "cloudwatch_log_group" {
  value = aws_cloudwatch_log_group.app.name
}

output "github_oidc_subject" {
  value = local.github_subject
}
