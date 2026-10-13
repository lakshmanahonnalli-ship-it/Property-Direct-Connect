import express from 'express';
import {
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyListings,
  updateAvailability,
  getSimilarProperties,
} from '../controllers/propertyController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', optionalAuth, getPropertyById);
router.get('/:id/similar', getSimilarProperties);

router.post('/', protect, upload.array('images', 10), createProperty);
router.put('/:id', protect, upload.array('images', 10), updateProperty);
router.delete('/:id', protect, deleteProperty);
router.patch('/:id/availability', protect, updateAvailability);

export default router;
