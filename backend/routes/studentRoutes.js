import express from 'express';
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudentGrades,
  getStudents,
  getStudentStats,
  updateStudent,
  uploadPhoto,
} from '../controllers/studentController.js';
import { authorize, protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'scolarite'), getStudents);
router.post('/', authorize('admin', 'scolarite'), createStudent);
router.get('/:id', getStudent);
router.put('/:id', authorize('admin', 'scolarite', 'student'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);
router.post('/:id/photo', authorize('admin', 'scolarite', 'student'), upload.single('photo'), uploadPhoto);
router.get('/:id/grades', getStudentGrades);
router.get('/:id/stats', getStudentStats);

export default router;
