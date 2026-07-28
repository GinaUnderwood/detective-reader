variable "aws_region" {
  description = "AWS region for the production stack."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Stable application resource prefix."
  type        = string
  default     = "detective-reader"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$", var.project_name))
    error_message = "project_name must be 3-32 lowercase letters, digits, or hyphens."
  }
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "production"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,20}[a-z0-9]$", var.environment))
    error_message = "environment must be lowercase letters, digits, or hyphens."
  }
}

variable "github_repository" {
  description = "GitHub owner/repository trusted by the deployment role."
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

variable "instance_type" {
  description = "EC2 instance type for the single Docker host."
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "Optional pinned x86_64 Amazon Linux 2023 AMI. The current AWS public SSM value is used when blank."
  type        = string
  default     = ""

  validation {
    condition     = var.ami_id == "" || can(regex("^ami-[0-9a-f]+$", var.ami_id))
    error_message = "ami_id must be blank or a valid AMI ID."
  }
}

variable "availability_zone" {
  description = "Optional availability zone. The first available zone is used when blank."
  type        = string
  default     = ""
}

variable "vpc_cidr" {
  description = "CIDR for the dedicated VPC."
  type        = string
  default     = "10.42.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr must be valid IPv4 CIDR notation."
  }
}

variable "public_subnet_cidr" {
  description = "CIDR for the single public subnet."
  type        = string
  default     = "10.42.1.0/24"

  validation {
    condition     = can(cidrhost(var.public_subnet_cidr, 0))
    error_message = "public_subnet_cidr must be valid IPv4 CIDR notation."
  }
}

variable "root_volume_size" {
  description = "Encrypted gp3 root volume size in GiB."
  type        = number
  default     = 20

  validation {
    condition     = var.root_volume_size >= 12 && var.root_volume_size <= 100
    error_message = "root_volume_size must be between 12 and 100 GiB."
  }
}

variable "domain_name" {
  description = "Public hostname for automatic Caddy HTTPS. Leave blank for an HTTP-only initial smoke test."
  type        = string
  default     = ""

  validation {
    condition = (
      var.domain_name == "" ||
      (
        length(var.domain_name) <= 253 &&
        can(regex("^([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+[A-Za-z]{2,63}$", var.domain_name))
      )
    )
    error_message = "domain_name must be blank or a hostname without a URL scheme or path."
  }
}

variable "domain_aliases" {
  description = "Additional public hostnames served by Caddy under the same automatic HTTPS configuration."
  type        = list(string)
  default     = []

  validation {
    condition = alltrue([
      for alias in var.domain_aliases :
      length(alias) <= 253 &&
      can(regex("^([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+[A-Za-z]{2,63}$", alias))
    ])
    error_message = "Every domain_aliases entry must be a hostname without a URL scheme or path."
  }

  validation {
    condition = (
      length(distinct([for alias in var.domain_aliases : lower(alias)])) ==
      length(var.domain_aliases)
    )
    error_message = "domain_aliases must not contain duplicate hostnames."
  }
}

variable "route53_zone_id" {
  description = "Optional Route 53 hosted zone ID. When set with domain_name, Terraform creates the A record."
  type        = string
  default     = ""
}

variable "azure_speech_secret_name" {
  description = "Secrets Manager container name. Terraform never manages its secret value."
  type        = string
  default     = ""
}

variable "docker_compose_version" {
  description = "Pinned Docker Compose plugin release installed on the host."
  type        = string
  default     = "v5.1.2"

  validation {
    condition     = can(regex("^v[0-9]+\\.[0-9]+\\.[0-9]+$", var.docker_compose_version))
    error_message = "docker_compose_version must be a vMAJOR.MINOR.PATCH release."
  }
}

variable "log_retention_days" {
  description = "CloudWatch application log retention."
  type        = number
  default     = 30
}

variable "alarm_sns_topic_arn" {
  description = "Optional existing SNS topic ARN for EC2 status-check alarm notifications."
  type        = string
  default     = ""
}
