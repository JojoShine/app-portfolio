# App Portfolio

面向移动端 H5 应用的聚合容器和通用 API 底座。当前仓库只保留平台能力，业务应用将按模块显式接入。

## 本地启动

1. 启动本地 PostgreSQL 和 MinIO：

   ```bash
   docker compose up -d postgres minio minio-init
   ```

2. 配置并启动后端：

   ```bash
   cd backend
   npm ci
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

3. 启动前端：

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

前端默认访问 `http://localhost:5173`，后端默认访问 `http://localhost:3000`。

## 质量检查

```bash
cd frontend && npm run lint && npm run build
cd backend && npm run check && npm test
```

## 目录

- `frontend/src/app`：平台配置、布局、路由与应用注册。
- `frontend/src/features`：平台自身功能。
- `frontend/src/shared`：请求、会话、组件和跨应用能力。
- `frontend/src/modules`：后续接入的独立业务应用。
- `backend/src/system`：认证、用户、文件和应用目录等系统能力。
- `backend/src/modules`：按分层组织的 H5 业务模块。
- `backend/src/common`：授权、错误、响应和日志等通用能力。
- `backend/prisma`：Prisma Schema、Migration 和 Seed。

架构边界和新应用接入方式见 [docs/architecture.md](docs/architecture.md)。
