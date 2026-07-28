locals {
  state_bucket_name = var.state_bucket_name != "" ? var.state_bucket_name : (
    "${var.project_name}-tfstate-${data.aws_caller_identity.current.account_id}-${var.aws_region}"
  )

  github_oidc_provider_arn = var.create_github_oidc_provider ? (
    aws_iam_openid_connect_provider.github[0].arn
  ) : var.existing_github_oidc_provider_arn

  production_name = "${var.project_name}-production"
  github_subject  = "repo:${var.github_repository}:environment:${var.github_environment}"
}
