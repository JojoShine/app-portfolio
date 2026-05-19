const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'postgres',
    timezone: '+08:00', // 东八区时区
    underscored: true, // 自动将驼峰命名转换为下划线命名
    logging: env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      // PostgreSQL 特定配置
      application_name: 'app-portfolio',
    },
  }
);

module.exports = sequelize;