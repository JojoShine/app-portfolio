/**
 * 通用的API响应处理方法
 * 根据code判断是否成功，返回数据或抛出错误
 */

export const handleResponse = (response) => {
  // 检查code
  if (response.code === 0) {
    // 业务成功
    return response.data;
  } else if (response.code === 400) {
    // 请求参数错误
    throw new Error(response.message || '请求参数错误');
  } else if (response.code === 401) {
    // 未认证
    throw new Error(response.message || '请先登录');
  } else if (response.code === 403) {
    // 无权限
    throw new Error(response.message || '无权限访问');
  } else if (response.code === 404) {
    // 资源不存在
    throw new Error(response.message || '资源不存在');
  } else if (response.code === 500) {
    // 服务器错误
    throw new Error(response.message || '服务器错误');
  } else if (response.code === 503) {
    // 服务不可用
    throw new Error(response.message || '服务暂时不可用');
  } else {
    // 其他业务错误
    throw new Error(response.message || '请求失败');
  }
};

/**
 * 处理API响应，返回完整响应对象
 * 用于需要检查code的场景（如业务错误提示）
 */
export const handleResponseWithCode = (response) => {
  return {
    code: response.code,
    message: response.message,
    data: response.data,
  };
};

/**
 * 处理API响应，返回数据或空数组
 * 用于列表类接口
 */
export const handleListResponse = (response) => {
  if (response.code !== 0) {
    throw new Error(response.message || '请求失败');
  }
  return response.data || [];
};

export default {
  handleResponse,
  handleResponseWithCode,
  handleListResponse,
};