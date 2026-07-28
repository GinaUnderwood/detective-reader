output "state_bucket_name" {
  description = "Set this as the GitHub TF_STATE_BUCKET variable."
  value       = aws_s3_bucket.terraform_state.id
}

output "production_state_key" {
  value = var.production_state_key
}

output "github_oidc_provider_arn" {
  value = local.github_oidc_provider_arn
}

output "terraform_production_role_arn" {
  description = "Set this as the GitHub AWS_TERRAFORM_ROLE_ARN variable."
  value       = aws_iam_role.terraform_production.arn
}

output "github_oidc_subject" {
  value = local.github_subject
}
