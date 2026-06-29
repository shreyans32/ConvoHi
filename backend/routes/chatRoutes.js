import express from 'express';
import { accessChat, getChats, togglePinChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/', protect, accessChat);
router.get('/', protect, getChats);
router.put('/:id/pin', protect, togglePinChat);
export default router;