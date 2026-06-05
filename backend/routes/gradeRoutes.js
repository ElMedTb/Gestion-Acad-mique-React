import express from 'express';
import {
  bulkCreateGrades,
  createGrade,
  deleteGrade,
  getGrade,
  getGrades,
  updateGrade,
  validateGradeUE,
} from '../controllers/gradeController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'scolarite', 'student', 'teacher'), getGrades);
router.post('/', authorize('admin', 'scolarite', 'teacher'), createGrade);
router.post('/bulk', authorize('admin', 'scolarite', 'teacher'), bulkCreateGrades);
router.get('/validate/:ueId/:studentId', validateGradeUE);
router.get('/:id', getGrade);
router.put('/:id', authorize('admin', 'scolarite', 'teacher'), updateGrade);
router.delete('/:id', authorize('admin'), deleteGrade);

export default router;
