# Base Image
FROM node:20-alpine AS base
WORKDIR /app


# Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Builder
FROM base AS builder

# Install full deps for build
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build Next.js (App Router, src/)
RUN npm run build

# Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tzdata
ENV TZ=Asia/Kolkata


# Non-root user (recommended)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy runtime files only
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Optional but recommended
COPY --from=builder /app/src ./src

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]

