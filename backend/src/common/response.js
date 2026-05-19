// 统一响应格式
const response = {
  // 成功响应
  success: (data = null, message = 'Success') => {
    return {
      code: 0,
      message,
      data,
    };
  },

  // 列表响应
  list: (items = [], total = 0, page = 1, pageSize = 10) => {
    return {
      code: 0,
      message: 'Success',
      data: {
        items,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  },

  // 分页响应（别名）
  paginated: (items = [], total = 0, page = 1, pageSize = 10) => {
    return response.list(items, total, page, pageSize);
  },

  // 错误响应
  error: (message = 'Error', code = 1, data = null) => {
    return {
      code,
      message,
      data,
    };
  },
};

module.exports = response;