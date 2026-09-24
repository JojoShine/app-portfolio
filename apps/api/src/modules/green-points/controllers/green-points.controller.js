const response = require('../../../common/response');
const service = require('../services/green-points.service');
const wrap = (handler) => async (req, res, next) => { try { res.json(response.success(await handler(req))); } catch (error) { next(error); } };

exports.read = wrap((req) => service.read(req.user.id));
exports.checkIn = wrap((req) => service.checkIn(req.user.id));
exports.favorite = wrap((req) => service.favorite(req.user.id, req.body.id));
exports.view = wrap((req) => service.view(req.user.id, req.body.id));
exports.claimCoupon = wrap((req) => service.claimCoupon(req.user.id, req.body.id));
exports.saveAddress = wrap((req) => service.saveAddress(req.user.id, req.body));
exports.deleteAddress = wrap((req) => service.deleteAddress(req.user.id, req.body.id));
exports.support = wrap((req) => service.support(req.user.id, req.body));
exports.redeem = wrap((req) => service.redeem(req.user.id, req.body));
exports.cancel = wrap((req) => service.cancel(req.user.id, req.body.id));
exports.complete = wrap((req) => service.complete(req.user.id, req.body.id));
exports.asset = async (req, res, next) => { try { const file = await service.asset(req.params.id); res.setHeader('Content-Type', file.mimeType); res.setHeader('Cache-Control', 'public, max-age=86400'); file.stream.pipe(res); } catch (error) { next(error); } };
