import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getStudentPerformance,
  updateProfile,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.put('/profile', protect, updateProfile);
router.get('/student/:id/performance', protect, getStudentPerformance);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.patch('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

export default router;
