import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

const formatId = (prefix, seq) => {
  const year = new Date().getFullYear();
  const padded = String(seq).padStart(3, '0');
  return `${prefix}-${year}-${padded}`;
};

const getNextSequence = async (Model, idField, prefix) => {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);

  const last = await Model.findOne({ [idField]: pattern })
    .sort({ [idField]: -1 })
    .lean();

  if (!last) return 1;

  const match = last[idField].match(pattern);
  return match ? parseInt(match[1], 10) + 1 : 1;
};

export const generateStudentId = async () => {
  const seq = await getNextSequence(Student, 'studentId', 'STU');
  return formatId('STU', seq);
};

export const generateTeacherId = async () => {
  const seq = await getNextSequence(Teacher, 'teacherId', 'TCH');
  return formatId('TCH', seq);
};
