# ========================================
# Stage 1: Dependencies (Production Only)
# ========================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ========================================
# Stage 2: Builder (Build Application)
# ========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# Build-time arguments for Next.js public environment variables
ARG NEXT_PUBLIC_KEYCLOAK_URL=https://auth.atparui.com
ARG NEXT_PUBLIC_KEYCLOAK_REALM=rms-demo
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=rms-demo-web
ARG NEXT_PUBLIC_API_ORIGIN=https://console.atparui.com
ARG NEXT_PUBLIC_API_BASE_URL=https://console.atparui.com/services/rms-service/api
ARG NEXT_PUBLIC_APP_KEY=rms-demo
ARG NEXT_PUBLIC_TENANT_ID=rms-demo

# Set environment variables for build
ENV NEXT_PUBLIC_KEYCLOAK_URL=${NEXT_PUBLIC_KEYCLOAK_URL}
ENV NEXT_PUBLIC_KEYCLOAK_REALM=${NEXT_PUBLIC_KEYCLOAK_REALM}
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}
ENV NEXT_PUBLIC_API_ORIGIN=${NEXT_PUBLIC_API_ORIGIN}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_KEY=${NEXT_PUBLIC_APP_KEY}
ENV NEXT_PUBLIC_TENANT_ID=${NEXT_PUBLIC_TENANT_ID}

# Build Next.js application (standalone output for Docker)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_STANDALONE_BUILD=true
RUN npm run build

# ========================================
# Stage 3: Runner (Optimized Production)
# ========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/.next && \
    chown -R nextjs:nodejs /app

# Copy only necessary files from builder (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["node", "server.js"]
