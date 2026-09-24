const env = require('../../../config/env');
const { ServiceUnavailableError, ValidationError } = require('../../../common/utils/error');
const request = async (path, params) => {
  if (!env.AMAP_REST_KEY) throw new ServiceUnavailableError('地图暂不可用，请手动填写发生位置');
  try {
    const url = new URL(`https://restapi.amap.com/v3/${path}`);
    url.search = new URLSearchParams({ key: env.AMAP_REST_KEY, ...params });
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await response.json();
    if (!response.ok || data.status !== '1') throw new Error('map unavailable');
    return data;
  } catch { throw new ServiceUnavailableError('地图查询失败，请重试或手动填写地址'); }
};
exports.reverse = async ({ longitude, latitude, gps }) => {
  let location = `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
  if (gps) location = (await request('assistant/coordinate/convert', { locations: location, coordsys: 'gps' })).locations;
  const data = await request('geocode/regeo', { location });
  if (data.regeocode?.addressComponent?.adcode !== '320685') throw new ValidationError('当前仅支持海安市，请选择海安市内发生位置');
  const [lng, lat] = location.split(',').map(Number);
  return { address: data.regeocode.formatted_address, longitude: lng, latitude: lat };
};
exports.search = async ({ q }) => {
  const data = await request('place/text', { keywords: q, city: '320685', citylimit: 'true', offset: '10', extensions: 'base' });
  return (data.pois || []).filter((poi) => poi.adcode === '320685' && poi.location).map((poi) => {
    const [longitude, latitude] = poi.location.split(',').map(Number);
    return { address: `海安市${typeof poi.address === 'string' ? poi.address : ''}${poi.name}`, longitude, latitude };
  });
};
