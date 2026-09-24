const service = require('../services/report.service');
const response = require('../../../common/response');
exports.create = async (req, res) => res.json(response.success(await service.create(req.validated, req.user.id)));
exports.list = async (req, res) => res.json(response.success(await service.list(req.validated, req.user.id)));
exports.detail = async (req, res) => res.json(response.success(await service.detail(req.validated, req.user.id)));
