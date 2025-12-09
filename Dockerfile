# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy root level dependencies
COPY package.json package-lock.json* bun.lockb* ./

# Install frontend dependencies
RUN npm install

# Copy all frontend config files
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts postcss.config.js tailwind.config.ts components.json ./

# Copy frontend source files
COPY src ./src
COPY public ./public
COPY index.html ./

# Build frontend with Vite
RUN npm run build

# Build stage for backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend dependencies
COPY backend/package.json backend/package-lock.json* ./

# Install backend dependencies
RUN npm install --production

# Final production stage
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy backend files and node_modules from backend builder
COPY --from=backend-builder /app/backend /app/backend
COPY backend/src /app/backend/src

# Copy built frontend from frontend builder
COPY --from=frontend-builder /app/dist /app/dist

WORKDIR /app/backend

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Set environment to production
ENV NODE_ENV=production

# Start backend server (which serves the frontend)
CMD ["node", "src/server.js"]
