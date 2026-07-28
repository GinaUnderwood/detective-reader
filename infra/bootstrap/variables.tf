variable "aws_region" {
  description = "AWS region for the state bucket and production deployment."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Stable prefix used for bootstrap resources."
  type        = string
  default     = "detective-reader"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$", var.project_name))
    error_message = "project_name must be 3-32 lowercase letters, digits, or hyphens."
  }
}

variable "github_repository" {
  description = "GitHub owner/repository allowed to request AWS credentials."
  type        = string
  default     = "GinaUnderwood/detective-reader"

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repository))
    error_message = "github_repository must use the owner/repository form."
  }
}

variable "github_environment" {
  description = "Protected GitHub environment included in the OIDC subject."
  type        = string
  default     = "production"
}

variable "state_bucket_name" {
  description = "Globally unique S3 bucket name. An account-and-region-based name is generated when blank."
  type        = string
  default     = ""

  validation {
    condition     = var.state_bucket_name == "" || can(regex("^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$", var.state_bucket_name))
    error_message = "state_bucket_name must be a valid lowercase S3 bucket name."
  }
}

variable "production_state_key" {
  description = "S3 object key used by the production Terraform root."
  type        = string
  default     = "detective-reader/production/terraform.tfstate"
}

variable "create_github_oidc_provider" {
  description = "Create the account-wide GitHub Actions OIDC provider. Set false when the account already has one."
  type        = bool
  default     = true
}

variable "existing_github_oidc_provider_arn" {
  description = "Existing token.actions.githubusercontent.com provider ARN when create_github_oidc_provider is false."
  type        = string
  default     = ""

  validation {
    condition = (
      var.create_github_oidc_provider ||
      can(regex("^arn:[^:]+:iam::[0-9]{12}:oidc-provider/token\\.actions\\.githubusercontent\\.com$", var.existing_github_oidc_provider_arn))
    )
    error_message = "Supply the existing GitHub OIDC provider ARN when provider creation is disabled."
  }
}
