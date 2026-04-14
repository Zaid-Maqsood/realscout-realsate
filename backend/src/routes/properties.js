const router = require('express').Router();
const { body } = require('express-validator');
const {
  getProperties, getPropertyById,
  createProperty, updateProperty, deleteProperty,
} = require('../controllers/propertyController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected
router.post(
  '/',
  verifyToken,
  upload.array('images', 10),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('price').isNumeric().withMessage('Valid price required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
  ],
  createProperty
);

router.put('/:id', verifyToken, upload.array('images', 10), updateProperty);

router.delete('/:id', verifyToken, deleteProperty);

module.exports = router;
