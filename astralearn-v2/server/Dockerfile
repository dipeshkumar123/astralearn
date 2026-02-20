# Multi-stage Dockerfile for AstraLearn Backend

# Base stage
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
COPY package*.json ./
COPY shared/package*.json ./shared/
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
COPY package*.json ./
COPY shared/package*.json ./shared/
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S astralearn -u 1001
USER astralearn

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000
CMD ["node", "dist/index.js"]
