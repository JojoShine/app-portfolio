const db = require('../db');
exports.list = () => db.couponMerchant.findMany({ select: { id: true, name: true, category: true, region: true, address: true, hours: true, phone: true, status: true } });
