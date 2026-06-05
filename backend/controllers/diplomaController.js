import Diploma from '../models/Diploma.js';
import Student from '../models/Student.js';
import UE from '../models/UE.js';
import Grade from '../models/Grade.js';
import { validateUE, validateDiploma } from '../utils/academicValidation.js';
export const getDiplomas = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.role === 'student') {
      const student = await Student.findOne({ user: req.user._id }).lean();
      filter._id = student?.diploma;
    }

    const diplomas = await Diploma.find(filter)
      .populate('ues', 'name code semester')
      .sort({ code: 1 })
      .lean();

    res.json({
      success: true,
      count: diplomas.length,
      data: diplomas,
    });
  } catch (error) {
    next(error);
  }
};
export const getDiploma = async (req, res, next) => {
  try {
    const diploma = await Diploma.findById(req.params.id).populate({
      path: 'ues',
      populate: [
        { path: 'courses', select: 'name code coefficient credits' },
        {
          path: 'referentTeacher',
          select: 'teacherId speciality',
          populate: { path: 'user', select: 'firstName lastName' },
        },
      ],
    });

    if (!diploma) {
      return res.status(404).json({ success: false, message: 'Diplôme non trouvé' });
    }

    if (req.user?.role === 'student') {
      const student = await Student.findOne({ user: req.user._id }).lean();
      if (diploma._id.toString() !== student?.diploma?.toString()) {
        return res.status(403).json({ success: false, message: 'Acces limite a votre diplome' });
      }
    }

    res.json({ success: true, data: diploma });
  } catch (error) {
    next(error);
  }
};
export const createDiploma = async (req, res, next) => {
  try {
    const diploma = await Diploma.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Diplôme créé avec succès',
      data: diploma,
    });
  } catch (error) {
    next(error);
  }
};
export const updateDiploma = async (req, res, next) => {
  try {
    const diploma = await Diploma.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('ues', 'name code');

    if (!diploma) {
      return res.status(404).json({ success: false, message: 'Diplôme non trouvé' });
    }

    res.json({
      success: true,
      message: 'Diplôme mis à jour avec succès',
      data: diploma,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteDiploma = async (req, res, next) => {
  try {
    const diploma = await Diploma.findByIdAndDelete(req.params.id);

    if (!diploma) {
      return res.status(404).json({ success: false, message: 'Diplôme non trouvé' });
    }

    res.json({ success: true, message: 'Diplôme supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
export const enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const diploma = await Diploma.findById(req.params.id);
    if (!diploma) {
      return res.status(404).json({ success: false, message: 'Diplôme non trouvé' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
    }

    student.diploma = diploma._id;
    await student.save();

    res.json({
      success: true,
      message: `Étudiant ${student.studentId} inscrit au diplôme ${diploma.name}`,
      data: { student: student.studentId, diploma: diploma.name },
    });
  } catch (error) {
    next(error);
  }
};
export const checkDiplomaValidation = async (req, res, next) => {
  try {
    const diploma = await Diploma.findById(req.params.id);
    if (!diploma) {
      return res.status(404).json({ success: false, message: 'Diplôme non trouvé' });
    }

    if (req.user?.role === 'student') {
      const student = await Student.findById(req.params.studentId).lean();
      if (!student || student.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Acces limite a vos propres validations' });
      }
    }
    const ues = await UE.find({ _id: { $in: diploma.ues } })
      .populate('courses', 'name code coefficient')
      .lean();
    const grades = await Grade.find({ student: req.params.studentId }).lean();
    const ueResults = ues.map((ue) => {
      const ueGrades = grades.filter(
        (g) => g.ue && g.ue.toString() === ue._id.toString()
      );
      const result = validateUE(ueGrades, ue);
      return {
        ue: { id: ue._id, name: ue.name, code: ue.code, semester: ue.semester },
        ...result,
      };
    });

    const diplomaResult = validateDiploma(ueResults);

    res.json({
      success: true,
      data: {
        diploma: { id: diploma._id, name: diploma.name, code: diploma.code },
        studentId: req.params.studentId,
        ...diplomaResult,
      },
    });
  } catch (error) {
    next(error);
  }
};
