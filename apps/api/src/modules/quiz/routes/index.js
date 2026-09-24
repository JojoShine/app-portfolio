const router = require('express').Router();
const controller = require('../controllers/quiz.controller');
const { requireAuth } = require('../../../common/middleware/authorize');

router.get('/assets/:id', controller.asset);
router.use(requireAuth);
router.get('/read', controller.read);
router.post('/start', controller.start);
router.post('/answer', controller.answer);
router.post('/next', controller.next);

module.exports = router;
