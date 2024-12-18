const { check } = require('express-validator');

module.exports = {
  parseEmail: check('email').trim().normalizeEmail().isEmail().withMessage('Must be a valid email'),
  parsePassword: check('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Must be between 4 and 20 characters'),
  parsePasswordConfirmation: check('passwordConfirmation')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Must be between 4 and 20 characters'),
  parseTitle: check('title')
    .trim()
    .isLength({ min: 5, max: 40 })
    .withMessage('Must be between 5 and 40 characters'),
  parsePrice: check('price').trim().toFloat().isFloat({ min: 1 }).withMessage('Invalid value'),
  requireImage: check('image').custom(async (image, { req }) => {
    const img = await req.file;
    if (!img) {
      throw new Error('Please upload an image');
    }
  }),
};
