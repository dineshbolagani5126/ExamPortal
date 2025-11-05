import express from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  getSubjects,
  getTopicsBySubject,
} from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('faculty', 'admin'), getQuestions)
  .post(protect, authorize('faculty', 'admin'), createQuestion);

router.post('/bulk', protect, authorize('faculty', 'admin'), bulkCreateQuestions);
router.get('/subjects', protect, authorize('faculty', 'admin'), getSubjects);
router.get('/topics/:subject', protect, authorize('faculty', 'admin'), getTopicsBySubject);

router.route('/:id')
  .get(protect, authorize('faculty', 'admin'), getQuestion)
  .put(protect, authorize('faculty', 'admin'), updateQuestion)
  .delete(protect, authorize('faculty', 'admin'), deleteQuestion);

export default router;
