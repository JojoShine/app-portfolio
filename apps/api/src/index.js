const app = require('./app');
const database = require('./config/database');
const env = require('./config/env');
const { app: logger } = require('./common/utils/logger');

const PORT = env.PORT || 3000;

// 启动横幅
const printBanner = () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║              🚀 AppPortfolio Backend Server 🚀             ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
};

// 启动服务器
const startServer = async () => {
  try {
    printBanner();

    env.validate();

    logger.info('📡 Connecting to database...');
    await database.$connect();
    logger.info('✅ Database connection established');

    // 启动 Express 服务器
    const server = app.listen(PORT, () => {
      logger.info(`🌐 Server is running on http://localhost:${PORT}`);
      logger.info(`📦 Environment: ${env.NODE_ENV}`);
      logger.info(`📝 Logs directory: ./logs`);
      console.log('\n');
      logger.info('✨ Server started successfully!');
      console.log('\n');
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down`);
      server.close(async () => {
        await database.$disconnect();
        process.exit(0);
      });
    };
    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();
