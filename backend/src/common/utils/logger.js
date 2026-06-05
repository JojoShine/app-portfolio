const winston = require('winston');
const path = require('path');
const fs = require('fs');
const env = require('../../config/env');

const logsDir = path.join(__dirname, '../../..', 'logs');

// 确保 logs 目录存在
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 自定义颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// 控制台格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, module, ...meta }) => {
    const levelPad = level.padEnd(7);
    const modulePrefix = module ? `[${module}] ` : '';
    const metaStr = Object.keys(meta).length && meta.service !== 'app-portfolio'
      ? `\n  ${JSON.stringify(meta, null, 2).split('\n').join('\n  ')}`
      : '';
    return `${timestamp} ${levelPad} ${modulePrefix}${message}${metaStr}`;
  })
);

// 文件格式
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * 创建模块日志器
 * @param {string} moduleName - 模块名称（如：auth, user, app, haironghuiqi等）
 * @returns {object} Winston logger 实例
 */
const createModuleLogger = (moduleName = 'app') => {
  // 获取当前日期，格式：YYYY-MM-DD
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // 创建模块日志目录：logs/{moduleName}/
  const moduleLogsDir = path.join(logsDir, moduleName);
  if (!fs.existsSync(moduleLogsDir)) {
    fs.mkdirSync(moduleLogsDir, { recursive: true });
  }
  
  // 日志文件路径：logs/{moduleName}/out.log 和 logs/{moduleName}/error.log
  const outLogFile = path.join(moduleLogsDir, 'out.log');
  const errorLogFile = path.join(moduleLogsDir, 'error.log');
  
  // 创建该模块的 logger
  const moduleLogger = winston.createLogger({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    defaultMeta: { service: 'app-portfolio', module: moduleName },
    transports: [
      // 错误日志：只记录 error 级别
      new winston.transports.File({
        filename: errorLogFile,
        level: 'error',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 30, // 保留30天的日志
      }),
      // 输出日志：记录所有级别
      new winston.transports.File({
        filename: outLogFile,
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 30, // 保留30天的日志
      }),
    ],
  });
  
  // 在开发环境或非生产环境添加控制台输出
  if (env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
    moduleLogger.add(
      new winston.transports.Console({
        format: consoleFormat,
      })
    );
  }
  
  return moduleLogger;
};

// 默认应用日志器（用于通用日志）
const defaultLogger = createModuleLogger('app');

// 导出工厂函数和默认日志器
module.exports = {
  createModuleLogger, // 工厂函数：为不同模块创建独立的日志器
  logger: defaultLogger, // 默认日志器（向后兼容）
  // 常用模块日志器快捷方式
  auth: createModuleLogger('auth'),
  user: createModuleLogger('user'),
  app: createModuleLogger('app'),
  file: createModuleLogger('file'),
  haironghuiqi: createModuleLogger('haironghuiqi'),
};