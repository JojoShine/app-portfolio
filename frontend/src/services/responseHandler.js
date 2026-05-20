/**
 * 通用的API响应处理方法
 * 检查响应状态码，返回处理后的数据或抛出错误
 */

export const handleResponse = (response) => {
  if (response.code !== 0) {
    throw new Error(response.message || '请求失败');
  }
  return response.data;
};

/**
 * 处理API响应，返回数据或空数组
 * 用于列表类接口
 */
export const handleListResponse = (response) => {
  return handleResponse(response) || [];
};

export default {
  handleResponse,
  handleListResponse,
};