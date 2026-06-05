const app = require('./app');
const sequelize = require('./config/database');
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

    // 测试数据库连接
    logger.info('📡 Connecting to database...');
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // 初始化模型关联
    logger.info('🔗 Initializing model associations...');
    const models = sequelize.models;
    Object.keys(models).forEach(modelName => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });
    logger.info('✅ Model associations initialized');

    // 同步数据库模型（开发环境）
    if (env.NODE_ENV === 'development') {
      logger.info('🔄 Synchronizing database models...');
      await sequelize.sync({ alter: false });
      logger.info('✅ Database models synchronized');
    }

    // 启动 Express 服务器
    app.listen(PORT, () => {
      logger.info(`🌐 Server is running on http://localhost:${PORT}`);
      logger.info(`📦 Environment: ${env.NODE_ENV}`);
      logger.info(`📝 Logs directory: ./logs`);
      console.log('\n');
      logger.info('✨ Server started successfully!');
      console.log('\n');
    });
  } catch (error) {
    logger.error('❌ Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();