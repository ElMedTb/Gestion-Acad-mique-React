import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
export const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      filter.teacher = teacher?._id;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('teacher', 'teacherId speciality')
        .populate('prerequisites', 'name code')
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: courses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};
export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'teacherId speciality')
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'firstName lastName email' },
      })
      .populate('prerequisites', 'name code');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Matière non trouvée' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};
export const createCourse = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      payload.teacher = teacher?._id;
    }

    const course = await Course.create(payload);

    const populated = await Course.findById(course._id)
      .populate('teacher', 'teacherId speciality')
      .populate('prerequisites', 'name code');

    res.status(201).json({
      success: true,
      message: 'Matière créée avec succès',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCourse = async (req, res, next) => {
  try {
    if (req.user?.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id }).lean();
      const existing = await Course.findOne({ _id: req.params.id, teacher: teacher?._id });
      if (!existing) {
        return res.status(403).json({ success: false, message: 'Acces limite aux matieres enseignees' });
      }
    }

    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('teacher', 'teacherId speciality')
      .populate('prerequisites', 'name code');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Matière non trouvée' });
    }

    res.json({
      success: true,
      message: 'Matière mise à jour avec succès',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Matière non trouvée' });
    }

    res.json({
      success: true,
      message: 'Matière supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};
