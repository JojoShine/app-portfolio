FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@8.9.2 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @app-portfolio/web
COPY apps/web apps/web
RUN pnpm --filter @app-portfolio/web build

FROM nginx:stable-alpine AS runtime
COPY apps/web/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html/app-portfolio
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:3000/app-portfolio/index.html || exit 1
