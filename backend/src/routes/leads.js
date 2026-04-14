const router = require('express').Router();
const { body } = require('express-validator');
const { getLeads, getLeadById, createLead, updateLead, addNote } = require('../controllers/leadController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Public — submit inquiry
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  ],
  createLead
);

// Protected
router.get('/', verifyToken, requireRole('admin', 'agent'), getLeads);
router.get('/:id', verifyToken, requireRole('admin', 'agent'), getLeadById);
router.put('/:id', verifyToken, requireRole('admin', 'agent'), updateLead);
router.post('/:id/notes', verifyToken, requireRole('admin', 'agent'), addNote);

module.exports = router;
