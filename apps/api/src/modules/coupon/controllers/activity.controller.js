const service = require('../services/activity.service');
const response = require('../../../common/response');
const validation = require('../validations/coupon.validation');
exports.list = async (req, res) => res.json(response.success(await service.list()));
exports.get = async (req, res) => res.json(response.success(await service.get(validation.id(req.params.id))));
