import express from 'express';
import {
  createEnquiry,
  getReceivedEnquiries,
  getMyEnquiries,
  updateEnquiryStatus,
} from '../controllers/enquiryController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createEnquiry);
router.get('/received', protect, getReceivedEnquiries);
router.get('/my', protect, getMyEnquiries);
router.patch('/:id/status', protect, updateEnquiryStatus);

export default router;
