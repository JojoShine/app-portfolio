# App Portfolio 部署总结

## 打包完成时间
2026-05-26 11:23

## 前端构建信息

### 构建文件位置
```
/Users/jojoshine/projects/App-all/AppPortfolio/frontend/dist/
```

### 构建大小
- 总大小：约 2.5 MB（未压缩）
- Gzip后：约 320 KB

### 构建配置
- **Base路径**：生产环境 `/app-portfolio/`，开发环境 `/`
- **API前缀**：生产环境 `/app-portfolio/api`，开发环境 `/api`
- **排除文件**：`references` 文件夹已自动排除
- **代码分割**：`antd-mobile` 单独打包

## 后端打包信息

### 打包文件位置
```
/Users/jojoshine/projects/App-all/AppPortfolio/backend/deploy/backend_20260526_112334.tar.gz
```

### 打包文件大小
- **56 KB**（不包含 node_modules）

### 打包内容
- `src/` - 源代码
- `package.json` - 依赖配置
- `package-lock.json` - 依赖锁定文件
- `.env` - 环境变量配置
- `ecosystem.config.js` - PM2配置文件（使用相对路径）
- `start.sh` - 启动脚本
- `README.md` - 部署指南

### 后端配置
- **启动端口**：8000
- **进程管理**：PM2
- **应用名称**：`app-portfolio-backend`
- **日志位置**：`./logs/`（相对路径）
- **ecosystem.config.js位置**：后端根目录

## 部署步骤

### 前端部署

1. **上传前端文件到服务器**
   ```bash
   scp -r frontend/dist/* user@server:/app/dist/
   ```

2. **配置Nginx**
   ```bash
   sudo cp frontend/deploy/nginx.conf /etc/nginx/sites-available/default
   sudo systemctl restart nginx
   ```

3. **验证前端**
   访问 `http://server/app-portfolio/`

### 后端部署

1. **上传后端包到服务器**
   ```bash
   scp backend/deploy/backend_*.tar.gz user@server:/app/
   ```

2. **解压后端包**
   ```bash
   cd /app
   tar -xzf backend_*.tar.gz
   cd backend
   ```

3. **安装依赖**
   ```bash
   npm install --production
   ```

4. **创建日志目录**
   ```bash
   mkdir -p logs
   ```

5. **安装PM2（如果未安装）**
   ```bash
   npm install -g pm2
   ```

6. **启动后端应用**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

7. **验证后端**
   ```bash
   pm2 status
   pm2 logs app-portfolio-backend
   ```

## 环境变量配置

### 前端环境变量 (.env)
```
# 本地开发环境
VITE_API_BASE_URL=/api
```

### 前端环境变量 (.env.production)
```
# 生产环境
VITE_API_BASE_URL=/app-portfolio/api
```

### 后端环境变量 (.env)
```
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

## 访问地址

- **前端应用**：`http://server/app-portfolio/`
- **后端API**：`http://server/app-portfolio/api/`
- **PM2监控**：`pm2 monit`

## 常用命令

### 前端相关
```bash
# 本地开发
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 后端相关
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
```

## 故障排查

### 前端问题
- 检查Nginx配置是否正确
- 检查前端文件是否正确上传
- 检查浏览器控制台是否有错误

### 后端问题
- 检查PM2日志：`pm2 logs app-portfolio-backend`
- 检查数据库连接：`psql -h localhost -U postgres -d app_portfolio`
- 检查Redis连接：`redis-cli ping`
- 检查端口是否被占用：`lsof -i :8000`
- 检查依赖是否安装：`npm list`
- 检查日志目录是否存在：`ls -la logs/`

## 性能优化建议

### 前端
- 启用Gzip压缩（已在Nginx配置中）
- 使用CDN加速静态资源
- 启用浏览器缓存（已在Nginx配置中）

### 后端
- 使用PM2集群模式：修改 `ecosystem.config.js` 中的 `instances: 'max'`
- 启用Redis缓存
- 使用数据库连接池
- 定期清理日志

## 监控和维护

### 日志管理
```bash
# 查看实时日志
tail -f logs/out.log

# 查看错误日志
tail -f logs/error.log

# 清理旧日志
find logs -name "*.log" -mtime +7 -delete
```

### 性能监控
```bash
# 监控PM2进程
pm2 monit

# 查看进程详细信息
pm2 show app-portfolio-backend

# 查看系统资源使用
top
```

## 更新应用

### 前端更新
```bash
# 本地构建
npm run build

# 上传新文件
scp -r frontend/dist/* user@server:/app/dist/

# Nginx会自动加载新文件
```

### 后端更新
```bash
# 本地打包
cd backend/deploy
./deploy.sh

# 上传新包
scp backend/deploy/backend_*.tar.gz user@server:/app/

# 服务器上更新
cd /app
tar -xzf backend_*.tar.gz
cd backend
npm install --production
pm2 restart app-portfolio-backend
```

## 相关文档

- 前端部署指南：`frontend/deploy/README.md`
- 后端部署指南：`backend/deploy/README.md`
- Nginx配置：`frontend/deploy/nginx.conf`
- PM2配置：`backend/ecosystem.config.js`

---

**部署完成！** 🎉

如有任何问题，请参考相关文档或查看日志文件。
