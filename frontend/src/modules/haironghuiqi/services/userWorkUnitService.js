import api from '../../../services/api'

/**
 * 获取用户的工作单位
 */
const getUserWorkUnit = async (userId) => {
  try {
    const response = await api.get(`/haironghuiqi/user-work-units/${userId}`);
    return response.data;
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
    const response = await api.post(`/haironghuiqi/user-work-units/${userId}`, { workUnit });
    return response.data;
  } catch (error) {
    console.error('保存用户工作单位失败:', error);
    throw error;
  }
};

export default {
  getUserWorkUnit,
  upsertUserWorkUnit,
};
