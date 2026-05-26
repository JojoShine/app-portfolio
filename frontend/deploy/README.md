# 前端应用部署指南

## 环境要求
- Node.js 18+
- npm 9+

## 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

开发服务器将在 `http://localhost:5173` 启动

### 构建生产版本
```bash
npm run build
```

构建完成后，生成的文件将在 `dist` 文件夹中。

**注意**: 构建时会自动排除 `references` 文件夹中的所有文件，这些文件只用于开发参考，不会被打包到生产版本中。

## 部署

### 使用 Nginx 部署

1. 构建前端应用
   ```bash
   npm run build
   ```

2. 将 `dist` 文件夹中的文件复制到 Nginx 服务器
   ```bash
   scp -r dist/* user@server:/var/www/html/
   ```

3. 配置 Nginx
   - 使用本文件夹中的 `nginx.conf` 作为参考
   - 将配置文件复制到 Nginx 配置目录
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/default
   ```

4. 重启 Nginx
   ```bash
   sudo systemctl restart nginx
   ```

### 使用 Docker 部署

1. 构建 Docker 镜像
   ```bash
   docker build -t frontend:latest .
   ```

2. 运行容器
   ```bash
   docker run -d \
     --name frontend \
     -p 80:80 \
     frontend:latest
   ```

### Dockerfile 示例

```dockerfile
# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建结果
COPY --from=builder /app/dist /app/dist

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 环境变量

前端应用可以使用以下环境变量：

- `VITE_API_BASE_URL`: API 服务器地址（默认: `/api`）

在 `.env` 文件中配置：
```
VITE_API_BASE_URL=https://api.example.com
```

## 性能优化

### 代码分割
- 应用已配置自动代码分割
- `react-vant` 被单独打包为一个 chunk

### 缓存策略
- 静态资源（JS、CSS、图片）缓存 30 天
- HTML 文件不缓存，每次都重新获取

### Gzip 压缩
- Nginx 已配置 Gzip 压缩
- 支持的文件类型：text/plain, text/css, text/javascript, application/javascript, application/json

## 常见问题

### 构建失败
- 确保 Node.js 版本 >= 18
- 清除 node_modules 和 package-lock.json，重新安装依赖
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### 页面加载缓慢
- 检查网络连接
- 检查浏览器缓存
- 使用浏览器开发者工具检查资源加载情况

### 路由不工作
- 确保 Nginx 配置正确（使用 `try_files` 重写规则）
- 检查 API 代理配置

### 样式不显示
- 检查 Tailwind CSS 是否正确编译
- 清除浏览器缓存
- 检查 CSS 文件是否被正确加载

## 部署检查清单

- [ ] Node.js 版本 >= 18
- [ ] 依赖已安装
- [ ] 构建成功，无错误
- [ ] dist 文件夹已生成
- [ ] Nginx 配置正确
- [ ] API 代理配置正确
- [ ] 环境变量已配置
- [ ] SSL 证书已配置（如需要）
- [ ] 防火墙规则已配置
- [ ] 日志目录已创建

## 监控和日志

### Nginx 日志
- 访问日志: `/var/log/nginx/access.log`
- 错误日志: `/var/log/nginx/error.log`

### 查看实时日志
```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

## 更新应用

1. 拉取最新代码
   ```bash
   git pull origin main
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 构建新版本
   ```bash
   npm run build
   ```

4. 备份旧版本
   ```bash
   mv /var/www/html /var/www/html.backup
   ```

5. 部署新版本
   ```bash
   cp -r dist/* /var/www/html/
   ```

6. 重启 Nginx
   ```bash
   sudo systemctl restart nginx
   ```

## 回滚

如果新版本出现问题，可以快速回滚：

```bash
rm -rf /var/www/html
mv /var/www/html.backup /var/www/html
sudo systemctl restart nginx
```
