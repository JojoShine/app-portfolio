# App Portfolio Backend

Express + Prisma + PostgreSQL 的 API 底座。

## 代码分层

- `src/system` 放置认证、用户、文件和应用目录等系统能力。
- `src/modules` 只放 H5 业务模块，每个模块按需拆分路由、控制器、业务服务、数据库入口与迁移。
- `prisma/schema` 按领域合并管理系统模型和招生模型，业务模块通过自身 `db` 入口访问 Prisma Client。

## 本地运行

```bash
API_ENV_FILE=./apps/api/.env.example docker compose -f ../../compose.yaml --profile local-db up -d postgres
npm install
npm run db:init
npm run dev
```

本地未创建 `.env` 时，后端和 Prisma CLI 会自动回退读取 `.env.example`；如需改写参数，创建 `.env` 即可覆盖。

## 分模块初始化演示数据

先运行 `npm run prisma:generate` 和 `npm run db:migrate`。每个模块独立初始化：

```bash
npm run db:seed:system
npm run db:seed:enrollment
npm run db:seed:library
npm run db:seed:coupon
npm run db:seed:snap-report
npm run db:seed:green-points
npm run db:seed:quiz
npm run db:seed:policy-match
```

`npm run db:seed` 初始化全部模块；也可用 `node prisma/seed.js enrollment coupon` 选择多个模块。脚本按模块使用事务，仅创建缺失记录，重复执行不会重置库存、借阅状态、用户修改或删除已有记录。应用目录由 system 单独维护，业务模块互不依赖。

- 招生：2026 年学校、报名窗口、学区、咨询信息、房产学位及五类加密部门演示资料。演示家长 `test-parent-001`，学生证件号 `320701201901012318`；仅为联调数据，真实账号没有演示部门回退。迁移加密数据时须保留 `ENROLLMENT_DATA_KEY` 配置。
- 图书馆：馆藏、馆区、座位、活动、业务图片及 `test-parent-001` 的演示借阅资料，由模块 seed 一次完成初始化。纸张纹理、山水背景和固定页头不上传 OSS。
- 消费券：四类明确标记演示的活动、各 100 张初始库存和虚构门店，核销操作员 `demo-coupon-operator`；用户通过正常领取流程获得券，不预造核销凭证。
- 随手拍：仅在 `demo-snap-report` 身份下创建一条虚构记录，供列表和详情演示。照片关系为空，不伪造上传文件或 AI 识别；完整提交链路需自行上传真实可用图片。
- 通用答题：初始化活动、题目、演示排行和活动配图；成功插画、回顾插画、默认头像图集随前端发布。
- 积分商城：初始化商品、活动、优惠券配置及业务图片；积分卡背景和固定生活方式横幅随前端发布。

### 资源归属

- 前端 `src/modules/<模块>/assets`：页面风格、背景、纹理、插画和默认图标等设计资源，不依赖数据库或 OSS 初始化。
- 后端 `prisma/seed/assets/<模块>`：商品图、图书封面、场馆照片、活动图等业务原件。只有模块 `seedAssets` 清单中的文件会上传；`seedData` 将对象路径或资源 ID 绑定到业务记录。初始化不再读取前端源码。
- 同一图像同时用于业务数据和固定装饰时，两端各保留对应用途原件，例如商城商品公园图片与前端 `page-landscape.png`。两者发布与读取链路独立。
- 图书馆旧的页面硬编码业务图原件归档在后端资源目录的 `unused` 子目录，不上传、不绑定到不相符的业务记录。
- 用户上传材料由统一文件接口保存与鉴权，不由 seed 伪造。
- 本次分类调整不删除既有数据库资源记录或 OSS 对象；旧装饰对象不再由新代码使用，也不会被新初始化上传。

演示数据仅用于开发或演示部署。内存隔离幂等检查：`node --test test/seed.test.js`，不会写入开发数据库。

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

OSS 默认关闭。完整初始化图书馆、积分商城、答题及使用上传接口，需要设置 `FILE_STORAGE_ENABLED=true`，并配置 `OSS_REGION`、`OSS_BUCKET`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`。可选 `OSS_ENDPOINT` 必须使用 HTTPS；临时凭证另填 `OSS_STS_TOKEN`，过期前需更新配置并重启。

Bucket 需提前创建并设为私有；程序只检查，不创建 Bucket 或修改其 ACL。RAM 权限应限定到该 Bucket：检查 ACL、读取/检查对象、写入和删除对象。所有文件仍经后端接口读取；用户材料沿用原有鉴权，不返回公开地址。初始化先检查对象是否存在，仅补缺失文件，不覆盖已存在对象；数据使用模块事务，资源失败不写入该模块数据。

### Docker 新环境部署

在仓库根目录执行：

```bash
API_ENV_FILE=/absolute/path/api.env docker compose up -d --build api
```

环境文件按 `.env.example` 配置，必须使用新环境可访问的 `DATABASE_URL`、独立的 `JWT_SECRET`、`ENROLLMENT_DATA_KEY`、前端域名 `CORS_ORIGINS` 和上述 OSS 配置。不要使用示例密钥。生产环境不会回退读取示例文件，也不会开启开发令牌。

- 默认启动顺序：目标容器内生成 Prisma Client → 等待数据库 → 部署迁移 → 初始化各模块数据及业务资源 → 启动 API。任一步失败，不启动 API。
- 每次启动可重复初始化，保留已有业务数据及对象；首次启动会补齐演示数据，不等同于正式运营数据。
- `SEED_MODULES=system,policy-match` 可限制初始化数据的模块；默认全部。设置方式：在上述部署命令前增加此变量。
- `RUN_INITIALIZATION=false` 仅用于数据库已由独立任务完成迁移和初始化的部署。
- 本地数据库可运行 `API_ENV_FILE=./apps/api/.env.example docker compose --profile local-db up -d postgres`；容器内连接同一 Compose 的数据库应使用 `postgres:5432`，不是 `127.0.0.1:5433`。也可直接连接外部 PostgreSQL。
- 镜像包含后端代码、Prisma CLI、全部迁移和业务原始资源，不包含本地环境密钥。
- `/health` 和 `/ready` 使用标准 JSON 包装，`/ready` 检查数据库；Docker 按 HTTP 状态检查。
- 前端部署需设 `VITE_USE_MOCK_API=false`，并将 `/api` 转发到后端；身份平台需按下文 JWT 约定接入。

### 模块迁移入口

八个模块 `system`、`enrollment`、`library`、`coupon`、`snap-report`、`green-points`、`quiz`、`policy-match` 的结构位于 `prisma/schema` 对应文件，DDL 位于 `prisma/migrations` 按模块命名的目录，数据位于 `prisma/seed/<模块>.js`。业务文件位于 `prisma/seed/assets/<模块>`，由该模块的 `seedAssets` 初始化；没有业务文件的模块不创建空资源。

```bash
# API 目录：生成客户端、部署结构，并仅初始化图书馆的数据及文件
npm run db:init -- library
# 只补齐指定模块的数据和资源（结构已部署时）
node prisma/seed.js library quiz
```

结构文件按模块独立维护，但 Prisma 共享一个迁移账本，`db:init` 始终部署全部待应用结构迁移，仅数据与资源按模块选择。不可抽取某个 SQL 随意执行或修改已应用迁移；后续结构变更新增迁移。

### 从既有 MinIO 迁入 OSS

先备份数据库，并将既有 MinIO **全部仍被数据引用的对象一次性复制**到私有 OSS Bucket，保持完整对象键不变，核对数量、内容和私有权限后切换配置。seed 只能恢复随代码发布的资源，不能恢复用户已上传材料。当前改动不删除旧容器、卷或对象，切换验证前请保留备份。

此后迁移应用环境，只要继续使用同一个 OSS Bucket，迁移数据库并保留对象键及 `ENROLLMENT_DATA_KEY` 即可，无需迁移对象存储服务；更换 Bucket 则仍需复制文件。没有 OSS 凭证时，单元/接口测试仅验证适配边界，不代表真实云端权限和网络已验证。

### 返回与异常

JSON 接口统一 `{ code, message, data }`，异常经统一中间件处理并带请求 ID；不存在、校验失败、上传超限、存储不可用等保持一致错误码。图片/下载成功响应仍是二进制，不包 JSON；传输开始前失败走标准异常，开始后失败终止连接，避免在文件流中混入 JSON。

## 政策智能匹配

- 前端入口 `/policy-match`，接口前缀 `/api/policy-match`，共用认证和私有文件能力。
- 初始化：`pnpm --filter @app-portfolio/api db:migrate`，随后 `pnpm --filter @app-portfolio/api db:seed:policy-match`。
- 种子包含个人与企业通用演示政策，以及开发身份 `test-parent-001` 的个人画像、匹配快照与申请草稿；不接入真实政务申报。
- 模块测试：在 API 目录运行 `node --test test/policy-match.rules.test.js test/policy-match.integration.test.js`。集成测试需可用且已初始化的开发数据库；云存储网络由测试适配器隔离，使用独立随机测试身份并清理测试记录、测试文件，不删除用户数据。
