import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import User from '../models/User.js';
export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé — aucun token fourni",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "L'utilisateur associé à ce token n'existe plus",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ce compte a été désactivé',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expiré' });
    }
    next(error);
  }
};
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle « ${req.user.role} » n'est pas autorisé à accéder à cette ressource`,
      });
    }

    next();
  };
};
export const verifyOTP = async (req, res, next) => {
  try {
    if (!req.user.otpEnabled) {
      return next(); // OTP not enabled — skip
    }

    const { otpToken } = req.body;

    if (!otpToken) {
      return res.status(400).json({
        success: false,
        message: "Le code OTP est requis pour cette action",
      });
    }
    const user = await User.findById(req.user._id).select('+otpSecret');

    if (!user || !user.otpSecret) {
      return res.status(400).json({
        success: false,
        message: "OTP n'est pas configuré correctement",
      });
    }

    const isValid = authenticator.check(otpToken, user.otpSecret);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Code OTP invalide',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
