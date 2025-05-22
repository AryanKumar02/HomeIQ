import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import * as validators from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', validators.registerValidator, validate, authController.register);
router.post('/login', validators.loginValidator, validate, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post(
  '/resend-verification',
  validators.forgotPasswordValidator,
  validate,
  authController.resendVerification,
);
router.post(
  '/forgot-password',
  validators.forgotPasswordValidator,
  validate,
  authController.forgotPassword,
);
router.post(
  '/reset-password/:token',
  validators.resetPasswordValidator,
  validate,
  authController.resetPassword,
);
router.get('/me', protect, authController.getMe);
router.post(
  '/update-password',
  protect,
  validators.updatePasswordValidator,
  validate,
  authController.updatePassword,
);

export default router;
