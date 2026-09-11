const service = require('../services/wallet.service');
const response = require('../../../common/response');
const validation = require('../validations/coupon.validation');
exports.list = async (req, res) => res.json(response.success(await service.list(req.user.id)));
exports.get = async (req, res) => res.json(response.success(await service.get(validation.id(req.params.id), req.user.id)));
exports.claim = async (req, res) => res.json(response.success(await service.claim(validation.claim(req.body).ticketId, req.user.id)));
