locals {
  name              = "${var.project_name}-${var.environment}"
  availability_zone = var.availability_zone != "" ? var.availability_zone : sort(data.aws_availability_zones.available.names)[0]
  ami_id            = var.ami_id != "" ? var.ami_id : nonsensitive(data.aws_ssm_parameter.amazon_linux_2023.value)
  site_addresses = var.domain_name != "" ? distinct(concat(
    [lower(var.domain_name)],
    [for alias in var.domain_aliases : lower(alias)],
  )) : [":80"]
  site_address = join(", ", local.site_addresses)
  secret_name       = var.azure_speech_secret_name != "" ? var.azure_speech_secret_name : "${var.project_name}/${var.environment}/azure-speech"

  github_oidc_provider_arn = "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
  github_subject           = "repo:${var.github_repository}:environment:${var.github_environment}"

  app_dir                   = "/opt/${var.project_name}"
  current_release_parameter = "/${var.project_name}/${var.environment}/current-release"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
