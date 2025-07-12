#!/bin/bash

# Advanced backup script using row counts and timestamps for change detection
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

# Function to get database statistics
get_db_stats() {
    docker exec -t -e PGPASSWORD="$DB_PASSWORD" db psql -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT 
            COUNT(*) as total_recipes,
            MAX(recipe->>'updated_at') as last_updated,
            COUNT(DISTINCT recipe->>'id') as unique_recipes
        FROM recipes;
    " | tr -d ' '
}

# Get current database statistics
echo "Checking database statistics..."
current_stats=$(get_db_stats)
echo "Current stats: $current_stats"

# Check if we have previous stats
stats_file="$BACKUP_DIR/latest_stats.txt"
if [ -f "$stats_file" ]; then
    previous_stats=$(cat "$stats_file")
    echo "Previous stats: $previous_stats"
    
    if [ "$current_stats" = "$previous_stats" ]; then
        echo "✅ No changes detected in database statistics. Skipping backup."
        exit 0
    else
        echo "🔄 Changes detected in database. Creating new backup..."
    fi
else
    echo "📝 No previous stats found. Creating first backup..."
fi

# Generate backup filename
current_backup="dump_$(date +"%Y-%m-%d_%H_%M_%S").sql.gz"

# Create and compress backup
echo "Creating database backup..."
docker exec -t -e PGPASSWORD="$DB_PASSWORD" db pg_dumpall -c -l "$DB_NAME" -U "$DB_USER" | gzip > "$BACKUP_DIR/$current_backup"

# Upload to S3
echo "Uploading to S3..."
/usr/local/bin/aws s3 cp "$BACKUP_DIR/$current_backup" "s3://$S3_BUCKET/$S3_PREFIX/"

# Save current stats for next comparison
echo "$current_stats" > "$stats_file"

# Clean up old local backups (keep last 5)
echo "Cleaning up old local backups..."
cd "$BACKUP_DIR"
ls -t dump_*.sql.gz | tail -n +6 | xargs -r rm

echo "✅ Backup completed successfully: $current_backup" 