const response = require('../../../common/response');
const service = require('../services/quiz.service');

const wrap = (handler) => async (req, res, next) => {
  try { res.json(response.success(await handler(req))); } catch (error) { next(error); }
};

exports.read = wrap((req) => service.read(req.user.id));
exports.start = wrap((req) => service.start(req.user.id, req.body.id));
exports.answer = wrap((req) => service.answer(req.user.id, req.body));
exports.next = wrap((req) => service.next(req.user.id, req.body));
exports.asset = async (req, res, next) => {
  try {
    const file = await service.asset(req.params.id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    file.stream.pipe(res);
  } catch (error) { next(error); }
};
