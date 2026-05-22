import axios from 'axios';

const API_BASE_URL = '/api/haironghuiqi/user-work-units';

/**
 * 获取用户的工作单位
 */
const getUserWorkUnit = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('获取用户工作单位失败:', error);
    throw error;
  }
};

/**
 * 创建或更新用户的工作单位
 */
const upsertUserWorkUnit = async (userId, workUnit) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${userId}`, { workUnit });
    return response.data.data;
  } catch (error) {
    console.error('保存用户工作单位失败:', error);
    throw error;
  }
};

export default {
  getUserWorkUnit,
  upsertUserWorkUnit,
};
