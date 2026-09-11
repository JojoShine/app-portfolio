const service = require('../services/merchant.service');
const response = require('../../../common/response');
exports.list = async (req, res) => res.json(response.success(await service.list()));
