const router = require('express').Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', verifyToken, requireRole('admin', 'agent'), getAnalytics);

module.exports = router;
