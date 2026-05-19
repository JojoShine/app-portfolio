const logger = require('../utils/logger');
const response = require('../response');
const { ApiError } = require('../utils/error');

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // 如果是 ApiError，直接返回
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      response.error(err.message, err.code, err.data)
    );
  }

  // 处理 Sequelize 错误
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json(
      response.error('Validation Error', 1001, { errors: messages })
    );
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json(
      response.error('Duplicate Entry', 1005)
    );
  }

  // 处理 JSON 解析错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      response.error('Invalid JSON', 1001)
    );
  }

  // 默认错误
  res.status(500).json(
    response.error('Internal Server Error', 1006)
  );
};

module.exports = errorHandler;