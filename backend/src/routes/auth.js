const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Valid email required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', verifyToken, getMe);

module.exports = router;
