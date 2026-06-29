import express from 'express';
const router = express.Router();
import {
  getAllUsers,
  getUserProfile,
  getPublicContributorProfile,
  getPublicPlatformStats,
  getContributorImpactMetrics,
  getUserNotifications,
  markNotificationsRead,
  getLeaderboard,
  getWeeklyTopContributors,
  updateUserProfile,
} from '../userController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import { cloudinaryStorage } from '../config/cloudinary.js';

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: cloudinaryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.route('/').get(protect, getAllUsers);
router.route('/stats/public').get(getPublicPlatformStats);
router.route('/leaderboard/weekly').get(getWeeklyTopContributors);
router.route('/leaderboard').get(getLeaderboard);
router.route('/:id/public').get(getPublicContributorProfile);
router.route('/:id/impact').get(protect, getContributorImpactMetrics);
router.route('/:id/notifications').get(protect, getUserNotifications);
router.route('/:id/notifications/read-all').patch(protect, markNotificationsRead);
router
  .route('/:id')
  .get(getUserProfile)
  .put(protect, upload.single('profilePicture'), updateUserProfile);

export default router;
