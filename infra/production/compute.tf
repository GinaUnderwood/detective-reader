locals {
  host_environment = <<-EOT
    APP_DIR=${local.app_dir}
    AWS_REGION=${var.aws_region}
    CADDY_IMAGE=caddy:2.11.4-alpine
    CLOUDWATCH_LOG_GROUP=${aws_cloudwatch_log_group.app.name}
    CURRENT_RELEASE_PARAMETER=${aws_ssm_parameter.current_release.name}
    ECR_REPOSITORY_URL=${aws_ecr_repository.app.repository_url}
    SECRET_ID=${aws_secretsmanager_secret.azure_speech.arn}
    SITE_ADDRESS=${local.site_address}
  EOT
}

resource "aws_instance" "app" {
  ami                         = local.ami_id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.app.id]
  iam_instance_profile        = aws_iam_instance_profile.app.name
  associate_public_ip_address = true
  user_data_replace_on_change = true

  user_data = templatefile("${path.module}/templates/user-data.sh.tftpl", {
    caddyfile_b64        = base64encode(file("${path.module}/../../deploy/Caddyfile"))
    compose_yaml_b64     = base64encode(file("${path.module}/../../deploy/compose.yaml"))
    compose_version      = var.docker_compose_version
    deploy_script_b64    = base64encode(file("${path.module}/../../deploy/deploy-image.sh"))
    host_environment_b64 = base64encode(local.host_environment)
    service_unit_b64     = base64encode(file("${path.module}/../../deploy/detective-reader.service"))
    start_script_b64     = base64encode(file("${path.module}/../../deploy/start-image.sh"))
  })

  metadata_options {
    http_endpoint               = "enabled"
    http_protocol_ipv6          = "disabled"
    http_put_response_hop_limit = 1
    http_tokens                 = "required"
    instance_metadata_tags      = "disabled"
  }

  root_block_device {
    encrypted             = true
    delete_on_termination = true
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    iops                  = 3000
    throughput            = 125

    tags = {
      Name = "${local.name}-root"
    }
  }

  volume_tags = {
    Name = "${local.name}-root"
  }

  tags = {
    Name      = local.name
    SSMTarget = local.name
  }

  depends_on = [
    aws_iam_role_policy.instance,
    aws_iam_role_policy_attachment.instance_ssm,
    aws_route_table_association.public,
  ]
}

resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name = "${local.name}-eip"
  }
}

resource "aws_eip_association" "app" {
  allocation_id = aws_eip.app.id
  instance_id   = aws_instance.app.id
}
