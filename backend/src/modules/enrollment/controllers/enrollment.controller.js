const response = require('../../../common/response');
const { ApiError, ValidationError, NotFoundError } = require('../../../common/utils/error');
const service = require('../services');
const captcha = require('../utils/captcha');
const {
  STAGES,
  CATEGORIES,
  PUBLICATION_TYPES,
} = require('../domain/constants');
const validation = require('../validations/enrollment.validation');

const context = (req) => ({ requestId: req.requestId });
const send = (res, data, message = '操作成功', status = 200) => (
  res.status(status).json(response.success(data, message))
);
const wrap = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

const ensureType = (type) => {
  if (!PUBLICATION_TYPES.includes(type)) throw new NotFoundError('公示类型不存在');
  return type;
};

const queryFailures = new Map();
const queryAttempts = new Map();
const QUERY_WINDOW_MS = 5 * 60 * 1000;
const QUERY_LOCK_MS = 10 * 60 * 1000;

const publicQueryKey = (req) => {
  const network = String(req.ip || req.socket?.remoteAddress || 'unknown').toLowerCase();
  return network.startsWith('::ffff:') ? network.slice(7) : network;
};
const getFailureState = (key) => {
  const current = queryFailures.get(key);
  const now = Date.now();
  if (current?.lockedUntil > now) return current;
  if (!current || current.windowStartedAt + QUERY_WINDOW_MS < now) {
    const fresh = { failures: 0, windowStartedAt: now, lockedUntil: 0 };
    queryFailures.set(key, fresh);
    return fresh;
  }
  return current;
};
const checkPublicQueryLimit = (req) => {
  const key = publicQueryKey(req);
  const now = Date.now();
  const attempts = (queryAttempts.get(key) || []).filter((timestamp) => timestamp + QUERY_WINDOW_MS > now);
  if (attempts.length >= 20) {
    throw new ApiError('查询过于频繁，请稍后再试', 1008, 429);
  }
  attempts.push(now);
  queryAttempts.set(key, attempts);
  const state = getFailureState(key);
  if (state.lockedUntil > Date.now()) {
    throw new ApiError('查询尝试过多，请稍后再试', 1008, 429);
  }
};
const recordPublicQueryFailure = (req) => {
  const state = getFailureState(publicQueryKey(req));
  state.failures += 1;
  if (state.failures >= 5) state.lockedUntil = Date.now() + QUERY_LOCK_MS;
};
const clearPublicQueryFailures = (req) => queryFailures.delete(publicQueryKey(req));

exports.getPortal = wrap(async (req, res) => send(res, await service.getPortal()));

exports.getWindows = wrap(async (req, res) => {
  const filters = validation.validateSchoolFilters(req.query);
  send(res, await service.getWindows(filters));
});

exports.getSchools = wrap(async (req, res) => {
  const filters = validation.validateSchoolFilters(req.query);
  send(res, await service.getSchools(filters));
});

exports.getSchool = wrap(async (req, res) => send(res, await service.getSchool(req.params.schoolId, false)));
exports.getSchoolPolicy = wrap(async (req, res) => send(res, await service.getSchool(req.params.schoolId, true)));

exports.getContents = wrap(async (req, res) => {
  const stage = req.query.stage;
  const category = req.query.category;
  if (stage && !STAGES.includes(stage)) throw new ValidationError('学段不正确');
  if (category && !CATEGORIES.includes(category)) throw new ValidationError('报名类别不正确');
  send(res, await service.getContents({
    type: req.query.type,
    stage,
    category,
    keyword: req.query.keyword,
  }));
});

exports.getFaqs = wrap(async (req, res) => send(res, await service.getContents({
  type: 'faq',
  keyword: req.query.keyword,
})));

exports.getGuides = wrap(async (req, res) => {
  if (req.query.stage && !STAGES.includes(req.query.stage)) throw new ValidationError('学段不正确');
  send(res, await service.getContents({ type: 'guide', stage: req.query.stage }));
});

exports.searchDistrict = wrap(async (req, res) => send(res, await service.searchDistrict(req.query.keyword)));

exports.createApplication = wrap(async (req, res) => {
  const input = validation.validateCreateApplication(req.body);
  send(res, await service.createApplication(req.user.id, input, context(req)), '报名草稿已创建', 201);
});

exports.listApplications = wrap(async (req, res) => {
  if (req.query.stage && !STAGES.includes(req.query.stage)) throw new ValidationError('学段不正确');
  send(res, await service.listApplications(req.user.id, req.query));
});

exports.getApplication = wrap(async (req, res) => (
  send(res, await service.getApplication(req.params.applicationId, req.user.id, context(req)))
));

exports.updateDraft = wrap(async (req, res) => {
  const input = validation.validateDraftUpdate(req.body);
  send(res, await service.updateDraft(req.params.applicationId, req.user.id, input, context(req)), '草稿已保存');
});

exports.changeSchool = wrap(async (req, res) => {
  const input = validation.validateSchoolChange(req.body);
  send(res, await service.changeSchool(req.params.applicationId, req.user.id, input, context(req)), '报名学校已更换');
});

exports.confirmPolicy = wrap(async (req, res) => {
  const input = validation.validatePolicyConfirmation(req.body);
  send(res, await service.confirmPolicy(req.params.applicationId, req.user.id, input, context(req)), '政策已确认');
});

exports.runVerifications = wrap(async (req, res) => {
  const input = validation.validateVerificationRequest(req.body);
  send(res, await service.runVerifications(req.params.applicationId, req.user.id, input, context(req)), '共享数据查询已完成');
});

exports.updateVerification = wrap(async (req, res) => {
  const input = validation.validateVerificationUpdate(req.body);
  send(res, await service.updateVerification(
    req.params.applicationId,
    req.params.verificationId,
    req.user.id,
    input,
    context(req)
  ), '申报数据已保存');
});

exports.addMaterial = wrap(async (req, res) => {
  const input = validation.validateMaterial(req.body);
  send(res, await service.addMaterial(req.params.applicationId, req.user.id, input, context(req)), '材料已关联', 201);
});

exports.removeMaterial = wrap(async (req, res) => send(res, await service.removeMaterial(
  req.params.applicationId,
  req.params.materialId,
  req.user.id,
  context(req)
), '材料已移除'));

exports.reorderMaterials = wrap(async (req, res) => {
  const items = validation.validateMaterialOrder(req.body);
  send(res, await service.reorderMaterials(req.params.applicationId, req.user.id, items, context(req)), '材料顺序已保存');
});

exports.submitApplication = wrap(async (req, res) => {
  const input = validation.validateSubmission(req.body);
  send(res, await service.submitApplication(req.params.applicationId, req.user.id, input, context(req)), '报名已提交');
});

exports.reviewApplication = wrap(async (req, res) => {
  const input = validation.validateReview(req.body);
  send(res, await service.reviewApplication(req.params.applicationId, req.user, input, context(req)), '审核结果已保存');
});

exports.listReviewApplications = wrap(async (req, res) => {
  if (req.query.stage && !STAGES.includes(req.query.stage)) throw new ValidationError('学段不正确');
  send(res, await service.listReviewApplications(req.query, req.user));
});

exports.getReviewApplication = wrap(async (req, res) => send(
  res,
  await service.getReviewApplication(req.params.applicationId, req.user, context(req))
));

exports.getReviewMaterialFile = wrap(async (req, res) => {
  const file = await service.getReviewMaterialFile(
    req.params.applicationId,
    req.params.materialId,
    req.user,
    context(req)
  );
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.filename)}"`);
  file.stream.pipe(res);
});

exports.admitApplication = wrap(async (req, res) => {
  const input = validation.validateAdmission(req.body);
  send(res, await service.admitApplication(req.params.applicationId, req.user.id, input, context(req)), '录取结果已保存');
});

exports.setPublication = wrap(async (req, res) => {
  const type = ensureType(req.params.type);
  const input = validation.validatePublication(type, req.body);
  send(res, await service.setPublication(type, req.user.id, input, context(req)), '公示设置已保存');
});

exports.getPublicationStatus = wrap(async (req, res) => {
  const type = ensureType(req.params.type);
  send(res, await service.getPublicationStatus(type));
});

exports.getCaptcha = wrap(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  send(res, captcha.createCaptcha());
});

exports.publicQuery = wrap(async (req, res) => {
  const type = ensureType(req.params.type);
  checkPublicQueryLimit(req);
  const input = validation.validatePublicQuery(req.body);
  if (!captcha.verifyCaptcha(input.captchaToken, input.captchaCode)) {
    recordPublicQueryFailure(req);
    await service.recordPublicQueryAttempt(type, 'captcha_failed', context(req));
    throw new ValidationError('未查询到匹配结果或信息有误');
  }
  try {
    const result = await service.publicQuery(type, input, context(req));
    clearPublicQueryFailures(req);
    res.setHeader('Cache-Control', 'no-store');
    send(res, result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      recordPublicQueryFailure(req);
      await service.recordPublicQueryAttempt(type, 'not_matched', context(req));
    }
    throw error;
  }
});
