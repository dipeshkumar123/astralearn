# AstraLearn Backend Dockerfile
# Part of Phase 3 Step 3: Production Optimization & Advanced Features

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S astralearn -u 1001

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy application code
COPY --chown=astralearn:nodejs . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S astralearn -u 1001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Create directories for logs and uploads
RUN mkdir -p /app/logs /app/uploads && \
    chown -R astralearn:nodejs /app/logs /app/uploads

# Switch to non-root user
USER astralearn

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
