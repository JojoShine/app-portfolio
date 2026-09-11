const service = require('../services/verification.service');
const response = require('../../../common/response');
const validation = require('../validations/coupon.validation');
exports.credential = async (req, res) => res.json(response.success(await service.credential(validation.id(req.params.id), req.user.id)));
exports.preview = async (req, res) => res.json(response.success(await service.preview(validation.verification(req.body), req.user.id)));
exports.confirm = async (req, res) => res.json(response.success(await service.confirm(validation.verification(req.body, true), req.user.id)));
exports.list = async (req, res) => res.json(response.success(await service.list(validation.id(req.query.storeId), req.user.id)));
