import Grade from '../models/Grade.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import UE from '../models/UE.js';
import Notification from '../models/Notification.js';
import { validateUE } from '../utils/academicValidation.js';
import { deliverNotification } from '../utils/notificationDelivery.js';

const populateGrade = (query) =>
  query
    .populate({
      path: 'student',
      select: 'studentId user diploma',
      populate: { path: 'user', select: 'firstName lastName email' },
    })
    .populate('course', 'name code coefficient credits teacher')
    .populate('ue', 'name code eliminatoryThreshold semester')
    .populate('gradedBy', 'firstName lastName email');

const teacherCanGrade = async (teacherId, gradePayload) => {
  const course = await Course.findOne({ _id: gradePayload.course, teacher: teacherId }).lean();
  if (!course) return false;

  // Le professeur ne peut noter que ses matieres, dans une UE liee au diplome de l'etudiant.
  const ue = await UE.findOne({ _id: gradePayload.ue, courses: course._id }).lean();
  if (!ue) return false;

  const student = await Student.findById(gradePayload.student).lean();
  const diplomaIds = [
    student?.diploma,
    ...(student?.doubleDiplomation || []),
  ].filter(Boolean).map((id) => id.toString());

  return Boolean(ue.diploma && diplomaIds.includes(ue.diploma.toString()));
};

const notifyStudentAboutGrade = async (grade, createdBy) => {
  const studentUser = grade.student?.user;
  if (!studentUser?.email) return;

  // Les notes normales restent sur la plateforme; une note eliminatoire declenche aussi un email.
  const isEliminatory = Number(grade.value) < Number(grade.ue?.eliminatoryThreshold || 6);
  const subject = isEliminatory ? 'Note eliminatoire saisie' : 'Nouvelle note disponible';
  const message = `${subject}: ${grade.course?.name || 'Matiere'} - ${grade.value}/20.`;
  const delivery = isEliminatory
    ? await deliverNotification({
        channel: 'email',
        recipient: studentUser.email,
        recipientRole: 'student',
        recipientUserId: studentUser._id,
        subject,
        message,
      })
    : { status: 'dev', detail: 'Notification plateforme uniquement' };

  await Notification.create({
    channel: 'email',
    recipient: studentUser.email,
    recipientRole: 'student',
    recipientUser: studentUser._id,
    subject,
    message,
    status: delivery.status,
    deliveryDetail: delivery.detail,
    createdBy,
  });
};

export const getGrades = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.ue) filter.ue = req.query.ue;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.user?.role === 'student') {
      const student = await Student.findOne({ user: req.user._id }).lean();
      filter.student = student?._id;
    }
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      const courses = await Course.find({ teacher: teacher?._id }).select('_id').lean();
      filter.course = { $in: courses.map((course) => course._id) };
    }

    const [grades, total] = await Promise.all([
      populateGrade(Grade.find(filter))
        .sort({ academicYear: -1, semester: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Grade.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: grades.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: grades,
    });
  } catch (error) {
    next(error);
  }
};

export const getGrade = async (req, res, next) => {
  try {
    const grade = await populateGrade(Grade.findById(req.params.id));
    if (!grade) {
      return res.status(404).json({ success: false, message: 'Note non trouvee' });
    }
    if (req.user?.role === 'student' && grade.student?.user?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Acces limite a vos propres notes' });
    }
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      if (grade.course?.teacher?.toString() !== teacher?._id?.toString()) {
        return res.status(403).json({ success: false, message: 'Acces limite aux notes de vos matieres' });
      }
    }
    res.json({ success: true, data: grade });
  } catch (error) {
    next(error);
  }
};

export const createGrade = async (req, res, next) => {
  try {
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      const allowed = await teacherCanGrade(teacher?._id, req.body);
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'Saisie limitee a vos matieres et aux etudiants concernes' });
      }
    }

    const grade = await Grade.create({ ...req.body, gradedBy: req.user?._id });
    const populated = await populateGrade(Grade.findById(grade._id));
    await notifyStudentAboutGrade(populated, req.user?._id);

    res.status(201).json({
      success: true,
      message: 'Note creee avec succes',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateGrades = async (req, res, next) => {
  try {
    const grades = Array.isArray(req.body.grades) ? req.body.grades : [];
    if (!grades.length) {
      return res.status(400).json({ success: false, message: 'Aucune note fournie' });
    }
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      const checks = await Promise.all(grades.map((grade) => teacherCanGrade(teacher?._id, grade)));
      if (checks.some((allowed) => !allowed)) {
        return res.status(403).json({ success: false, message: 'Saisie limitee a vos matieres et aux etudiants concernes' });
      }
    }

    const inserted = await Grade.insertMany(
      grades.map((grade) => ({ ...grade, gradedBy: req.user?._id })),
      { ordered: false }
    );

    res.status(201).json({
      success: true,
      message: `${inserted.length} note(s) creee(s)`,
      data: inserted,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGrade = async (req, res, next) => {
  try {
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      const existing = await Grade.findById(req.params.id).populate('course', 'teacher').lean();
      if (!existing || existing.course?.teacher?.toString() !== teacher?._id?.toString()) {
        return res.status(403).json({ success: false, message: 'Modification limitee a vos matieres' });
      }

      const nextPayload = {
        student: req.body.student || existing.student,
        course: req.body.course || existing.course?._id || existing.course,
        ue: req.body.ue || existing.ue,
      };
      const allowed = await teacherCanGrade(teacher?._id, nextPayload);
      if (!allowed) {
        return res.status(403).json({ success: false, message: 'Modification limitee aux etudiants concernes' });
      }
    }

    const grade = await populateGrade(
      Grade.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
    );

    if (!grade) {
      return res.status(404).json({ success: false, message: 'Note non trouvee' });
    }

    res.json({
      success: true,
      message: 'Note mise a jour avec succes',
      data: grade,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, message: 'Note non trouvee' });
    }

    res.json({ success: true, message: 'Note supprimee avec succes' });
  } catch (error) {
    next(error);
  }
};

export const validateGradeUE = async (req, res, next) => {
  try {
    const ue = await UE.findById(req.params.ueId).populate('courses', 'name code coefficient');
    if (!ue) {
      return res.status(404).json({ success: false, message: 'UE non trouvee' });
    }
    if (req.user?.role === 'student') {
      const student = await Student.findById(req.params.studentId).lean();
      if (!student || student.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Acces limite a vos propres validations' });
      }
    }

    const grades = await Grade.find({ student: req.params.studentId, ue: ue._id }).lean();
    res.json({
      success: true,
      data: {
        ue: { id: ue._id, name: ue.name, code: ue.code },
        studentId: req.params.studentId,
        ...validateUE(grades, ue),
      },
    });
  } catch (error) {
    next(error);
  }
};
