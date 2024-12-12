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
};
