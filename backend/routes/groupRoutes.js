import express from 'express';
import {
  createGroup,
  getGroups,
  updateGroup,
  addGroupMember,
  removeGroupMember,
  togglePinGroup
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
const router = express.Router();
router.post('/', protect, upload.single('avatar'), createGroup);
router.get('/', protect, getGroups);
router.put('/:id', protect, upload.single('avatar'), updateGroup);
router.put('/:id/add', protect, addGroupMember);
router.put('/:id/remove', protect, removeGroupMember);
router.put('/:id/pin', protect, togglePinGroup);
export default router;