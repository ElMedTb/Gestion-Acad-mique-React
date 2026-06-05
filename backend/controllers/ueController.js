import UE from '../models/UE.js';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import { validateUE } from '../utils/academicValidation.js';
export const getUEs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.diploma) filter.diploma = req.query.diploma;
    if (req.query.semester) filter.semester = parseInt(req.query.semester, 10);
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      const courses = await Course.find({ teacher: teacher?._id }).select('_id').lean();
      filter.$or = [
        { referentTeacher: teacher?._id },
        { courses: { $in: courses.map((course) => course._id) } },
      ];
    }
    if (req.user?.role === 'student') {
      const student = await Student.findOne({ user: req.user._id }).lean();
      filter.diploma = { $in: [student?.diploma, ...(student?.doubleDiplomation || [])].filter(Boolean) };
    }

    const [ues, total] = await Promise.all([
      UE.find(filter)
        .populate('courses', 'name code coefficient credits')
        .populate('referentTeacher', 'teacherId speciality')
        .populate('diploma', 'name code')
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UE.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: ues.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: ues,
    });
  } catch (error) {
    next(error);
  }
};
export const getUE = async (req, res, next) => {
  try {
    const ue = await UE.findById(req.params.id)
      .populate('courses', 'name code coefficient credits description teacher')
      .populate({
        path: 'referentTeacher',
        populate: { path: 'user', select: 'firstName lastName email' },
      })
      .populate('diploma', 'name code');

    if (!ue) {
      return res.status(404).json({ success: false, message: 'UE non trouvée' });
    }
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      const courseIds = (ue.courses || []).map((course) => course._id?.toString() || course.toString());
      const taughtCourse = await Course.findOne({
        _id: { $in: courseIds },
        teacher: teacher?._id,
      }).lean();

      if (ue.referentTeacher?._id?.toString() !== teacher?._id?.toString() && !taughtCourse) {
        return res.status(403).json({ success: false, message: 'Acces limite a vos UE et matieres' });
      }
    }

    if (req.user?.role === 'student') {
      const student = await Student.findOne({ user: req.user._id }).lean();
      const diplomaIds = [student?.diploma, ...(student?.doubleDiplomation || [])]
        .filter(Boolean)
        .map((id) => id.toString());
      if (!diplomaIds.includes(ue.diploma?._id?.toString())) {
        return res.status(403).json({ success: false, message: 'Acces limite aux UE de votre diplome' });
      }
    }

    res.json({ success: true, data: ue });
  } catch (error) {
    next(error);
  }
};
export const createUE = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      payload.referentTeacher = teacher?._id;
    }

    const ue = await UE.create(payload);

    const populated = await UE.findById(ue._id)
      .populate('courses', 'name code')
      .populate('referentTeacher', 'teacherId')
      .populate('diploma', 'name code');

    res.status(201).json({
      success: true,
      message: 'UE créée avec succès',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
export const updateUE = async (req, res, next) => {
  try {
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      const existing = await UE.findOne({ _id: req.params.id, referentTeacher: teacher?._id });
      if (!existing) {
        return res.status(403).json({ success: false, message: 'Acces limite aux UE referencees' });
      }
    }

    const ue = await UE.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('courses', 'name code')
      .populate('referentTeacher', 'teacherId')
      .populate('diploma', 'name code');

    if (!ue) {
      return res.status(404).json({ success: false, message: 'UE non trouvée' });
    }

    res.json({ success: true, message: 'UE mise à jour avec succès', data: ue });
  } catch (error) {
    next(error);
  }
};
export const deleteUE = async (req, res, next) => {
  try {
    const ue = await UE.findByIdAndDelete(req.params.id);

    if (!ue) {
      return res.status(404).json({ success: false, message: 'UE non trouvée' });
    }

    res.json({ success: true, message: 'UE supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};
export const addCourseToUE = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const ue = await UE.findById(req.params.id);
    if (!ue) {
      return res.status(404).json({ success: false, message: 'UE non trouvée' });
    }

    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      if (ue.referentTeacher?.toString() !== teacher?._id?.toString()) {
        return res.status(403).json({ success: false, message: 'Acces limite aux UE referencees' });
      }
    }
    if (ue.courses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Cette matière est déjà dans cette UE',
      });
    }

    ue.courses.push(courseId);
    await ue.save();

    const populated = await UE.findById(ue._id)
      .populate('courses', 'name code')
      .populate('diploma', 'name code');

    res.json({
      success: true,
      message: 'Matière ajoutée à l\'UE avec succès',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
export const removeCourseFromUE = async (req, res, next) => {
  try {
    const ue = await UE.findById(req.params.id);
    if (!ue) {
      return res.status(404).json({ success: false, message: 'UE non trouvée' });
    }

    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      if (ue.referentTeacher?.toString() !== teacher?._id?.toString()) {
        return res.status(403).json({ success: false, message: 'Acces limite aux UE referencees' });
      }
    }

    ue.courses = ue.courses.filter(
      (c) => c.toString() !== req.params.courseId
    );
    await ue.save();

    const populated = await UE.findById(ue._id)
      .populate('courses', 'name code')
      .populate('diploma', 'name code');

    res.json({
      success: true,
      message: 'Matière retirée de l\'UE avec succès',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
export const validateUEForStudent = async (req, res, next) => {
  try {
    const ue = await UE.findById(req.params.id)
      .populate('courses', 'name code coefficient');

    if (!ue) {
      return res.status(404).json({ success: false, message: 'UE non trouvée' });
    }

    if (req.user?.role === 'student') {
      const student = await Student.findById(req.params.studentId).lean();
      if (!student || student.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Acces limite a vos propres validations' });
      }
    }
    const grades = await Grade.find({
      student: req.params.studentId,
      ue: ue._id,
    }).lean();

    const result = validateUE(grades, ue);

    res.json({
      success: true,
      data: {
        ue: { id: ue._id, name: ue.name, code: ue.code },
        studentId: req.params.studentId,
        ...result,
      },
    });
  } catch (error) {
    next(error);
  }
};
