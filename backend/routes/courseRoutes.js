import express from 'express';
import {
  createCourse,
  deleteCourse,
  getCourse,
  getCourses,
  updateCourse,
} from '../controllers/courseController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'scolarite', 'teacher'), getCourses);
router.post('/', authorize('admin', 'teacher'), createCourse);
router.get('/:id', getCourse);
router.put('/:id', authorize('admin', 'teacher'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);

export default router;
