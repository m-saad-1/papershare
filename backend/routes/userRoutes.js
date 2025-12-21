import express from 'express';
const router = express.Router();
import {
  getAllUsers,
  getUserProfile,
  getLeaderboard,
  updateUserProfile,
} from '../userController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.route('/').get(protect, getAllUsers);
router
  .route('/:id')
  .get(getUserProfile)
  .put(protect, upload.single('profilePicture'), updateUserProfile);
router.route('/leaderboard').get(getLeaderboard);

export default router;
