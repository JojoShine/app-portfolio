const { app: logger } = require('../utils/logger');
const { Prisma } = require('@prisma/client');
const response = require('../response');
const { ApiError } = require('../utils/error');

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    requestId: req.requestId,
  });

  // 如果是 ApiError，直接返回
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      { ...response.error(err.message, err.code, err.data), requestId: req.requestId }
    );
  }

  // 处理 Prisma 输入校验错误
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json(
      { ...response.error('Validation Error', 1001), requestId: req.requestId }
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json(
        { ...response.error('Duplicate Entry', 1005, { fields: err.meta?.target }), requestId: req.requestId }
      );
    }
    if (err.code === 'P2003') {
      return res.status(409).json(
        { ...response.error('Referenced data is still in use', 1005), requestId: req.requestId }
      );
    }
    if (err.code === 'P2025') {
      return res.status(404).json(
        { ...response.error('Resource not found', 1004), requestId: req.requestId }
      );
    }
  }

  // 处理 JSON 解析错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      { ...response.error('Invalid JSON', 1001), requestId: req.requestId }
    );
  }

  // 默认错误
  res.status(500).json(
    { ...response.error('Internal Server Error', 1006), requestId: req.requestId }
  );
};

module.exports = errorHandler;
