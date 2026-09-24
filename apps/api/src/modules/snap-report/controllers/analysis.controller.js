const service = require('../services/analysis.service');
const response = require('../../../common/response');
exports.create = async (req, res) => res.json(response.success(await service.analyze(req.validated, req.user.id)));
