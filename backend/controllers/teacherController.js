import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import UE from '../models/UE.js';
import Student from '../models/Student.js';
import {
  buildValidationLink,
  generateTemporaryPassword,
  generateValidationToken,
} from '../utils/accountValidation.js';
import { deliverNotification } from '../utils/notificationDelivery.js';
import { normalizeInternationalPhone } from '../utils/phone.js';

const getTeacherScope = async (userId) => {
  const teacher = await Teacher.findOne({ user: userId })
    .populate('user', 'firstName lastName email role')
    .lean();

  if (!teacher) {
    return { teacher: null, courses: [], ues: [], diplomaIds: [] };
  }

  const courses = await Course.find({ teacher: teacher._id })
    .populate('prerequisites', 'name code')
    .lean();
  const courseIds = courses.map((course) => course._id);
  const ues = await UE.find({
    $or: [
      { referentTeacher: teacher._id },
      { courses: { $in: courseIds } },
    ],
  })
    .populate('courses', 'name code coefficient credits teacher')
    .populate('diploma', 'name code')
    .lean();
  const diplomaIds = [
    ...new Set(
      ues
        .map((ue) => ue.diploma?._id || ue.diploma)
        .filter(Boolean)
        .map((id) => id.toString())
    ),
  ];

  return { teacher, courses, ues, diplomaIds };
};
export const getTeachers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      Teacher.find()
        .populate('user', 'firstName lastName email isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Teacher.countDocuments(),
    ]);

    res.json({
      success: true,
      count: teachers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTeacherProfile = async (req, res, next) => {
  try {
    const { teacher } = await getTeacherScope(req.user._id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouve' });
    }

    res.json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

export const getMyTeacherCourses = async (req, res, next) => {
  try {
    const { teacher, courses } = await getTeacherScope(req.user._id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouve' });
    }

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getMyTeacherUEs = async (req, res, next) => {
  try {
    const { teacher, ues } = await getTeacherScope(req.user._id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouve' });
    }

    res.json({ success: true, count: ues.length, data: ues });
  } catch (error) {
    next(error);
  }
};

export const getMyTeacherStudents = async (req, res, next) => {
  try {
    const { teacher, diplomaIds } = await getTeacherScope(req.user._id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouve' });
    }

    const students = diplomaIds.length
      ? await Student.find({
          $or: [
            { diploma: { $in: diplomaIds } },
            { doubleDiplomation: { $in: diplomaIds } },
          ],
        })
          .populate('user', 'firstName lastName email isActive')
          .populate('diploma', 'name code')
          .populate('doubleDiplomation', 'name code')
          .sort({ studentId: 1 })
          .lean()
      : [];

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};
export const getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'firstName lastName email role isActive');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }

    res.json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};
export const createTeacher = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, speciality, phone, office, photo } = req.body;
    const normalizedPhone = normalizeInternationalPhone(phone);
    const temporaryPassword = password || generateTemporaryPassword();
    const { plainToken, hashedToken } = generateValidationToken();

    // Meme parcours que les etudiants: compte cree par l'administration, activation par email.
    const user = await User.create({
      email,
      password: temporaryPassword,
      firstName,
      lastName,
      role: 'teacher',
      emailVerified: false,
      mustChangePassword: true,
      validationToken: hashedToken,
      validationTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const teacher = await Teacher.create({
      user: user._id,
      speciality,
      phone: normalizedPhone,
      office,
      photo,
    });

    const populated = await Teacher.findById(teacher._id)
      .populate('user', 'firstName lastName email role');
    const validationLink = buildValidationLink(plainToken);
    // Le detail de livraison revient dans la reponse pour faciliter les tests SMTP.
    const emailDelivery = await deliverNotification({
      channel: 'email',
      recipient: user.email,
      recipientRole: 'teacher',
      recipientUserId: user._id,
      subject: 'Validation de votre compte academique',
      message: `Bonjour ${firstName},\n\nVotre compte professeur a ete cree.\nEmail: ${user.email}\nMot de passe temporaire: ${temporaryPassword}\nLien de validation: ${validationLink}`,
    });

    res.status(201).json({
      success: true,
      message: 'Enseignant créé avec succès',
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
export const updateTeacher = async (req, res, next) => {
  try {
    const { firstName, lastName, email, speciality, phone, office, photo } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }
    if (firstName || lastName || email) {
      const userUpdate = {};
      if (firstName) userUpdate.firstName = firstName;
      if (lastName) userUpdate.lastName = lastName;
      if (email) userUpdate.email = email;
      await User.findByIdAndUpdate(teacher.user, userUpdate);
    }
    if (speciality !== undefined) teacher.speciality = speciality;
    if (phone !== undefined) teacher.phone = normalizeInternationalPhone(phone);
    if (office !== undefined) teacher.office = office;
    if (photo !== undefined) teacher.photo = photo;

    await teacher.save();

    const populated = await Teacher.findById(teacher._id)
      .populate('user', 'firstName lastName email role');

    res.json({
      success: true,
      message: 'Enseignant mis à jour avec succès',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }

    await User.findByIdAndUpdate(teacher.user, { isActive: false });

    res.json({ success: true, message: 'Enseignant désactivé avec succès' });
  } catch (error) {
    next(error);
  }
};
export const getTeacherCourses = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }

    const courses = await Course.find({ teacher: teacher._id })
      .populate('prerequisites', 'name code')
      .lean();

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};
export const getTeacherUEs = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Enseignant non trouvé' });
    }

    const courses = await Course.find({ teacher: teacher._id }).select('_id').lean();
    const ues = await UE.find({
      $or: [
        { referentTeacher: teacher._id },
        { courses: { $in: courses.map((course) => course._id) } },
      ],
    })
      .populate('courses', 'name code')
      .populate('diploma', 'name code')
      .lean();

    res.json({
      success: true,
      count: ues.length,
      data: ues,
    });
  } catch (error) {
    next(error);
  }
};
