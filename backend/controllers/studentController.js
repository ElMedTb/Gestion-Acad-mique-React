import Student from '../models/Student.js';
import User from '../models/User.js';
import Grade from '../models/Grade.js';
import UE from '../models/UE.js';
import { validateUE, calculateWeightedAverage } from '../utils/academicValidation.js';
import {
  buildValidationLink,
  generateTemporaryPassword,
  generateValidationToken,
} from '../utils/accountValidation.js';
import { deliverNotification } from '../utils/notificationDelivery.js';
import { normalizeInternationalPhone } from '../utils/phone.js';
export const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    let query = {};

    if (search) {
      query = { studentId: { $regex: search, $options: 'i' } };
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('user', 'firstName lastName email isActive')
        .populate('diploma', 'name code')
        .populate('doubleDiplomation', 'name code')
        .populate('courses', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);
    let filtered = students;
    if (search && !students.length) {
      const allStudents = await Student.find()
        .populate('user', 'firstName lastName email isActive')
        .populate('diploma', 'name code')
        .populate('doubleDiplomation', 'name code')
        .populate('courses', 'name code')
        .lean();

      const re = new RegExp(search, 'i');
      filtered = allStudents.filter(
        (s) =>
          s.user &&
          (re.test(s.user.firstName) ||
            re.test(s.user.lastName) ||
            re.test(s.user.email) ||
            re.test(s.studentId))
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};
export const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'firstName lastName email role isActive otpEnabled')
      .populate('diploma', 'name code description duration')
      .populate('doubleDiplomation', 'name code')
      .populate('courses', 'name code');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé',
      });
    }

    if (
      req.user?.role === 'student' &&
      student.user?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Acces limite a votre propre dossier',
      });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};
export const createStudent = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
      level,
      className,
      filiere,
      group,
      diploma,
      doubleDiplomation,
      courses,
    } = req.body;
    const normalizedPhone = normalizeInternationalPhone(phone);
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const temporaryPassword = password || generateTemporaryPassword();
    const { plainToken, hashedToken } = generateValidationToken();
    let user = await User.findOne({ email: normalizedEmail });
    let createdUser = false;

    if (user) {
      if (user.role !== 'student') {
        return res.status(409).json({
          success: false,
          message: 'Un compte existe deja avec cet email et ce role ne correspond pas a un etudiant',
        });
      }

      const existingStudent = await Student.findOne({ user: user._id });
      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: 'Un etudiant existe deja avec cet email',
        });
      }

      user.firstName = firstName;
      user.lastName = lastName;
      user.password = temporaryPassword;
      user.emailVerified = false;
      user.mustChangePassword = true;
      user.validationToken = hashedToken;
      user.validationTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();
    } else {
      // La scolarite cree le compte; l'etudiant recoit ensuite le lien et le mot de passe temporaire par email.
      user = await User.create({
        email: normalizedEmail,
        password: temporaryPassword,
        firstName,
        lastName,
        role: 'student',
        emailVerified: false,
        mustChangePassword: true,
        validationToken: hashedToken,
        validationTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      createdUser = true;
    }

    let student;
    try {
      student = await Student.create({
        user: user._id,
        dateOfBirth,
        phone: normalizedPhone,
        address,
        level,
        className,
        filiere,
        group,
        diploma,
        doubleDiplomation,
        courses,
      });
    } catch (error) {
      if (createdUser) {
        await User.findByIdAndDelete(user._id);
      }
      throw error;
    }

    const populated = await Student.findById(student._id)
      .populate('user', 'firstName lastName email role')
      .populate('diploma', 'name code')
      .populate('doubleDiplomation', 'name code')
      .populate('courses', 'name code');
    const validationLink = buildValidationLink(plainToken);
    // Si le SMTP n'est pas configure, le statut "dev" permet quand meme de tester le flux depuis l'API.
    const emailDelivery = await deliverNotification({
      channel: 'email',
      recipient: user.email,
      recipientRole: 'student',
      recipientUserId: user._id,
      subject: 'Validation de votre compte academique',
      message: `Bonjour ${firstName},\n\nVotre compte etudiant a ete cree.\nEmail: ${user.email}\nMot de passe temporaire: ${temporaryPassword}\nLien de validation: ${validationLink}`,
    });

    res.status(201).json({
      success: true,
      message: 'Étudiant créé avec succès',
      data: populated,
      validation: {
        temporaryPassword,
        validationLink,
        emailDelivery,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const updateStudent = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      phone,
      address,
      level,
      className,
      filiere,
      group,
      diploma,
      doubleDiplomation,
      courses,
      photo,
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé',
      });
    }

    const isOwnStudent =
      req.user?.role === 'student' &&
      student.user.toString() === req.user._id.toString();

    if (req.user?.role === 'student' && !isOwnStudent) {
      return res.status(403).json({
        success: false,
        message: 'Acces limite a votre propre profil',
      });
    }
    if (firstName || lastName || (email && req.user?.role !== 'student')) {
      const userUpdate = {};
      if (firstName) userUpdate.firstName = firstName;
      if (lastName) userUpdate.lastName = lastName;
      if (email && req.user?.role !== 'student') userUpdate.email = email;
      await User.findByIdAndUpdate(student.user, userUpdate);
    }
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
    if (phone !== undefined) student.phone = normalizeInternationalPhone(phone);
    if (address) student.address = { ...student.address, ...address };
    if (level !== undefined) student.level = level;
    if (className !== undefined) student.className = className;
    if (filiere !== undefined) student.filiere = filiere;
    if (group !== undefined) student.group = group;
    if (photo !== undefined) student.photo = photo;
    if (diploma !== undefined && req.user?.role !== 'student') student.diploma = diploma;
    if (doubleDiplomation !== undefined && req.user?.role !== 'student') {
      student.doubleDiplomation = doubleDiplomation;
    }
    if (courses !== undefined && req.user?.role !== 'student') {
      student.courses = courses;
    }

    await student.save();

    const populated = await Student.findById(student._id)
      .populate('user', 'firstName lastName email role')
      .populate('diploma', 'name code')
      .populate('doubleDiplomation', 'name code')
      .populate('courses', 'name code');

    res.json({
      success: true,
      message: 'Étudiant mis à jour avec succès',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé',
      });
    }
    await User.findByIdAndUpdate(student.user, { isActive: false });

    res.json({
      success: true,
      message: 'Étudiant désactivé avec succès',
    });
  } catch (error) {
    next(error);
  }
};
export const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un fichier image',
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé',
      });
    }

    if (req.user?.role === 'student' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acces limite a votre propre photo',
      });
    }

    student.photo = req.file.path.replace(/\\/g, '/'); // normalise Windows paths
    await student.save();

    res.json({
      success: true,
      message: 'Photo téléchargée avec succès',
      data: { photo: student.photo },
    });
  } catch (error) {
    next(error);
  }
};
export const getStudentGrades = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé',
      });
    }

    if (req.user?.role === 'student' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acces limite a vos propres notes',
      });
    }

    const grades = await Grade.find({ student: student._id })
      .populate('course', 'name code coefficient')
      .populate('ue', 'name code')
      .populate('gradedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: grades.length,
      data: grades,
    });
  } catch (error) {
    next(error);
  }
};
export const getStudentStats = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('diploma');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé',
      });
    }

    if (req.user?.role === 'student' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acces limite a vos propres statistiques',
      });
    }
    const grades = await Grade.find({ student: student._id })
      .populate('course', 'name code coefficient')
      .lean();
    const overallAverage =
      grades.length > 0
        ? Math.round(
            (grades.reduce((sum, g) => sum + g.value, 0) / grades.length) * 100
          ) / 100
        : 0;
    let ueResults = [];
    if (student.diploma) {
      const ues = await UE.find({ diploma: student.diploma._id || student.diploma })
        .populate('courses', 'name code coefficient')
        .lean();

      ueResults = ues.map((ue) => {
        const ueGrades = grades.filter(
          (g) => g.ue && g.ue.toString() === ue._id.toString()
        );
        return {
          ue: { id: ue._id, name: ue.name, code: ue.code },
          ...validateUE(ueGrades, ue),
        };
      });
    }

    const validatedUEs = ueResults.filter((r) => r.validated).length;
    const totalUEs = ueResults.length;

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          studentId: student.studentId,
        },
        overallAverage,
        totalGrades: grades.length,
        ueValidation: {
          validated: validatedUEs,
          total: totalUEs,
          details: ueResults,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
