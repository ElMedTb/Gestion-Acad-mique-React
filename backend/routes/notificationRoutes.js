import express from 'express';
import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from '../controllers/notificationController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'scolarite', 'student', 'teacher'), getNotifications);
router.post('/', authorize('admin', 'scolarite'), createNotification);
router.put('/:id', authorize('admin', 'scolarite'), updateNotification);
router.delete('/:id', authorize('admin', 'scolarite'), deleteNotification);

export default router;
