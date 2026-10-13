import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getPendingProperties,
  getAllPropertiesAdmin,
  approveProperty,
  rejectProperty,
  deletePropertyAdmin,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin-only middleware
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/properties/pending', getPendingProperties);
router.get('/properties', getAllPropertiesAdmin);
router.patch('/properties/:id/approve', approveProperty);
router.patch('/properties/:id/reject', rejectProperty);
router.delete('/properties/:id', deletePropertyAdmin);
router.get('/audit-logs', getAuditLogs);

export default router;
