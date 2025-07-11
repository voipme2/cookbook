FROM node:17-alpine AS builder

WORKDIR /app

# Install dependencies (including dev dependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:17-alpine AS runner

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

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
