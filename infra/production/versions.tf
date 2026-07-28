terraform {
  required_version = ">= 1.15.0, < 1.16.0"

  backend "s3" {
    key          = "detective-reader/production/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}
