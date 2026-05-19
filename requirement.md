# AppPortfolio 需求文档 - 项目计划

## 项目概述
多H5聚合移动端项目，整合多个业务模块到统一前端容器，提供通用能力底座和统一后端服务支撑。

---

## 需求文档（PRD）

### 1. 背景与目标
#### 1.1 项目背景
本项目用于**整合多个移动端 H5 应用**，形成一个统一入口与统一能力底座的聚合型应用。整体分为**前端（聚合容器 + 业务模块）**与**后端（统一业务支撑 + 数据与文件能力）**两部分。

#### 1.2 建设目标
- 提供一个可扩展的"聚合式 H5 容器"，可以持续接入新的业务 H5 模块。
- 提供一套通用能力（如用户信息、定位等）的前端服务封装，供所有业务模块复用。
- 后端提供统一的鉴权、数据存储、文件存储、缓存等基础能力，支撑各业务模块。

---

### 2. 总体架构与模块划分
#### 2.1 系统组成
- **前端（移动端 H5 聚合）**
  - 聚合框架/容器层（路由、布局、状态、权限、基础组件、通用服务）
  - 业务模块层（每个业务为一个模块，可独立迭代与接入）

- **后端（统一服务）**
  - Node.js/Express API 服务（按业务模块划分）
  - Sequelize + PostgreSQL 数据层
  - MinIO 对象存储（后端中转）
  - Redis 缓存/会话/热点数据

#### 2.2 业务模块化原则
- 每个业务以"模块"方式接入聚合前端（例如：`modules/<bizName>/...`）
- 后端按模块划分（例如：`routes/<bizName>/`、`controllers/<bizName>/`、`services/<bizName>/`）
- 模块应尽量只关注自身业务页面与业务接口调用
- 跨模块复用能力必须下沉到"通用层"（组件库、service 层、工具层）

---

### 3. 前端需求
#### 3.1 技术栈与约束
- React
- Zustand（全局状态）
- Axios（HTTP 请求）
- UI：shadcn/ui + Tailwind CSS（规范化组件与样式）
- 要求：统一代码风格、统一组件规范、统一请求与错误处理规范

#### 3.2 前端核心能力（框架性内容）
##### 3.2.1 通用组件体系
目标：提供一套可复用、规范化的 UI 组件能力，保证跨模块一致性。
- 基础组件：按钮、表单、弹窗、Toast、Skeleton、Empty、列表、分页等
- 业务常用组件（可逐步沉淀）：用户信息卡片、定位展示组件、上传组件等
- 组件规范：
  - 组件必须可配置、可复用，避免写死业务逻辑
  - 样式统一通过 Tailwind 与 shadcn/ui 组合实现
  - 禁止业务模块重复造轮子

##### 3.2.2 通用 Service 层（外部能力封装）
目标：把"跨业务可复用的外部能力"抽象为 service，供所有模块调用。
典型能力示例：
- 用户能力
  - 获取当前用户信息
  - 用户登录态/Token 获取与刷新
- 位置能力
  - 获取当前坐标（GPS/系统定位/浏览器定位）
  - 坐标权限处理与异常提示
- 文件能力
  - 上传文件到后端（后端中转到 MinIO）
  - 获取图片流（后端返回流数据，前端展示）
- 设备/环境能力（按业务需要扩展）

##### 3.2.3 文件上传与查看流程
**上传流程：**
1. 前端选择文件
2. 调用 `fileService.uploadFile(file)` 
3. 前端通过 axios 上传到后端 `/api/files/upload` 端点
4. 后端接收文件，上传到 MinIO，返回文件 ID/路径
5. 前端获得文件 ID，存储到业务数据中

**查看流程（流模式）：**
1. 前端需要展示图片时，调用 `fileService.getImageStream(fileId)`
2. 后端 `/api/files/stream/:fileId` 端点返回图片流数据
3. 前端将流转换为 Blob，生成临时 URL 展示（`URL.createObjectURL(blob)`）
4. 不直接访问 MinIO 地址（防止 HTTPS 后访问问题）

**设计原因：**
- 后续 HTTPS 部署时，直接访问 MinIO 地址可能因跨域/证书问题无法访问
- 通过后端中转流，保证前端始终能获取到图片数据
- 便于后续添加访问权限控制、审计日志等

##### 3.2.4 状态管理（Zustand）
- 全局状态用于：用户态、权限态、全局配置、缓存的通用数据等
- 模块内状态：优先使用局部 state；确需跨模块共享再上升到 store
- 约束：避免 store 滥用导致耦合

##### 3.2.5 请求层（Axios）
- 统一 Axios 实例：baseURL、超时、headers、拦截器
- 统一处理：
  - 请求携带鉴权信息（如 Token）
  - 统一错误处理（网络错误、业务错误）
  - 统一响应结构解析（后端返回格式需约定）

##### 3.2.6 路由与模块接入机制
- 聚合入口提供统一路由框架
- 每个业务模块注册自己的路由/菜单（或配置）
- 支持按需加载（模块懒加载）以控制包体积

---

### 4. 后端需求
#### 4.1 技术栈与组件
- Node.js + Express
- Sequelize ORM
- PostgreSQL
- MinIO（对象存储）
- Redis（缓存/会话/热点数据）

#### 4.2 后端模块化结构
后端按业务模块划分，推荐目录结构：
```
backend/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── controller.js
│   │   │   ├── service.js
│   │   │   ├── routes.js
│   │   │   ├── validation.js
│   │   │   └── model.js
│   │   ├── file/
│   │   │   ├── controller.js
│   │   │   ├── service.js
│   │   │   ├── routes.js
│   │   │   └── model.js
│   │   └── [other-modules]/
│   ├── common/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── response.js
│   │   └── error.js
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── minio.js
│   │   └── logger.js
│   ├── migrations/
│   │   └── [migration-files]
│   └── app.js
├── db/
│   ├── schema.sql
│   └── seeder.sql
└── .env.example
```

#### 4.3 核心能力需求
##### 4.3.1 API 服务与模块化
- 按领域拆分（controller → service → routes → validation 的组织方式）
- 为前端聚合模块提供统一 API
- 统一响应结构（success / list / paginated 等响应模式）

##### 4.3.2 数据存储（PostgreSQL + Sequelize）
- 业务数据落库 Postgres
- 使用 Sequelize model 定义数据结构与关联关系
- 需要迁移机制/初始化机制

##### 4.3.3 数据库初始化文件
**schema.sql：**
- 包含所有表的 DDL（CREATE TABLE）
- 包含索引、约束、外键等定义
- 用于首次初始化数据库结构
- 示例表：users、files、modules 等

**seeder.sql：**
- 包含初始化数据的 INSERT 语句
- 包含系统必需的基础数据（如系统配置、默认用户等）
- 用于初始化环境时填充必要的初始数据
- 可选：按环境区分（dev/test/prod）

**使用流程：**
```bash
# 初始化数据库结构
psql -h <host> -U <user> -d <dbname> -f db/schema.sql

# 初始化数据
psql -h <host> -U <user> -d <dbname> -f db/seeder.sql
```

##### 4.3.4 文件存储（MinIO）
**上传接口：**
- 端点：`POST /api/files/upload`
- 接收：multipart/form-data 文件
- 处理：
  - 验证文件类型/大小
  - 生成唯一文件名（避免覆盖）
  - 上传到 MinIO
  - 记录文件元数据到数据库（可选）
  - 返回文件 ID/路径

**流式获取接口：**
- 端点：`GET /api/files/stream/:fileId`
- 处理：
  - 验证文件 ID 有效性
  - 从 MinIO 获取文件流
  - 设置正确的 Content-Type 和 Content-Length
  - 返回流数据给前端
- 前端接收流后转换为 Blob 展示

**文件命名规范：**
- 格式：`<module>/<timestamp>-<uuid>.<ext>`
- 示例：`user/1715596800000-a1b2c3d4.jpg`

##### 4.3.5 缓存与会话（Redis）
- 典型用途：
  - 登录态/Token 缓存
  - 热点数据缓存
  - 短期幂等 key、防重复提交
- 需要定义 key 命名规范与过期策略

##### 4.3.6 CORS
- 后端支持跨域访问（CORS）
- 生产环境建议收敛 origin 白名单

---

### 5. 环境与配置
#### 5.1 配置项结构（.env.example）
```
# Database
DB_HOST=<your-host>
DB_PORT=5432
DB_NAME=app_portfolio
DB_USER=<your-user>
DB_PASSWORD=<your-password>

# Redis
REDIS_HOST=<your-host>
REDIS_PORT=6379
REDIS_USERNAME=<your-username>
REDIS_PASSWORD=<your-password>

# MinIO
MINIO_ENDPOINT=<your-host>
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=<your-access-key>
MINIO_SECRET_KEY=<your-secret-key>
MINIO_BUCKET=app-portfolio

# CORS
CORS_ORIGIN=*

# Server
NODE_ENV=development
PORT=3000
```

#### 5.2 敏感信息处理原则
- 凭据不落文档/不进仓库
- 使用 `.env` 文件管理（`.env` 加入 `.gitignore`）
- 提供 `.env.example` 作为模板
- 生产环境通过私密渠道分发真实凭据

---

### 6. 关键业务流程

#### 6.1 业务模块调用通用能力的流程
1. 业务模块页面初始化
2. 调用 `userService.getUserInfo()` 获取用户态
3. 根据业务需要调用 `locationService.getCurrentPosition()` 获取坐标
4. 调用模块自身 API（通过统一 axios 实例），并渲染 UI 组件

#### 6.2 文件上传流程
1. 用户在业务模块中选择文件
2. 前端调用 `fileService.uploadFile(file)`
3. axios 上传到后端 `/api/files/upload`
4. 后端验证 → 上传到 MinIO → 返回文件 ID
5. 前端获得文件 ID，保存到业务数据中

#### 6.3 文件查看流程（流模式）
1. 前端需要展示图片，调用 `fileService.getImageStream(fileId)`
2. axios 请求后端 `/api/files/stream/:fileId`
3. 后端从 MinIO 获取文件流，返回给前端
4. 前端将流转换为 Blob：`URL.createObjectURL(blob)`
5. 在 `<img>` 或其他标签中使用临时 URL 展示

---

### 7. 非功能性需求
- 统一规范：组件、样式、请求、错误处理、日志（前后端）
- 可扩展性：新增模块接入成本低
- 安全性：
  - 凭据不落文档/不进仓库
  - Token/鉴权策略明确
  - MinIO 访问控制策略清晰
- 性能：
  - 文件流传输时考虑分块/压缩
  - Redis 缓存热点数据

---

### 8. 交付物清单

**前端：**
- [ ] 聚合容器工程（含路由、layout、zustand、axios、shadcn/ui+tailwind 基础配置）
- [ ] 通用 service 层（用户、定位、文件等）
- [ ] 业务模块示例（最小可运行模块模板）
- [ ] 文件上传/查看组件示例

**后端：**
- [ ] Express 工程（模块化目录结构）
- [ ] Sequelize model 与基础 CRUD 示例
- [ ] 文件上传接口（`POST /api/files/upload`）
- [ ] 文件流获取接口（`GET /api/files/stream/:fileId`）
- [ ] Redis 接入与示例
- [ ] `db/schema.sql`（数据库结构初始化）
- [ ] `db/seeder.sql`（初始化数据）

**配置与文档：**
- [ ] `.env.example`（只有占位符）
- [ ] 部署文档（不包含真实密钥）
- [ ] API 文档（Swagger/OpenAPI）

---

## 审核状态
- [ ] 需求文档已确认
- [ ] 前端架构已确认
- [ ] 后端架构已确认
- [ ] 数据库设计已确认

---

## 修订记录
| 版本 | 日期 | 修改内容 |
|------|------|--------|
| 1.0 | 2026-05-13 | 初版：补充文件流模式、后端模块化、schema/seeder 需求 |
