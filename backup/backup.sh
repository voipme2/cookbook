#!/bin/bash

# Smart backup script that only creates new backups when data has changed
set -e

# Configuration
DB_NAME="cookbook"
DB_USER="cookbook"
DB_PASSWORD="cookbook1234"
S3_BUCKET="voipme2-cookbook"
S3_PREFIX="backups"
BACKUP_DIR="/tmp/cookbook_backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate current backup filename
current_backup="dump_$(date +"%Y-%m-%d_%H_%M_%S").sql.gz"

# Create a temporary dump to calculate hash
echo "Creating temporary database dump..."
temp_dump="/tmp/temp_dump.sql"
docker exec -t -e PGPASSWORD="$DB_PASSWORD" db pg_dumpall -c -l "$DB_NAME" -U "$DB_USER" > "$temp_dump"

# Calculate hash of the dump content
echo "Calculating content hash..."
content_hash=$(sha256sum "$temp_dump" | cut -d' ' -f1)
echo "Content hash: $content_hash"

# Check if we have a previous backup and compare hashes
latest_backup_file="$BACKUP_DIR/latest_backup_hash.txt"
if [ -f "$latest_backup_file" ]; then
    previous_hash=$(cat "$latest_backup_file")
    echo "Previous backup hash: $previous_hash"
    
    if [ "$content_hash" = "$previous_hash" ]; then
        echo "✅ No changes detected. Skipping backup."
        rm "$temp_dump"
        exit 0
    else
        echo "🔄 Changes detected. Creating new backup..."
    fi
else
    echo "📝 No previous backup found. Creating first backup..."
fi

# Compress the dump
echo "Compressing backup..."
gzip "$temp_dump"
mv "${temp_dump}.gz" "$BACKUP_DIR/$current_backup"

# Upload to S3
echo "Uploading to S3..."
/usr/local/bin/aws s3 cp "$BACKUP_DIR/$current_backup" "s3://$S3_BUCKET/$S3_PREFIX/"

# Save the hash for next comparison
echo "$content_hash" > "$latest_backup_file"

# Clean up old local backups (keep last 5)
echo "Cleaning up old local backups..."
cd "$BACKUP_DIR"
ls -t dump_*.sql.gz | tail -n +6 | xargs -r rm

echo "✅ Backup completed successfully: $current_backup" 