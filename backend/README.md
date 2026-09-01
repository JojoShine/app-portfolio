# App Portfolio Backend

Express + Prisma + PostgreSQL 的 API 底座。

## 代码分层

- `src/system` 放置认证、用户、文件和应用目录等系统能力。
- `src/modules` 只放 H5 业务模块，每个模块按需拆分路由、控制器、业务服务、数据库入口与迁移。
- `prisma/schema` 按领域合并管理系统模型和招生模型，业务模块通过自身 `db` 入口访问 Prisma Client。

## 本地运行

```bash
docker compose -f ../compose.yaml up -d postgres minio minio-init
npm install
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

本地未创建 `.env` 时，后端和 Prisma CLI 会自动回退读取 `.env.example`；如需改写参数，创建 `.env` 即可覆盖。

## 安全默认值

- 应用和分类查询是公开接口。
- 应用和分类写操作需要 `admin` 角色。
- 用户管理需要 `admin` 角色。
- 文件接口需要登录，普通用户只能查看和删除自己的文件。
- 请求日志不记录请求体，避免泄露业务敏感信息。
- 生产环境禁用本地开发令牌接口。

## 身份接入

API 接受带有 `sub`、`roles`、正确 issuer 和 audience 的 JWT access token。本地联调可在 `.env` 显式开启 `ENABLE_DEV_AUTH`，然后请求：

```http
POST /api/auth/development-token
Content-Type: application/json

{
  "devSecret": "<DEV_AUTH_SECRET>",
  "userId": "local-user",
  "displayName": "Local User",
  "roles": ["admin"]
}
```

真实身份平台接入时，保持 `req.user = { id, displayName, roles }` 边界即可，业务模块不需感知具体登录载体。

## 文件能力

MinIO 默认关闭。只有设置 `FILE_STORAGE_ENABLED=true` 并补齐 MinIO 配置后，文件接口才会可用。
