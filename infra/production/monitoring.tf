resource "aws_cloudwatch_log_group" "app" {
  name              = "/${var.project_name}/${var.environment}/containers"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_metric_alarm" "instance_status" {
  alarm_name          = "${local.name}-instance-status"
  alarm_description   = "The production EC2 host failed an instance or system status check."
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed"
  statistic           = "Maximum"
  period              = 300
  evaluation_periods  = 2
  datapoints_to_alarm = 2
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    InstanceId = aws_instance.app.id
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []
  ok_actions    = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []
}
