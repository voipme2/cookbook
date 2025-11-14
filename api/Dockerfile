FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (including dev dependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Install su-exec for running commands as different user
RUN apk add --no-cache su-exec

WORKDIR /app

# Install dependencies for production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Create images directory with proper permissions
RUN mkdir -p /app/images/temp && chown -R nodejs:nodejs /app/images

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Copy entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Set entrypoint to handle permissions
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Start the application (will be executed by entrypoint as nodejs user)
CMD ["su-exec", "nodejs", "npm", "run", "start"]
