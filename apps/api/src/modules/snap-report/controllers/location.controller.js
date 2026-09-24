const service = require('../services/location.service');
const response = require('../../../common/response');
exports.reverse = async (req, res) => res.json(response.success(await service.reverse(req.validated)));
exports.search = async (req, res) => res.json(response.success(await service.search(req.validated)));
