# AppPortfolio 后端服务

这是 AppPortfolio 项目的后端服务，使用 Node.js + Express + Sequelize + PostgreSQL 构建。

## 项目结构

```
backend/
├── src/
│   ├── modules/          # 业务模块
│   │   ├── user/         # 用户模块
│   │   └── file/         # 文件模块
│   ├── common/           # 通用工具和中间件
│   │   ├── middleware/   # 中间件
│   │   ├── utils/        # 工具函数
│   │   └── response.js   # 统一响应格式
│   ├── config/           # 配置文件
│   └── app.js            # Express 应用入口
├── db/                   # 数据库脚本
│   ├── schema.sql        # 数据库结构
│   └── seeder.sql        # 初始化数据
├── logs/                 # 日志文件
├── package.json
├── .env.example          # 环境变量模板
└── .gitignore
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并填入真实的配置信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：
- 数据库连接信息（DB_HOST、DB_USER、DB_PASSWORD 等）
- Redis 连接信息
- MinIO 连接信息

### 3. 初始化数据库

#### 方式一：使用 psql 命令行工具

```bash
# 创建数据库结构
psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f db/schema.sql

# 初始化数据
psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f db/seeder.sql
```

#### 方式二：使用 Sequelize 自动同步（开发环境）

在开发环境中，启动服务器时会自动同步数据库模型：

```bash
npm run dev
```

### 4. 启动服务器

**开发环境（带热重载）：**
```bash
npm run dev
```

**生产环境：**
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

## API 端点

### 用户模块 (`/api/users`)

- `POST /api/users` - 创建用户
- `GET /api/users` - 获取用户列表（支持分页和过滤）
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 文件模块 (`/api/files`)

- `POST /api/files` - 上传文件
- `GET /api/files` - 获取文件列表（支持分页和过滤）
- `GET /api/files/stream/:id` - 获取文件流（用于展示图片等）
- `DELETE /api/files/:id` - 删除文件

## 响应格式

所有 API 响应都遵循统一的格式：

**成功响应：**
```json
{
  "code": 0,
  "message": "Success",
  "data": {}
}
```

**列表响应：**
```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "items": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "pageSize": 10,
      "totalPages": 0
    }
  }
}
```

**错误响应：**
```json
{
  "code": 1,
  "message": "Error message",
  "data": null
}
```

## 文件上传

### 上传流程

1. 前端选择文件
2. 调用 `POST /api/files` 上传文件
3. 后端验证文件类型和大小
4. 如果是图片，自动压缩
5. 上传到 MinIO
6. 返回文件 ID

### 文件查看（流模式）

1. 前端调用 `GET /api/files/stream/:fileId`
2. 后端从 MinIO 获取文件流
3. 前端接收流数据，转换为 Blob
4. 使用 `URL.createObjectURL(blob)` 生成临时 URL 展示

## 日志

日志文件存放在 `logs/` 目录下：
- `combined.log` - 所有日志
- `error.log` - 错误日志

## 环境变量

参考 `.env.example` 文件，主要环境变量包括：

- `NODE_ENV` - 运行环境（development/production）
- `PORT` - 服务器端口
- `DB_*` - 数据库连接信息
- `REDIS_*` - Redis 连接信息
- `MINIO_*` - MinIO 连接信息
- `CORS_ORIGIN` - CORS 允许的源

## 最佳实践

### 数据库字段命名

- 代码中使用驼峰命名（如 `createdAt`）
- 数据库中自动转换为下划线命名（如 `created_at`）
- 通过 Sequelize 的 `underscored: true` 选项实现

### 时区处理

- 所有时间戳都使用东八区（UTC+8）
- 在 Sequelize 配置中设置 `timezone: '+08:00'`

### 文件处理

- 文件上传中间件自动检查文件类型和大小
- 图片自动压缩（最大宽高 2000px，质量 80%）
- 文件存储在 MinIO，元数据存储在 PostgreSQL

## 故障排除

### 数据库连接失败

检查 `.env` 文件中的数据库连接信息是否正确。

### MinIO 连接失败

检查 MinIO 服务是否运行，以及连接信息是否正确。

### 文件上传失败

检查文件大小是否超过限制（默认 10MB），以及文件类型是否被允许。

## 开发指南

### 添加新的业务模块

1. 在 `src/modules/` 下创建新的模块目录
2. 创建 `model.js`、`service.js`、`controller.js`、`routes.js`、`validation.js`
3. 在 `src/app.js` 中注册路由

### 添加新的中间件

1. 在 `src/common/middleware/` 下创建中间件文件
2. 在 `src/app.js` 中使用 `app.use()` 注册

### 添加新的工具函数

1. 在 `src/common/utils/` 下创建工具文件
2. 在需要的地方导入使用

## 许可证

ISC