import api from './api'

/**
 * 文件服务
 * 处理文件流获取和blob URL转换
 */

// 获取文件流并转换为blob URL
export const getFileUrl = async (fileIdOrPath) => {
  try {
    const response = await api.get(`/files/${fileIdOrPath}`, {
      responseType: 'blob',
    });

    // 将blob转换为URL
    const blobUrl = URL.createObjectURL(response);
    return blobUrl;
  } catch (error) {
    console.error('获取文件失败:', error);
    throw error;
  }
};

export default {
  getFileUrl,
};
