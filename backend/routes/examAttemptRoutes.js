import express from 'express';
import {
  startExamAttempt,
  saveAnswer,
  submitExam,
  getMyAttempt,
  getExamAttempts,
  evaluateAttempt,
  getMyAttempts,
} from '../controllers/examAttemptController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/start/:examId', protect, authorize('student'), startExamAttempt);
router.get('/my-attempts', protect, authorize('student'), getMyAttempts);
router.get('/my/:examId', protect, authorize('student'), getMyAttempt);
router.put('/:attemptId/answer', protect, authorize('student'), saveAnswer);
router.post('/:attemptId/submit', protect, authorize('student'), submitExam);

router.get('/exam/:examId', protect, authorize('faculty', 'admin'), getExamAttempts);
router.put('/:attemptId/evaluate', protect, authorize('faculty', 'admin'), evaluateAttempt);

export default router;
