# Multi-stage build untuk optimisasi ukuran image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy semua file untuk build
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies backend
WORKDIR /app/backend
RUN npm install

# Install dependencies frontend
WORKDIR /app/frontend
RUN npm install

# Build frontend
COPY frontend/ /app/frontend/
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install dumb-init untuk signal handling
RUN apk add --no-cache dumb-init

# Copy dari builder stage
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist

# Copy source code backend
COPY backend/ ./backend/

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run dengan dumb-init untuk proper signal handling
ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["npm", "start"]
