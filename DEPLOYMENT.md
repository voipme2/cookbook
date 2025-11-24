# Deployment Guide

This guide covers recommended deployment strategies for production.

## Quick Start

### Recommended: Health-Checked Deployment (Zero-Downtime)

```bash
chmod +x deploy.sh
./deploy.sh [image-tag]
```

**Example:**
```bash
./deploy.sh v1.2.3
# or
./deploy.sh latest
```

**What it does:**
1. ✅ Pulls the new image first (fails fast if image doesn't exist)
2. ✅ Starts a temporary container with the new image
3. ✅ Waits for health check to pass (configurable timeout)
4. ✅ Only switches to new version if healthy
5. ✅ Automatically rolls back if health check fails
6. ⚠️ Brief downtime (2-5 seconds) during the final switch

**Environment Variables:**
```bash
export IMAGE_NAME="your-registry/cookbook"  # Default: cookbook
export HEALTH_CHECK_TIMEOUT=60              # Default: 60 seconds
export HEALTH_CHECK_INTERVAL=5              # Default: 5 seconds
```

### Simple Deployment (Minimal Downtime)

```bash
chmod +x deploy-simple.sh
./deploy-simple.sh [image-tag]
```

**What it does:**
1. ✅ Pulls image first (fail fast)
2. ✅ Restarts container with new image
3. ⚠️ Brief downtime during restart (~5-10 seconds)

**Use when:**
- You trust your CI/CD pipeline
- Brief downtime is acceptable
- You want the simplest process

## Comparison

| Method | Downtime | Safety | Complexity |
|--------|----------|--------|------------|
| `docker compose stop app && docker compose up -d` | High | Low | Simple |
| `deploy-simple.sh` | Medium | Medium | Simple |
| `deploy.sh` | Low | High | Medium |

## Manual Deployment

If you prefer manual control:

```bash
# 1. Pull the new image
docker pull cookbook:v1.2.3

# 2. Create override file
cat > docker-compose.override.yml <<EOF
services:
  app:
    image: cookbook:v1.2.3
EOF

# 3. Restart the service
docker compose up -d --no-deps app

# 4. Verify
docker ps --filter "name=cookbook"
docker logs cookbook
```

## Rollback

If something goes wrong:

```bash
# Remove the override file to use the image specified in docker-compose.yml
rm docker-compose.override.yml

# Restart
docker compose up -d --no-deps app
```

Or manually specify the previous image:

```bash
# Create override with previous version
cat > docker-compose.override.yml <<EOF
services:
  app:
    image: cookbook:v1.2.2
EOF

docker compose up -d --no-deps app
```

## Best Practices

1. **Always pull images first** - This ensures the image exists before stopping the current container
2. **Use tagged versions** - Avoid `latest` in production; use semantic versions like `v1.2.3`
3. **Test in staging** - Deploy to a staging environment first
4. **Monitor after deployment** - Check logs and metrics after each deployment
5. **Keep previous images** - Don't delete old images immediately; keep them for quick rollback

## Troubleshooting

### Image not found
```bash
# Check if image exists locally
docker images | grep cookbook

# Check if you need to pull from registry
docker pull your-registry/cookbook:v1.2.3
```

### Container won't start
```bash
# Check logs
docker logs cookbook

# Check container status
docker ps -a | grep cookbook

# Try starting manually
docker compose up app
```

### Health check failing
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' cookbook

# Check health check logs
docker inspect --format='{{json .State.Health}}' cookbook | jq
```

