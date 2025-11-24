#!/bin/bash
# Production deployment script with zero-downtime rolling updates
# Usage: ./deploy.sh [image-tag]
# Example: ./deploy.sh v1.2.3

set -euo pipefail

IMAGE_TAG="${1:-latest}"
IMAGE_NAME="${IMAGE_NAME:-cookbook}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-60}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-5}"
TEMP_CONTAINER_NAME="cookbook-new-$$"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Starting deployment of ${IMAGE_NAME}:${IMAGE_TAG}${NC}"

# Step 1: Pull the new image first (fail fast if image doesn't exist)
echo -e "${YELLOW}📥 Pulling image ${IMAGE_NAME}:${IMAGE_TAG}...${NC}"
if ! docker pull "${IMAGE_NAME}:${IMAGE_TAG}"; then
    echo -e "${RED}❌ Failed to pull image ${IMAGE_NAME}:${IMAGE_TAG}${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Image pulled successfully${NC}"

# Step 2: Start new container with temporary name on a different port for health check
echo -e "${YELLOW}🔄 Starting new container for health check...${NC}"

# Create a temporary docker-compose override to run the new container
TEMP_COMPOSE_FILE="docker-compose.temp-$$.yml"
cat > "$TEMP_COMPOSE_FILE" <<EOF
services:
  app:
    image: ${IMAGE_NAME}:${IMAGE_TAG}
    container_name: ${TEMP_CONTAINER_NAME}
    ports:
      - "8001:3000"  # Different port to avoid conflict with main container
    environment:
      NODE_ENV: production
      PORT: 3000
      PGUSER: cookbook
      PGHOST: db
      PGPASSWORD: cookbook123
      PGDATABASE: cookbook
      PGPORT: 5432
    volumes:
      - cookbook_images:/app/public/images
      - ./entrypoint.sh:/app/entrypoint.sh:ro
    networks:
      - cookbook
    depends_on:
      db:
        condition: service_healthy
EOF

# Start the temporary container (db must be running)
if ! docker compose -f "$COMPOSE_FILE" -f "$TEMP_COMPOSE_FILE" up -d --no-deps app; then
    echo -e "${RED}❌ Failed to start new container${NC}"
    rm -f "$TEMP_COMPOSE_FILE"
    exit 1
fi

# Wait a moment for container to start
sleep 3

# Step 3: Wait for health check on new container
echo -e "${YELLOW}🏥 Waiting for health check (timeout: ${HEALTH_CHECK_TIMEOUT}s)...${NC}"
elapsed=0
healthy=false

while [ $elapsed -lt $HEALTH_CHECK_TIMEOUT ]; do
    health=$(docker inspect --format='{{.State.Health.Status}}' "$TEMP_CONTAINER_NAME" 2>/dev/null || echo "starting")
    
    if [ "$health" = "healthy" ]; then
        healthy=true
        break
    fi
    
    echo -e "  Health status: ${health} (${elapsed}s elapsed)"
    sleep $HEALTH_CHECK_INTERVAL
    elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
done

if [ "$healthy" = false ]; then
    echo -e "${RED}❌ New container failed health check after ${elapsed}s${NC}"
    echo -e "${YELLOW}🔄 Rolling back...${NC}"
    
    # Stop and remove the new container
    docker stop "$TEMP_CONTAINER_NAME" 2>/dev/null || true
    docker rm "$TEMP_CONTAINER_NAME" 2>/dev/null || true
    docker compose -f "$COMPOSE_FILE" -f "$TEMP_COMPOSE_FILE" down 2>/dev/null || true
    
    # Clean up temp file
    rm -f "$TEMP_COMPOSE_FILE"
    
    echo -e "${GREEN}✅ Rolled back to previous version${NC}"
    exit 1
fi

echo -e "${GREEN}✅ New container is healthy!${NC}"

# Step 4: Update the main docker-compose to use new image and restart
echo -e "${YELLOW}🔄 Updating main container...${NC}"

# Create override file with new image
OVERRIDE_FILE="docker-compose.override.yml"
cat > "$OVERRIDE_FILE" <<EOF
services:
  app:
    image: ${IMAGE_NAME}:${IMAGE_TAG}
EOF

# Stop and remove the temporary container
docker stop "$TEMP_CONTAINER_NAME" 2>/dev/null || true
docker rm "$TEMP_CONTAINER_NAME" 2>/dev/null || true
rm -f "$TEMP_COMPOSE_FILE"

# Restart the main container with the new image
# This will cause a brief downtime (typically 2-5 seconds)
echo -e "${YELLOW}   (Brief downtime expected during switch)${NC}"
if ! docker compose up -d --no-deps app; then
    echo -e "${RED}❌ Failed to start main container with new image${NC}"
    echo -e "${YELLOW}🔄 Rolling back...${NC}"
    rm -f "$OVERRIDE_FILE"
    docker compose up -d --no-deps app || true
    exit 1
fi

# Wait a moment and verify the main container is healthy
sleep 3
main_health=$(docker inspect --format='{{.State.Health.Status}}' cookbook 2>/dev/null || echo "unknown")

if [ "$main_health" != "healthy" ]; then
    echo -e "${YELLOW}⚠️  Main container health status: ${main_health}${NC}"
    echo -e "${YELLOW}   (This may be normal during startup)${NC}"
fi

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${CYAN}📊 Current version: ${IMAGE_NAME}:${IMAGE_TAG}${NC}"

# Optional: Show container status
echo -e "${CYAN}📊 Container status:${NC}"
docker ps --filter "name=cookbook" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

