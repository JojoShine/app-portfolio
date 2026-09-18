export const formatLibraryDate = (value) => new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric',
}).format(new Date(value)).replace('/', '月').concat('日');

export const formatLibraryDateTime = (value) => new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(value)).replace('/', '月').replace(' ', '日 ');

export const daysUntil = (value, now = new Date()) => Math.max(0, Math.ceil((new Date(value).getTime() - now.getTime()) / 86400000));

export const formatLibraryMessageTime = (value, now = new Date()) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '';
  const options = { timeZone: 'Asia/Shanghai' };
  const dayKey = (input) => new Intl.DateTimeFormat('en-CA', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' }).format(input);
  const dateKey = dayKey(date);
  const [, month, day] = dateKey.split('-');
  const label = dateKey === dayKey(now) ? '今天' : dateKey === dayKey(new Date(now.getTime() - 86400000)) ? '昨天' : `${Number(month)}月${Number(day)}日`;
  return `${label} ${new Intl.DateTimeFormat('en-GB', { ...options, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date)}`;
};

export const filterLibraryEvents = (events = [], category = '全部活动', period = 'all', now = new Date()) => {
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const start = new Date(`${localDate}T00:00:00+08:00`).getTime();
  const day = 86400000;
  const weekday = new Date(start + 8 * 3600000).getUTCDay() || 7;
  const [year, month] = localDate.split('-').map(Number);
  const end = period === 'today' ? start + day : period === 'week' ? start + (8 - weekday) * day : period === 'month' ? Date.UTC(year, month, 1) - 8 * 3600000 : start + 30 * day;
  return (events || []).filter((event) => {
    const time = new Date(event.startsAt).getTime();
    return (category === '全部活动' || event.category === category) && (period === 'all' || (time >= start && time < end));
  });
};

export const formatLibraryEventDate = (value) => {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    weekday: parts.weekday,
    time: `${parts.hour}:${parts.minute}`,
  };
};
