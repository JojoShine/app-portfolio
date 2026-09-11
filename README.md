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
