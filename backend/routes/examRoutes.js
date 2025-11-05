import express from 'express';
import {
  createExam,
  getExams,
  getExam,
  updateExam,
  deleteExam,
  getUpcomingExams,
  togglePublishExam,
} from '../controllers/examController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getExams)
  .post(protect, authorize('faculty', 'admin'), createExam);

router.get('/upcoming', protect, authorize('student'), getUpcomingExams);

router.route('/:id')
  .get(protect, getExam)
  .put(protect, authorize('faculty', 'admin'), updateExam)
  .delete(protect, authorize('faculty', 'admin'), deleteExam);

router.patch('/:id/publish', protect, authorize('faculty', 'admin'), togglePublishExam);

export default router;
