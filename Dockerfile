FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the Remix app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install su-exec for running as non-root user
RUN apk add --no-cache su-exec

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Create images directory with proper permissions
RUN mkdir -p /app/public/images && chown -R nodejs:nodejs /app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Create startup script to run migrations and start app
RUN echo '#!/bin/sh\nset -e\necho "Running database migrations..."\nnpm run db:migrate\necho "Starting application..."\nnpm start' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Start the application with migrations
CMD ["su-exec", "nodejs", "/app/entrypoint.sh"]

