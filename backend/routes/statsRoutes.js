import express from 'express';
import {
  getAdminStats,
  getGlobalStats,
  getScolariteStats,
  getStudentStats,
} from '../controllers/statsController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/global', authorize('admin'), getGlobalStats);
router.get('/admin', authorize('admin'), getAdminStats);
router.get('/scolarite', authorize('admin', 'scolarite'), getScolariteStats);
router.get('/student/:studentId', authorize('admin', 'scolarite', 'student'), getStudentStats);

export default router;
