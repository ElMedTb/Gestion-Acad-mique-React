import express from 'express';
import {
  createTeacher,
  deleteTeacher,
  getTeacher,
  getTeacherCourses,
  getMyTeacherCourses,
  getMyTeacherProfile,
  getMyTeacherStudents,
  getMyTeacherUEs,
  getTeachers,
  getTeacherUEs,
  updateTeacher,
} from '../controllers/teacherController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'scolarite'), getTeachers);
router.post('/', authorize('admin', 'scolarite'), createTeacher);
router.get('/me/profile', authorize('teacher'), getMyTeacherProfile);
router.get('/me/courses', authorize('teacher'), getMyTeacherCourses);
router.get('/me/ues', authorize('teacher'), getMyTeacherUEs);
router.get('/me/students', authorize('teacher'), getMyTeacherStudents);
router.get('/:id', getTeacher);
router.put('/:id', authorize('admin', 'scolarite'), updateTeacher);
router.delete('/:id', authorize('admin'), deleteTeacher);
router.get('/:id/courses', getTeacherCourses);
router.get('/:id/ues', getTeacherUEs);

export default router;
