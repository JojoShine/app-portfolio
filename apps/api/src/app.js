const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const database = require('./config/database');
const env = require('./config/env');
const errorHandler = require('./common/middleware/errorHandler');
const requestContext = require('./common/middleware/requestContext');

const system = require('./system');
const enrollment = require('./modules/enrollment');

const app = express();

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
}));

app.disable('x-powered-by');
// 默认仅信任本机反向代理；多层代理时由部署环境显式配置跳数。
app.set('trust proxy', env.TRUST_PROXY_HOPS > 0 ? env.TRUST_PROXY_HOPS : 'loopback');
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || env.CORS_ORIGINS.includes(origin) || env.CORS_ORIGINS.includes('*')) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(requestContext);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res, next) => {
  try {
    await database.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

// API 路由
app.use('/api/auth', system.auth.routes);
app.use('/api/users', system.user.routes);
app.use('/api/files', system.file.routes);
app.use('/api/app', system.app.routes);
app.use('/api/enrollment', enrollment.routes);

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
