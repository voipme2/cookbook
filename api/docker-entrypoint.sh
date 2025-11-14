#!/bin/sh
set -e

# Fix permissions for mounted volumes
# This ensures the nodejs user can write to the images directory
if [ -d "/app/images" ]; then
  # Change ownership to nodejs user (uid 1001)
  chown -R nodejs:nodejs /app/images || true
  chmod -R 755 /app/images || true
fi

# Execute the main command as the nodejs user
exec "$@"

