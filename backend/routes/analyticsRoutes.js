import express from 'express';
import {
  getDashboardStats,
  getExamAnalytics,
  getClassAnalytics,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/exam/:examId', protect, authorize('faculty', 'admin'), getExamAnalytics);
router.get('/class', protect, authorize('faculty', 'admin'), getClassAnalytics);

export default router;
