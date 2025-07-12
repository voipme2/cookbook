#!/bin/bash

# Backup configuration file
# Copy this to backup_config.sh and modify as needed

# Database settings
export DB_NAME="cookbook"
export DB_USER="cookbook"
export DB_PASSWORD="cookbook1234"

# S3 settings
export S3_BUCKET="voipme2-cookbook"
export S3_PREFIX="backups"

# Local settings
export BACKUP_DIR="/tmp/cookbook_backups"

# Retention settings
export KEEP_LOCAL_BACKUPS=5  # Number of local backups to keep
export BACKUP_STRATEGY="hash"  # Options: "hash", "stats", "always"

# Notification settings (optional)
export NOTIFY_ON_SUCCESS=false
export NOTIFY_ON_SKIP=false
export SLACK_WEBHOOK_URL=""  # Set if you want Slack notifications 