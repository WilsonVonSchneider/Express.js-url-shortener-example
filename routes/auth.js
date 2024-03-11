const express = require('express');
const router = express.Router();
const authValidation = require('../validations/AuthValidations');
const authController = require('../controller/AuthController');

router.post('/register', authValidation.store, authController.create);
router.post('/login', authValidation.login, authController.login);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refreshToken);
router.get('/verify-email/resend', authValidation.resendEmail, authController.resendVerificationEmail);
router.get('/verify-email/:actionTokenId', authController.verifyEmail);

module.exports = router;