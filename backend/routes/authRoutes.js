import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import {
  disableOTP,
  changePassword,
  getMe,
  login,
  register,
  setupOTP,
  updateProfile,
  validateAccount,
  verifyAndEnableOTP,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const oauthSuccess = (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  const target = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`;
  res.redirect(target);
};

const requireStrategy = (strategyName) => (req, res, next) => {
  if (!passport._strategy(strategyName)) {
    return res.status(501).json({
      success: false,
      message: `Le fournisseur ${strategyName} n'est pas configure dans .env`,
    });
  }
  next();
};

router.post('/register', register);
router.post('/login', login);
router.post('/validate-account', validateAccount);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/otp/setup', protect, setupOTP);
router.post('/otp/verify', protect, verifyAndEnableOTP);
router.post('/otp/disable', protect, disableOTP);

router.get('/google', requireStrategy('google'), passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', requireStrategy('google'), passport.authenticate('google', { failureRedirect: '/', session: false }), oauthSuccess);

export default router;
