const response = require('../../../common/response');
const service = require('../services/draft.service');
const validation = require('../validations/directory.validation');
exports.discard = async (req, res, next) => {
  try {
    await service.discard(validation.applicationId(req.params.applicationId), req.user.id, { requestId: req.requestId });
    res.json(response.success(null, '报名草稿已删除'));
  } catch (error) { next(error); }
};
