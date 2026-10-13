import express from 'express';
import {
  createReport,
  getReports,
  updateReportStatus,
} from '../controllers/reportController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createReport);
router.get('/admin', protect, authorize('admin'), getReports);
router.patch('/admin/:id', protect, authorize('admin'), updateReportStatus);

export default router;
