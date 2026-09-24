const { ApiError } = require('../utils/error');

// 单进程快速限流，部署多实例时由网关补充统一限流。
module.exports = function rateLimit(limit, windowMs, key = (req) => req.user?.id || req.ip) {
  const entries = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [id, value] of entries) if (value.until <= now) entries.delete(id);
    const id = key(req);
    const entry = entries.get(id) || { count: 0, until: now + windowMs };
    if (entry.count >= limit || (!entries.has(id) && entries.size >= 10000)) {
      return next(new ApiError('操作频繁，请稍后再试', 1029, 429));
    }
    entry.count += 1;
    entries.set(id, entry);
    next();
  };
};
