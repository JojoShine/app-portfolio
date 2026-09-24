const router = require('express').Router();
const { requireAuth } = require('../../../common/middleware/authorize');
const { upload, processFile } = require('../../../common/middleware/upload');
const rateLimit = require('../../../common/middleware/rateLimit');
const validation = require('../validations/report.validation');
const report = require('../controllers/report.controller');
const analysis = require('../controllers/analysis.controller');
const photo = require('../controllers/photo.controller');
const location = require('../controllers/location.controller');
const validate = (parser, source = (req) => req.body) => (req, res, next) => {
  try { req.validated = parser(source(req)); next(); } catch (error) { next(error); }
};
router.use(requireAuth);
router.post('/photos', rateLimit(30, 600000), upload.single('file'), processFile, photo.upload);
router.post('/analyses', rateLimit(10, 600000), validate(validation.photos), analysis.create);
router.post('/reports', rateLimit(20, 600000), validate(validation.report), report.create);
router.get('/reports', validate(validation.page, (req) => req.query), report.list);
router.get('/reports/:id', validate(validation.uuid, (req) => req.params.id), report.detail);
router.get('/locations/reverse', rateLimit(60, 600000), validate(validation.coordinates, (req) => req.query), location.reverse);
router.get('/locations/search', rateLimit(60, 600000), validate(validation.search, (req) => req.query), location.search);
module.exports = router;
