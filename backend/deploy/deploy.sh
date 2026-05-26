#!/bin/bash

# 后端打包脚本
# 用于打包后端文件，生成可部署的包

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$PROJECT_ROOT/deploy"
BUILD_DIR="$DEPLOY_DIR/build"

# 时间戳
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="backend_${TIMESTAMP}.tar.gz"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}开始打包后端文件${NC}"
echo -e "${YELLOW}========================================${NC}"

# 1. 清理旧的构建文件
echo -e "${YELLOW}[1/5] 清理旧的构建文件...${NC}"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# 2. 复制项目文件到构建目录
echo -e "${YELLOW}[2/5] 复制项目文件...${NC}"
cp -r "$PROJECT_ROOT/src" "$BUILD_DIR/"
cp "$PROJECT_ROOT/package.json" "$BUILD_DIR/"
cp "$PROJECT_ROOT/package-lock.json" "$BUILD_DIR/" 2>/dev/null || true
cp "$PROJECT_ROOT/.env" "$BUILD_DIR/.env" 2>/dev/null || {
  echo -e "${RED}警告: .env 文件不存在${NC}"
  cp "$PROJECT_ROOT/.env.example" "$BUILD_DIR/.env" 2>/dev/null || true
}
# 复制pm2配置文件
cp "$PROJECT_ROOT/ecosystem.config.js" "$BUILD_DIR/" 2>/dev/null || true

# 3. 安装生产依赖
echo -e "${YELLOW}[3/5] 安装生产依赖...${NC}"
cd "$BUILD_DIR"
npm ci --omit=dev

# 4. 删除node_modules（打包时不需要）
echo -e "${YELLOW}[4/6] 清理node_modules...${NC}"
rm -rf "$BUILD_DIR/node_modules"

# 5. 创建启动脚本
echo -e "${YELLOW}[5/6] 创建启动脚本...${NC}"
cat > "$BUILD_DIR/start.sh" << 'EOF'
#!/bin/bash
# 启动脚本

# 加载环境变量
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi

# 启动应用
node src/index.js
EOF

chmod +x "$BUILD_DIR/start.sh"

# 创建README
cat > "$BUILD_DIR/README.md" << 'EOF'
# 后端应用部署指南

## 环境要求
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- MinIO（可选，用于文件存储）
- PM2（用于进程管理）

## 快速部署（使用PM2）

### 1. 解压文件
```bash
tar -xzf backend_*.tar.gz
cd backend
```

### 2. 安装PM2（全局）
```bash
npm install -g pm2
```

### 3. 启动应用
```bash
pm2 start ecosystem.config.js --env production
```

### 4. 查看应用状态
```bash
pm2 status
pm2 logs app-portfolio-backend
```

### 5. 停止应用
```bash
pm2 stop app-portfolio-backend
```

### 6. 重启应用
```bash
pm2 restart app-portfolio-backend
```

### 7. 删除应用
```bash
pm2 delete app-portfolio-backend
```

## 传统部署（不使用PM2）

### 1. 解压文件
```bash
tar -xzf backend_*.tar.gz
cd backend
```

### 2. 启动应用
```bash
./start.sh
```

或者使用 npm 启动
```bash
npm start
```

## PM2 常用命令

```bash
# 查看所有进程
pm2 list

# 查看进程详细信息
pm2 show app-portfolio-backend

# 查看实时日志
pm2 logs app-portfolio-backend

# 查看错误日志
pm2 logs app-portfolio-backend --err

# 监控进程
pm2 monit

# 保存进程列表（开机自启）
pm2 save

# 恢复进程列表
pm2 resurrect

# 清空所有进程
pm2 kill
```

## 开机自启配置

### Linux/Mac
```bash
pm2 startup
pm2 save
```

### Windows
```bash
pm2 install pm2-windows-startup
pm2 save
```

## Docker 部署

如果使用 Docker，可以使用以下 Dockerfile：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY .env ./

EXPOSE 8000

CMD ["node", "src/index.js"]
```

构建镜像：
```bash
docker build -t backend:latest .
```

运行容器：
```bash
docker run -d \
  --name backend \
  -p 8000:8000 \
  backend:latest
```

## 常见问题

### 数据库连接失败
- 检查 .env 中的数据库配置
- 确保 PostgreSQL 服务正在运行
- 检查防火墙设置

### Redis 连接失败
- 确保 Redis 服务正在运行
- 检查 .env 中的 Redis 配置

### 文件上传失败
- 检查 MinIO 配置
- 确保有足够的磁盘空间

### PM2 启动失败
- 检查 Node.js 版本是否 >= 18
- 检查 ecosystem.config.js 配置是否正确
- 查看 PM2 日志：`pm2 logs app-portfolio-backend`

## 监控和日志

### 日志文件位置
- 应用日志：`/app/backend/logs/out.log`
- 错误日志：`/app/backend/logs/error.log`

### 查看日志
```bash
# 查看最后100行日志
tail -100 /app/backend/logs/out.log

# 实时查看日志
tail -f /app/backend/logs/out.log

# 查看错误日志
tail -f /app/backend/logs/error.log
```

## 性能优化

### 集群模式
如果需要使用多个进程，修改 ecosystem.config.js 中的 instances：
```javascript
instances: 'max',  // 使用所有CPU核心
exec_mode: 'cluster',  // 使用集群模式
```

### 内存限制
默认配置限制最大内存为 500M，可根据需要调整：
```javascript
max_memory_restart: '1G',  // 修改为1GB
```
EOF

# 6. 打包文件
echo -e "${YELLOW}[6/6] 打包文件...${NC}"
cd "$DEPLOY_DIR"
tar -czf "$PACKAGE_NAME" -C "$BUILD_DIR" .

# 清理构建目录
rm -rf "$BUILD_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}打包完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}输出文件: $DEPLOY_DIR/$PACKAGE_NAME${NC}"
echo -e "${GREEN}文件大小: $(du -h "$DEPLOY_DIR/$PACKAGE_NAME" | cut -f1)${NC}"
echo ""
echo -e "${YELLOW}后续步骤:${NC}"
echo "1. 将 $PACKAGE_NAME 上传到服务器"
echo "2. 在服务器上解压: tar -xzf $PACKAGE_NAME"
echo "3. 运行 ./start.sh 启动应用"
