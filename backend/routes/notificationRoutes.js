import express from 'express';
import {
  getNotifications,
  markNotificationsRead,
  clearNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markNotificationsRead);
router.delete('/', protect, clearNotifications);
export default router;
