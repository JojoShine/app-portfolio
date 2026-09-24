const service = require('../services/photo.service');
const response = require('../../../common/response');
exports.upload = async (req, res) => res.json(response.success(await service.upload(req.file, req.user.id)));
