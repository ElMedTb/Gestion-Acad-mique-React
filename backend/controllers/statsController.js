import Course from '../models/Course.js';
import Diploma from '../models/Diploma.js';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import UE from '../models/UE.js';
import { validateUE } from '../utils/academicValidation.js';

const avg = (values) => {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length) * 100) / 100;
};

export const getGlobalStats = async (_req, res, next) => {
  try {
    const [students, courses, ues, diplomas, teachers, grades] = await Promise.all([
      Student.countDocuments(),
      Course.countDocuments(),
      UE.countDocuments(),
      Diploma.countDocuments(),
      Teacher.countDocuments(),
      Grade.find().select('value session semester academicYear').lean(),
    ]);

    res.json({
      success: true,
      data: {
        counts: { students, courses, ues, diplomas, teachers, grades: grades.length },
        averageGrade: avg(grades.map((grade) => grade.value)),
        eliminatoryGrades: grades.filter((grade) => grade.value < 6).length,
        bySession: {
          normal: grades.filter((grade) => grade.session === 'normal').length,
          rattrapage: grades.filter((grade) => grade.session === 'rattrapage').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = getGlobalStats;

export const getScolariteStats = async (_req, res, next) => {
  try {
    const [students, courses, grades] = await Promise.all([
      Student.find().populate('diploma', 'name code').lean(),
      Course.countDocuments(),
      Grade.find().select('value student semester academicYear').lean(),
    ]);

    const diplomaCounts = students.reduce((acc, student) => {
      const name = student.diploma?.code || 'Sans diplome';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        students: students.length,
        courses,
        grades: grades.length,
        averageGrade: avg(grades.map((grade) => grade.value)),
        diplomaCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentStats = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('diploma', 'name code ues');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Etudiant non trouve' });
    }
    if (req.user?.role === 'student' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Acces limite a vos propres statistiques' });
    }

    const [grades, ues] = await Promise.all([
      Grade.find({ student: student._id }).populate('course', 'name code coefficient').lean(),
      UE.find({ _id: { $in: student.diploma?.ues || [] } }).populate('courses', 'name code coefficient').lean(),
    ]);

    const ueResults = ues.map((ue) => {
      const ueGrades = grades.filter((grade) => grade.ue?.toString() === ue._id.toString());
      return {
        ue: { id: ue._id, name: ue.name, code: ue.code },
        ...validateUE(ueGrades, ue),
      };
    });

    res.json({
      success: true,
      data: {
        student: { id: student._id, studentId: student.studentId, diploma: student.diploma },
        overallAverage: avg(grades.map((grade) => grade.value)),
        totalGrades: grades.length,
        ueValidation: {
          validated: ueResults.filter((ue) => ue.validated).length,
          total: ueResults.length,
          details: ueResults,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
