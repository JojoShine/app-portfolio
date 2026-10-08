# App Portfolio

独立创作者的应用市场。将自己做过的、考虑过的应用做成落地可运行的软件。

这是一个面向移动端 H5 应用的聚合容器和通用 API 底座，每个应用都是独立的功能模块，共享统一的认证、存储和部署基础设施。

## 目前可体验的应用

目前已提供 **4 个可体验的应用**，可从应用市场首页进入，也可在本地启动后点击下方入口。

| 应用 | 可体验内容 | 本地体验入口 |
| --- | --- | --- |
| 招生报名 | 幼儿园入学、幼升小、小升初；学校选择、报名信息填写、材料提交与进度查询 | [进入招生报名](http://localhost:5173/enrollment) |
| 消费券 | 活动领券、我的券包、适用商户查询；商户扫码或手动核销、核销记录 | [进入消费券](http://localhost:5173/coupon) |
| 积分商城 | 每日签到、积分明细、商品与权益兑换、抵扣券、兑换订单、收藏与足迹、地址管理、客服反馈 | [进入积分商城](http://localhost:5173/green-points) |
| 通用答题 | 主题活动、在线答题、成绩反馈、答案回顾、排行榜与参与记录 | [进入通用答题](http://localhost:5173/quiz) |

### 快速体验

默认启用 Mock 演示模式，只启动前端即可体验以上应用，无需先启动数据库或后端：

```bash
pnpm install
pnpm dev:web
```

打开 [应用市场首页](http://localhost:5173)，选择应用进入。演示模式使用模拟数据，报名、领券、兑换、核销等操作不代表真实业务办理。若本地曾关闭 Mock，请将 `apps/web/.env` 中的 `VITE_USE_MOCK_API` 设为 `true`。

## 项目结构

采用 pnpm workspace monorepo 结构：

```
app-portfolio/
├── apps/
│   ├── web/          # 前端 H5 应用（React + Vite + antd-mobile）
│   └── api/          # 后端 API 服务（Express + Prisma + PostgreSQL）
├── packages/         # 跨应用复用的共享包（预留）
├── compose.yaml      # API 部署及可选的本地 PostgreSQL
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

## 仅后端：新设备 Docker 运行

提交并推送后，新设备克隆仓库，将 `.env.production.example` 复制为 `.env.production` 并填写数据库、密钥及 OSS 配置。已有配置文件不要覆盖。不需要安装 Node.js、pnpm 或 Prisma，也不需要迁移旧业务数据。

```bash
# 构建后端镜像（不连接数据库）
docker compose --env-file .env.production -f docker-compose.yml build api
# 本地运行已构建镜像，自动生成客户端、部署表结构并初始化数据
docker compose --env-file .env.production -f docker-compose.yml up -d --no-build
```

后端地址 `http://localhost:8000/api/`，就绪检查 `http://localhost:8000/ready`；容器内端口为 3000。此入口不启动前端、数据库或 Redis。数据库本身需在宿主机预先创建并允许容器连接；表和初始化数据由脚本创建。完整初始化还需要 OSS 凭据，已有对象不覆盖。密钥至少 32 字符，新的空数据库可以使用新密钥。

仓库同时保留开发用 `compose.yaml`，因此上述命令必须显式指定 `-f docker-compose.yml`。初始化失败不会启动 API，重复运行保留已有记录。只初始化结构可运行 `docker compose --env-file .env.production -f docker-compose.yml run --rm api pnpm db:migrate`。

## GitHub Actions 发布与服务器部署

推送 `main` 后，`.github/workflows/publish.yml` 在隔离 PostgreSQL 上执行迁移、初始化和前后端检查；通过后发布 `ghcr.io/jojoshine/app-portfolio-api:<完整提交SHA>`（amd64/arm64），并上传 `app-portfolio-web-<SHA>` 前端构建产物。PR 只检查，不发布镜像，CI 不使用真实数据库或 OSS 凭据。

服务器准备 `docker-compose.prod.yml` 和私有的 `.env.production`，填写 `API_IMAGE` 为本次提交标签以及外部数据库、JWT、数据加密密钥、OSS 参数，然后运行：

```bash
# 私有 GHCR 镜像需先通过密码标准输入登录，令牌需有 read:packages 权限。
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --no-build --wait --wait-timeout 300
```

- 服务器不构建镜像，也不启动数据库、Redis 或 MinIO。API 仅监听宿主机 `127.0.0.1:8000`，容器端口 3000。
- API 启动依次执行 Prisma 生成、表结构迁移、数据/资源初始化，失败则不启动；已有业务记录及 OSS 对象不覆盖。数据库本身须预先创建。
- 外部 PostgreSQL 地址通过 `DATABASE_URL` 指定；若在宿主机则使用 `host.docker.internal`，并允许 Docker 网桥访问。已有加密数据必须沿用 `ENROLLMENT_DATA_KEY`。
- 前端在 `apps/web` 执行 `npm run build`，或下载本次 CI 构建产物，将 dist 内容发布到 `/var/www/app-portfolio`。宿主机 Nginx 示例为 `apps/web/deploy/nginx.host.conf`，监听 3200，访问前缀为 `/app-portfolio/`，API 前缀为 `/app-portfolio/api/`。已有站点应合并 location，不覆盖其他站点。
- `.env.production` 不提交 Git、不进入镜像；`apps/web/.env.production` 只含公开参数，正式环境关闭 Mock 和开发令牌，身份由载体提供。
- 发布前备份现有数据库与前端版本；应用可切换回上一提交镜像，数据库迁移不能靠切换镜像自动回滚。

### 1. 启动基础设施

```bash
API_ENV_FILE=./apps/api/.env.example docker compose --profile local-db up -d postgres
```

这只启动 PostgreSQL（端口 5433）。对象存储使用阿里云 OSS，不再部署 MinIO；完整初始化前请在 `apps/api/.env` 配置私有 Bucket 和凭证，详见 [后端部署说明](apps/api/README.md)。

### 2. 安装依赖

```bash
pnpm install
```

### 3. 初始化数据库

```bash
pnpm --filter @app-portfolio/api db:init
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
- 阿里云 OSS（私有对象存储）
- JWT 认证

**基础设施**
- pnpm workspace
- Docker + Docker Compose
- PM2（可选，生产环境进程管理）
