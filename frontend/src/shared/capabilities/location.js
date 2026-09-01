export const locationCapability = {
  getCurrentPosition(options = {}) {
    if (!navigator.geolocation) {
      return Promise.reject(new Error('当前环境不支持定位'));
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
        ...options,
      });
    });
  },
};
