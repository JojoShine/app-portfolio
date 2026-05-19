// 统一错误类
class ApiError extends Error {
  constructor(message, code = 1, statusCode = 400, data = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
    this.name = 'ApiError';
  }
}

// 常见错误类型
class ValidationError extends ApiError {
  constructor(message = 'Validation Error', data = null) {
    super(message, 1001, 400, data);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Not Found') {
    super(message, 1002, 404);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 1003, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 1004, 403);
    this.name = 'ForbiddenError';
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, 1005, 409);
    this.name = 'ConflictError';
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error') {
    super(message, 1006, 500);
    this.name = 'InternalServerError';
  }
}

module.exports = {
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
};