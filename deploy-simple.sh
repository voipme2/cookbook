#!/bin/bash
# Simple deployment script - pulls image first, then updates
# Safer than stop/up but still has brief downtime during restart
# Usage: ./deploy-simple.sh [image-tag]

set -euo pipefail

IMAGE_TAG="${1:-latest}"
IMAGE_NAME="${IMAGE_NAME:-cookbook}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 Deploying ${IMAGE_NAME}:${IMAGE_TAG}${NC}"

# Step 1: Pull image first (fail fast if it doesn't exist)
echo -e "${YELLOW}📥 Pulling image...${NC}"
if ! docker pull "${IMAGE_NAME}:${IMAGE_TAG}"; then
    echo -e "${RED}❌ Failed to pull image${NC}"
    exit 1
fi

# Step 2: Create override file
OVERRIDE_FILE="docker-compose.override.yml"
cat > "$OVERRIDE_FILE" <<EOF
services:
  app:
    image: ${IMAGE_NAME}:${IMAGE_TAG}
EOF

# Step 3: Restart with new image
echo -e "${YELLOW}🔄 Restarting container...${NC}"
if ! docker compose up -d --no-deps app; then
    echo -e "${RED}❌ Failed to start container${NC}"
    rm -f "$OVERRIDE_FILE"
    exit 1
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${CYAN}📊 Current version: ${IMAGE_NAME}:${IMAGE_TAG}${NC}"

