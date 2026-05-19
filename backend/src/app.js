const express = require('express');
const bodyParser = require('body-parser');
const env = require('./config/env');
const logger = require('./common/utils/logger');
const corsMiddleware = require('./common/middleware/cors');
const errorHandler = require('./common/middleware/errorHandler');

// 导入路由
const authRoutes = require('./modules/auth/routes');
const userRoutes = require('./modules/user/routes');
const fileRoutes = require('./modules/file/routes');
const appRoutes = require('./modules/app/routes');

const app = express();

// 中间件
app.use(corsMiddleware);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
  });
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/app', appRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 1002,
    message: 'Not Found',
    data: null,
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

module.exports = app;