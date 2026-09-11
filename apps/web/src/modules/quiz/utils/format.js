export const duration = seconds => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;
export const dateTime = time => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(time);
export const eventStatus = (event, now = Date.now()) => now < event.start ? '未开始' : now >= event.end ? '已结束' : '进行中';
export const typeName = type => ({ single: '单选题', multi: '多选题', judge: '判断题' })[type];
