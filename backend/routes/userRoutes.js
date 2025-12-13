const express = require('express');
const router = express.Router();
const { getAllUsers, getUserProfile, getLeaderboard, updateUserProfile } = require('../userController.js');
const { protect } = require('../middleware/auth');



// Import other controller functions like protect, admin, registerUser, loginUser etc.

// Get all users
router.get('/', protect, getAllUsers);

// Get leaderboard
router.get('/leaderboard', protect, getLeaderboard);

// Update user profile
router.put('/:id', protect, updateUserProfile);

// Public route for getting a user's profile
router.get('/:id', getUserProfile);

// Other routes like POST for registration, login, etc. would be here.

module.exports = router;