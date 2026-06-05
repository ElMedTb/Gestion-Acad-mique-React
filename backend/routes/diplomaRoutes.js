import express from 'express';
import {
  checkDiplomaValidation,
  createDiploma,
  deleteDiploma,
  enrollStudent,
  getDiploma,
  getDiplomas,
  updateDiploma,
} from '../controllers/diplomaController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'scolarite', 'teacher', 'student'), getDiplomas);
router.post('/', authorize('admin'), createDiploma);
router.get('/:id', getDiploma);
router.put('/:id', authorize('admin'), updateDiploma);
router.delete('/:id', authorize('admin'), deleteDiploma);
router.post('/:id/enroll', authorize('admin', 'scolarite'), enrollStudent);
router.get('/:id/validate/:studentId', checkDiplomaValidation);

export default router;
