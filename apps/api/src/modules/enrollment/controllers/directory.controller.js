const response = require('../../../common/response');
const service = require('../services/directory.service');
const validation = require('../validations/directory.validation');
const wrap = (handler) => async (req, res, next) => {
  try { res.json(response.success(await handler(req))); } catch (error) { next(error); }
};
exports.profile = wrap((req) => service.profile(req.user.id));
exports.contacts = wrap(() => service.contacts());
exports.districts = wrap((req) => service.districts(validation.district(req.query)));
exports.propertyDegree = wrap((req) => service.propertyDegree(validation.propertyDegree(req.query)));
