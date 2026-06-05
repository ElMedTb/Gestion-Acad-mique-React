import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import {
  hashValidationToken,
} from '../utils/accountValidation.js';
import { normalizeInternationalPhone } from '../utils/phone.js';
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const buildUserProfile = async (user) => {
  let profile = null;

  // On rattache le dossier metier au compte connecte pour eviter un deuxieme appel cote front.
  if (user.role === 'student') {
    profile = await Student.findOne({ user: user._id })
      .populate('diploma', 'name code')
      .lean();
  }

  if (user.role === 'teacher') {
    profile = await Teacher.findOne({ user: user._id }).lean();
  }

  return {
    id: user._id,
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    otpEnabled: user.otpEnabled,
    emailVerified: user.emailVerified,
    mustChangePassword: user.mustChangePassword,
    profile,
  };
};
export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
      });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'student',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const { email, password, otpToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe',
      });
    }
    const user = await User.findOne({ email }).select('+password +otpSecret');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ce compte a été désactivé',
      });
    }

    if (user.emailVerified === false) {
      return res.status(403).json({
        success: false,
        message: 'Veuillez valider votre compte avec le lien envoye avant de vous connecter',
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides',
      });
    }
    if (user.otpEnabled) {
      // L'OTP n'est demande que pour les comptes qui l'ont active dans l'espace securite.
      if (!otpToken) {
        return res.status(400).json({
          success: false,
          message: 'Le code OTP est requis',
          otpRequired: true,
        });
      }

      const isValidOTP = authenticator.check(otpToken, user.otpSecret);
      if (!isValidOTP) {
        return res.status(401).json({
          success: false,
          message: 'Code OTP invalide',
        });
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: await buildUserProfile(user),
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: await buildUserProfile(user),
    });
  } catch (error) {
    next(error);
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      photo,
      address,
      level,
      className,
      filiere,
      group,
      speciality,
      office,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouve' });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    await user.save();

    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        if (phone !== undefined) student.phone = normalizeInternationalPhone(phone);
        if (photo !== undefined) student.photo = photo;
        if (address !== undefined) student.address = { ...student.address, ...address };
        if (level !== undefined) student.level = level;
        if (className !== undefined) student.className = className;
        if (filiere !== undefined) student.filiere = filiere;
        if (group !== undefined) student.group = group;
        await student.save();
      }
    }

    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (teacher) {
        if (phone !== undefined) teacher.phone = normalizeInternationalPhone(phone);
        if (photo !== undefined) teacher.photo = photo;
        if (speciality !== undefined) teacher.speciality = speciality;
        if (office !== undefined) teacher.office = office;
        await teacher.save();
      }
    }

    res.json({
      success: true,
      message: 'Profil mis a jour avec succes',
      data: await buildUserProfile(user),
    });
  } catch (error) {
    next(error);
  }
};
export const validateAccount = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le token et le nouveau mot de passe sont requis',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caracteres',
      });
    }

    const user = await User.findOne({
      validationToken: hashValidationToken(token),
      validationTokenExpires: { $gt: new Date() },
    }).select('+validationToken +validationTokenExpires +password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Lien de validation invalide ou expire',
      });
    }

    user.password = newPassword;
    user.emailVerified = true;
    // Le lien de validation force deja le choix d'un vrai mot de passe avant la premiere connexion.
    user.mustChangePassword = false;
    user.validationToken = undefined;
    user.validationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Compte valide avec succes. Vous pouvez vous connecter.',
    });
  } catch (error) {
    next(error);
  }
};
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel invalide',
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe mis a jour',
    });
  } catch (error) {
    next(error);
  }
};
export const setupOTP = async (req, res, next) => {
  try {
    const secret = authenticator.generateSecret();
    await User.findByIdAndUpdate(req.user._id, { otpSecret: secret });

    // Format standard reconnu par Google Authenticator, Microsoft Authenticator, etc.
    const otpauthUrl = authenticator.keyuri(
      req.user.email,
      'Academic Management',
      secret
    );
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    res.json({
      success: true,
      message: 'Secret OTP pret. Scannez le QR code avec votre application d\'authentification.',
      data: {
        secret,
        qrCodeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const verifyAndEnableOTP = async (req, res, next) => {
  try {
    const { otpToken } = req.body;

    if (!otpToken) {
      return res.status(400).json({
        success: false,
        message: 'Le code OTP est requis',
      });
    }

    const user = await User.findById(req.user._id).select('+otpSecret');

    if (!user || !user.otpSecret) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez d\'abord configurer l\'OTP via /api/auth/otp/setup',
      });
    }

    const isValid = authenticator.check(otpToken, user.otpSecret);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Code OTP invalide — veuillez réessayer',
      });
    }

    user.otpEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: 'L\'authentification à deux facteurs (OTP) est maintenant activée',
    });
  } catch (error) {
    next(error);
  }
};
export const disableOTP = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      otpEnabled: false,
      otpSecret: null,
    });

    res.json({
      success: true,
      message: 'L\'authentification à deux facteurs (OTP) a été désactivée',
    });
  } catch (error) {
    next(error);
  }
};
