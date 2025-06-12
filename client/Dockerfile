# AstraLearn Frontend Dockerfile
# Enhanced for Phase 6: Testing & Deployment

# Build stage
FROM node:18-alpine AS build

# Install security updates and build dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache python3 make g++ && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build application with optimization
RUN npm run build

# Audit and optimize build
RUN npm audit --audit-level=high

# Production stage with nginx
FROM nginx:1.24-alpine AS production

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy additional static assets (if they exist)
RUN if [ -f /app/public/favicon.ico ]; then cp /app/public/favicon.ico /usr/share/nginx/html/; fi
RUN if [ -f /app/public/manifest.json ]; then cp /app/public/manifest.json /usr/share/nginx/html/; fi

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Set proper permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Remove sensitive files
RUN rm -rf /usr/share/nginx/html/*.map 2>/dev/null || true

# Switch to non-root user
USER nginx-user

# Expose port (using 8080 for non-privileged user)
EXPOSE 8080

# Enhanced health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || curl -f http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
