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

## 分模块初始化演示数据

先运行 `npm run prisma:generate` 和 `npm run db:migrate`。每个模块独立初始化：

```bash
npm run db:seed:system
npm run db:seed:enrollment
npm run db:seed:library
npm run db:seed:coupon
npm run db:seed:snap-report
```

`npm run db:seed` 初始化全部模块；也可用 `node prisma/seed.js enrollment coupon` 选择多个模块。脚本按模块使用事务，仅创建缺失记录，重复执行不会重置库存、借阅状态、用户修改或删除已有记录。应用目录由 system 单独维护，业务模块互不依赖。

- 招生：2026 年学校、报名窗口、学区、咨询信息、房产学位及五类加密部门演示资料。演示家长 `test-parent-001`，学生证件号 `320701201901012318`；仅为联调数据，真实账号没有演示部门回退。迁移加密数据时须保留 `ENROLLMENT_DATA_KEY` 配置。
- 图书馆：馆藏、馆区、座位、活动、业务图片及 `test-parent-001` 的演示借阅资料，由模块 seed 一次完成初始化。纸张纹理、山水背景和固定页头不上传 MinIO。
- 消费券：四类明确标记演示的活动、各 100 张初始库存和虚构门店，核销操作员 `demo-coupon-operator`；用户通过正常领取流程获得券，不预造核销凭证。
- 随手拍：仅在 `demo-snap-report` 身份下创建一条虚构记录，供列表和详情演示。照片关系为空，不伪造上传文件或 AI 识别；完整提交链路需自行上传真实可用图片。
- 通用答题：初始化活动、题目、演示排行和活动配图；成功插画、回顾插画、默认头像图集随前端发布。
- 积分商城：初始化商品、活动、优惠券配置及业务图片；积分卡背景和固定生活方式横幅随前端发布。

### 资源归属

- 前端 `src/modules/<模块>/assets`：页面风格、背景、纹理、插画和默认图标等设计资源，不依赖数据库或 MinIO 初始化。
- 后端 `prisma/seed/assets/<模块>`：商品图、图书封面、场馆照片、活动图等业务原件。只有模块 `seedAssets` 清单中的文件会上传；`seedData` 将对象路径或资源 ID 绑定到业务记录。初始化不再读取前端源码。
- 同一图像同时用于业务数据和固定装饰时，两端各保留对应用途原件，例如商城商品公园图片与前端 `page-landscape.png`。两者发布与读取链路独立。
- 图书馆旧的页面硬编码业务图原件归档在后端资源目录的 `unused` 子目录，不上传、不绑定到不相符的业务记录。
- 用户上传材料由统一文件接口保存与鉴权，不由 seed 伪造。
- 本次分类调整不删除既有数据库资源记录或 MinIO 对象；旧装饰对象不再由新代码使用，也不会被新初始化上传。

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

MinIO 默认关闭。只有设置 `FILE_STORAGE_ENABLED=true` 并补齐 MinIO 配置后，文件接口才会可用。

## 政策智能匹配

- 前端入口 `/policy-match`，接口前缀 `/api/policy-match`，共用认证和私有文件能力。
- 初始化：`pnpm --filter @app-portfolio/api db:migrate`，随后 `pnpm --filter @app-portfolio/api db:seed:policy-match`。
- 种子包含个人与企业通用演示政策，以及开发身份 `test-parent-001` 的个人画像、匹配快照与申请草稿；不接入真实政务申报。
- 模块测试：在 API 目录运行 `node --test test/policy-match.rules.test.js test/policy-match.integration.test.js`。集成测试需可用的开发数据库和 MinIO，使用独立随机测试身份并清理测试记录、测试文件，不删除用户数据。
