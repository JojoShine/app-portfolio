export const categories = ['设施损坏', '垃圾堆放', '道路积水', '占道', '其他'];
export const severities = ['轻微', '一般', '严重'];
export const emptyForm = () => ({ object: '', category: '', severity: '', reason: '', description: '', address: '', detail: '', locationConfirmed: false });
export const mergeAnalysis = (form, result, touched) => {
  const next = { ...form };
  for (const key of ['object', 'category', 'severity', 'reason', 'description']) {
    if (!touched.has(key)) next[key] = result[key] || '';
  }
  return next;
};
export const displayTime = (value) => new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(value));
export const validateForm = (form, photos) => {
  if (!photos.length || photos.some((photo) => !photo.id)) return { field: 'photos', message: '请先上传至少一张照片，失败的照片可重试或移除' };
  for (const [field, label] of [['object', '物品或对象'], ['category', '问题类别'], ['severity', '问题程度'], ['description', '问题描述']]) {
    if (!form[field]?.trim()) return { field, message: `请确认${label}` };
  }
  if (!form.address?.trim() || !form.locationConfirmed) {
    return { field: 'address', message: '请填写并确认发生地址' };
  }
  return null;
};
