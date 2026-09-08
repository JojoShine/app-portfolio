# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

# --- Install all dependencies ---
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile

# --- Generate Prisma client ---
FROM deps AS build
WORKDIR /app

COPY apps/api/prisma apps/api/prisma/
RUN pnpm --filter @app-portfolio/api prisma:generate

# --- Production bundle via pnpm deploy ---
FROM build AS deploy
RUN pnpm deploy --filter @app-portfolio/api --prod /prod

# --- Runtime ---
FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

COPY --from=deploy /prod ./

USER appuser

EXPOSE 8000

CMD ["node", "src/index.js"]
