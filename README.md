# App Portfolio

独立创作者的应用市场。将自己做过的、考虑过的应用做成落地可运行的软件。

这是一个面向移动端 H5 应用的聚合容器和通用 API 底座，每个应用都是独立的功能模块，共享统一的认证、存储和部署基础设施。

## 项目结构

采用 pnpm workspace monorepo 结构：

```
app-portfolio/
├── apps/
│   ├── web/          # 前端 H5 应用（React + Vite + antd-mobile）
│   └── api/          # 后端 API 服务（Express + Prisma + PostgreSQL）
├── packages/         # 跨应用复用的共享包（预留）
├── compose.yaml      # 本地开发基础设施（PostgreSQL + MinIO）
└── apps/api/Dockerfile  # API 服务 Docker 镜像
```

### apps/web

前端应用，使用 React 18 + Vite 6 + Ant Design Mobile v5 + Zustand v5。

- `src/app`：平台配置、布局、路由与应用注册
- `src/features`：平台自身功能（应用目录、分类等）
- `src/shared`：请求、会话、组件和跨应用能力
- `src/modules`：独立业务应用模块（如报名系统）

### apps/api

后端 API 服务，使用 Express 5 + Prisma ORM + PostgreSQL。

- `src/system`：认证、用户、文件和应用目录等系统能力
- `src/modules`：按分层组织的 H5 业务模块
- `src/common`：授权、错误、响应和日志等通用能力
- `prisma`：Schema、Migration 和 Seed

## 本地开发

### 1. 启动基础设施

```bash
docker compose up -d
```

这会启动 PostgreSQL（端口 5433）和 MinIO（端口 9000/9001）。

### 2. 安装依赖

```bash
pnpm install
```

### 3. 初始化数据库

```bash
pnpm db:migrate:dev
```

### 4. 启动服务

```bash
# 启动后端 API
pnpm dev:api

# 启动前端 Web（新终端）
pnpm dev:web
```

访问地址：
- 前端：http://localhost:5173
- API：http://localhost:3000

## 部署

### API 服务

使用 Docker 部署：

```bash
docker build -f apps/api/Dockerfile -t app-portfolio-api .
docker run -p 8000:8000 --env-file .env app-portfolio-api
```

### 前端

构建后部署到 Nginx：

```bash
pnpm build:web
```

将 `apps/web/dist` 目录的内容部署到 Nginx。

## 质量检查

```bash
# 前端
pnpm --filter @app-portfolio/web lint
pnpm --filter @app-portfolio/web build

# 后端
pnpm --filter @app-portfolio/api check
pnpm --filter @app-portfolio/api test
```

## 技术栈

**前端**
- React 18 + Vite 6
- Ant Design Mobile v5
- Zustand v5（状态管理）
- Tailwind CSS 3
- Axios

**后端**
- Express 5
- Prisma ORM
- PostgreSQL 16
- MinIO（对象存储）
- JWT 认证

**基础设施**
- pnpm workspace
- Docker + Docker Compose
- PM2（可选，生产环境进程管理）
