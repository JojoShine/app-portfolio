# 后端部署文件说明

## 文件说明

### 1. deploy.sh
后端打包脚本，用于生成可部署的包。

**使用方法**：
```bash
chmod +x deploy.sh
./deploy.sh
```

**功能**：
- 清理旧的构建文件
- 复制项目文件（src、package.json、.env等）
- 复制 PM2 配置文件（ecosystem.config.js）
- 安装生产依赖
- 创建启动脚本
- 生成 README 文档
- 打包成 tar.gz 文件

**输出**：
- 打包文件位置：`deploy/dist/backend_YYYYMMDD_HHMMSS.tar.gz`

### 2. ecosystem.config.js
PM2 进程管理配置文件。

**主要配置**：
- 应用名称：`app-portfolio-backend`
- 启动脚本：`./src/index.js`
- 端口：8000
- 日志文件：`/app/backend/logs/out.log` 和 `/app/backend/logs/error.log`
- 最大内存：500M
- 自动重启：启用
- 执行模式：fork（单进程）

**修改建议**：
- 如果需要集群模式，修改 `exec_mode: 'cluster'` 和 `instances: 'max'`
- 如果需要修改端口，修改 `env.PORT` 的值
- 如果需要修改日志位置，修改 `out` 和 `error` 的值

### 3. README.md（生成的）
部署指南，包含在打包文件中。

## 部署流程

### 第1步：本地打包
在本地开发环境中运行：
```bash
cd backend/deploy
./deploy.sh
```

### 第2步：上传到服务器
将生成的 `backend_YYYYMMDD_HHMMSS.tar.gz` 上传到服务器：
```bash
scp deploy/dist/backend_*.tar.gz user@server:/app/
```

### 第3步：服务器上解压
```bash
cd /app
tar -xzf backend_*.tar.gz
cd backend
```

### 第4步：安装PM2（如果未安装）
```bash
npm install -g pm2
```

### 第5步：启动应用
```bash
pm2 start ecosystem.config.js --env production
```

### 第6步：设置开机自启（可选）
```bash
pm2 startup
pm2 save
```

## PM2 常用命令

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs app-portfolio-backend

# 重启应用
pm2 restart app-portfolio-backend

# 停止应用
pm2 stop app-portfolio-backend

# 删除应用
pm2 delete app-portfolio-backend

# 监控应用
pm2 monit
```

## 环境变量配置

部署包中包含 `.env` 文件，需要根据服务器环境进行配置：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_portfolio
DB_USER=postgres
DB_PASSWORD=your_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO配置
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# 应用配置
NODE_ENV=production
PORT=8000
```

## 故障排查

### 应用无法启动
1. 检查 Node.js 版本：`node -v`（需要 >= 18）
2. 检查依赖是否安装：`npm list`
3. 查看 PM2 日志：`pm2 logs app-portfolio-backend`
4. 检查 .env 文件配置

### 数据库连接失败
1. 检查 PostgreSQL 是否运行
2. 检查数据库配置是否正确
3. 检查防火墙设置

### 端口被占用
1. 查看占用 8000 端口的进程：`lsof -i :8000`
2. 修改 ecosystem.config.js 中的 PORT 值
3. 重启应用：`pm2 restart app-portfolio-backend`

## 更新应用

### 方法1：重新打包部署
```bash
# 本地
cd backend/deploy
./deploy.sh

# 上传新包到服务器
scp deploy/dist/backend_*.tar.gz user@server:/app/

# 服务器上
cd /app
tar -xzf backend_*.tar.gz
pm2 restart app-portfolio-backend
```

### 方法2：直接更新代码
```bash
# 服务器上
cd /app/backend
git pull origin main
npm install
pm2 restart app-portfolio-backend
```

## 监控和维护

### 查看应用性能
```bash
pm2 monit
```

### 查看应用详细信息
```bash
pm2 show app-portfolio-backend
```

### 查看系统日志
```bash
tail -f /app/backend/logs/out.log
tail -f /app/backend/logs/error.log
```

### 定期清理日志
```bash
# 清理超过7天的日志
find /app/backend/logs -name "*.log" -mtime +7 -delete
```

## 性能优化建议

1. **使用集群模式**：充分利用多核CPU
   ```javascript
   instances: 'max',
   exec_mode: 'cluster',
   ```

2. **增加内存限制**：根据服务器内存调整
   ```javascript
   max_memory_restart: '1G',
   ```

3. **启用日志轮转**：防止日志文件过大
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 100M
   ```

4. **监控和告警**：使用 PM2 Plus
   ```bash
   pm2 plus
   ```

## 相关文档

- [PM2 官方文档](https://pm2.keymetrics.io/)
- [Node.js 官方文档](https://nodejs.org/)
- [Express.js 官方文档](https://expressjs.com/)