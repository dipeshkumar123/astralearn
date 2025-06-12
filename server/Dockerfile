# AstraLearn Backend Dockerfile
# Enhanced for Phase 6: Testing & Deployment

# Base image with security updates
FROM node:18-alpine AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init python3 make g++ && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Dependencies stage
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
RUN npm ci
COPY . .
# Add build step if needed (e.g., TypeScript compilation)
# RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install security updates and dumb-init
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl && \
    rm -rf /var/cache/apk/*

# Create non-root user early
RUN addgroup -g 1001 -S nodejs && \
    adduser -S astralearn -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy application code with proper ownership
COPY --chown=astralearn:nodejs ./src ./src

# Set secure environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    NODE_OPTIONS="--max-old-space-size=1024" \
    UV_THREADPOOL_SIZE=4

# Create directories for logs, uploads, and cache
RUN mkdir -p /app/logs /app/uploads /app/cache && \
    chown -R astralearn:nodejs /app/logs /app/uploads /app/cache

# Remove unnecessary files for security
RUN rm -rf /app/tests /app/.git /app/testSuite

# Switch to non-root user
USER astralearn

# Expose port
EXPOSE 3001

# Enhanced health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
