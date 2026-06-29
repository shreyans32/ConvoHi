import express from 'express';
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  reactMessage,
  togglePinMessage
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
const router = express.Router();
router.post('/', protect, upload.single('file'), sendMessage);
router.get('/:chatType/:chatId', protect, getMessages);
router.put('/:id', protect, editMessage);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/react', protect, reactMessage);
router.put('/:id/pin', protect, togglePinMessage);
export default router;
