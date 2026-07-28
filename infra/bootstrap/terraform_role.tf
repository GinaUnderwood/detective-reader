resource "aws_iam_role" "terraform_production" {
  name                 = "${local.production_name}-terraform"
  description          = "Terraform production role for ${var.github_repository}"
  assume_role_policy   = data.aws_iam_policy_document.github_actions_assume_role.json
  max_session_duration = 3600
}

data "aws_iam_policy_document" "terraform_production" {
  statement {
    sid = "ReadStateBucket"
    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket",
    ]
    resources = [aws_s3_bucket.terraform_state.arn]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values = [
        var.production_state_key,
        "${var.production_state_key}.tflock",
      ]
    }
  }

  statement {
    sid = "ReadWriteProductionState"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = [
      "${aws_s3_bucket.terraform_state.arn}/${var.production_state_key}",
    ]
  }

  statement {
    sid = "LockProductionState"
    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = [
      "${aws_s3_bucket.terraform_state.arn}/${var.production_state_key}.tflock",
    ]
  }

  statement {
    sid = "ReadInfrastructure"
    actions = [
      "cloudwatch:DescribeAlarms",
      "cloudwatch:ListTagsForResource",
      "ec2:Describe*",
      "ecr:Describe*",
      "ecr:GetLifecyclePolicy",
      "ecr:GetRepositoryPolicy",
      "ecr:ListImages",
      "ecr:ListTagsForResource",
      "iam:Get*",
      "iam:List*",
      "logs:DescribeLogGroups",
      "logs:ListTagsForResource",
      "route53:GetHostedZone",
      "route53:GetChange",
      "route53:ListHostedZones",
      "route53:ListResourceRecordSets",
      "route53:ListTagsForResource",
      "secretsmanager:DescribeSecret",
      "secretsmanager:GetResourcePolicy",
      "secretsmanager:ListSecretVersionIds",
      "ssm:DescribeDocument",
      "ssm:DescribeDocumentPermission",
      "ssm:DescribeParameters",
      "ssm:GetDocument",
      "ssm:GetParameter",
      "ssm:ListTagsForResource",
      "sts:GetCallerIdentity",
    ]
    resources = ["*"]
  }

  # EC2 control-plane APIs require wildcard resources for several create and
  # association calls. This role is isolated behind the protected GitHub
  # production environment and is not shared with application deployments.
  statement {
    sid = "ManageProductionEc2"
    actions = [
      "ec2:AllocateAddress",
      "ec2:AssociateAddress",
      "ec2:AssociateRouteTable",
      "ec2:AttachInternetGateway",
      "ec2:AuthorizeSecurityGroupEgress",
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:CreateInternetGateway",
      "ec2:CreateRoute",
      "ec2:CreateRouteTable",
      "ec2:CreateSecurityGroup",
      "ec2:CreateSubnet",
      "ec2:CreateTags",
      "ec2:CreateVpc",
      "ec2:DeleteInternetGateway",
      "ec2:DeleteRoute",
      "ec2:DeleteRouteTable",
      "ec2:DeleteSecurityGroup",
      "ec2:DeleteSubnet",
      "ec2:DeleteTags",
      "ec2:DeleteVpc",
      "ec2:DetachInternetGateway",
      "ec2:DisassociateAddress",
      "ec2:DisassociateRouteTable",
      "ec2:ModifyInstanceAttribute",
      "ec2:ModifySubnetAttribute",
      "ec2:ModifyVpcAttribute",
      "ec2:ReleaseAddress",
      "ec2:ReplaceRoute",
      "ec2:RevokeSecurityGroupEgress",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:RunInstances",
      "ec2:StartInstances",
      "ec2:StopInstances",
      "ec2:TerminateInstances",
    ]
    resources = ["*"]
  }

  statement {
    sid = "ManageProductionIam"
    actions = [
      "iam:AddRoleToInstanceProfile",
      "iam:AttachRolePolicy",
      "iam:CreateInstanceProfile",
      "iam:CreateRole",
      "iam:DeleteInstanceProfile",
      "iam:DeleteRole",
      "iam:DeleteRolePolicy",
      "iam:DetachRolePolicy",
      "iam:PassRole",
      "iam:PutRolePolicy",
      "iam:RemoveRoleFromInstanceProfile",
      "iam:TagInstanceProfile",
      "iam:TagRole",
      "iam:UntagInstanceProfile",
      "iam:UntagRole",
      "iam:UpdateAssumeRolePolicy",
      "iam:UpdateRoleDescription",
    ]
    resources = [
      "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:instance-profile/${local.production_name}-*",
      "arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:role/${local.production_name}-*",
    ]
  }

  statement {
    sid = "CreateProductionEcrAndSecrets"
    actions = [
      "ecr:CreateRepository",
      "secretsmanager:CreateSecret",
    ]
    resources = ["*"]
  }

  statement {
    sid = "ManageProductionEcr"
    actions = [
      "ecr:DeleteLifecyclePolicy",
      "ecr:DeleteRepository",
      "ecr:PutImageScanningConfiguration",
      "ecr:PutImageTagMutability",
      "ecr:PutLifecyclePolicy",
      "ecr:SetRepositoryPolicy",
      "ecr:TagResource",
      "ecr:UntagResource",
    ]
    resources = [
      "arn:${data.aws_partition.current.partition}:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/${local.production_name}",
    ]
  }

  statement {
    sid = "ManageProductionSecret"
    actions = [
      "secretsmanager:DeleteResourcePolicy",
      "secretsmanager:DeleteSecret",
      "secretsmanager:PutResourcePolicy",
      "secretsmanager:RestoreSecret",
      "secretsmanager:TagResource",
      "secretsmanager:UntagResource",
      "secretsmanager:UpdateSecret",
    ]
    resources = [
      "arn:${data.aws_partition.current.partition}:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:${var.project_name}/production/azure-speech-*",
    ]
  }

  statement {
    sid = "ManageProductionSystemsManager"
    actions = [
      "ssm:AddTagsToResource",
      "ssm:CreateDocument",
      "ssm:DeleteDocument",
      "ssm:DeleteParameter",
      "ssm:PutParameter",
      "ssm:RemoveTagsFromResource",
      "ssm:UpdateDocument",
      "ssm:UpdateDocumentDefaultVersion",
    ]
    resources = ["*"]
  }

  statement {
    sid = "ManageProductionLogsAndAlarms"
    actions = [
      "cloudwatch:DeleteAlarms",
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:TagResource",
      "cloudwatch:UntagResource",
      "logs:CreateLogGroup",
      "logs:DeleteLogGroup",
      "logs:DeleteRetentionPolicy",
      "logs:PutRetentionPolicy",
      "logs:TagResource",
      "logs:UntagResource",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "ManageOptionalDns"
    actions   = ["route53:ChangeResourceRecordSets"]
    resources = ["arn:${data.aws_partition.current.partition}:route53:::hostedzone/*"]
  }
}

resource "aws_iam_role_policy" "terraform_production" {
  name   = "${local.production_name}-terraform"
  role   = aws_iam_role.terraform_production.id
  policy = data.aws_iam_policy_document.terraform_production.json
}
