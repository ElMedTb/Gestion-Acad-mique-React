import express from 'express';
import {
  addCourseToUE,
  createUE,
  deleteUE,
  getUE,
  getUEs,
  removeCourseFromUE,
  updateUE,
  validateUEForStudent,
} from '../controllers/ueController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'scolarite', 'teacher', 'student'), getUEs);
router.post('/', authorize('admin', 'teacher'), createUE);
router.get('/:id', getUE);
router.put('/:id', authorize('admin', 'teacher'), updateUE);
router.delete('/:id', authorize('admin'), deleteUE);
router.post('/:id/courses', authorize('admin', 'teacher'), addCourseToUE);
router.delete('/:id/courses/:courseId', authorize('admin', 'teacher'), removeCourseFromUE);
router.get('/:id/validate/:studentId', validateUEForStudent);

export default router;
