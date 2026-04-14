const router = require('express').Router();
const { getUsers, updateUserRole, deleteUser, getAgentsList } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Admin only — full user list
router.get('/', verifyToken, requireRole('admin'), getUsers);

// Admin + agent — agents list only (used for lead assignment dropdown)
router.get('/agents', verifyToken, requireRole('admin', 'agent'), getAgentsList);

router.put('/:id/role', verifyToken, requireRole('admin'), updateUserRole);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

module.exports = router;
