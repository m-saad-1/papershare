const express = require('express');
const router = express.Router();
const { getUserProfile, getLeaderboard } = require('../userController.js');
const { protect } = require('../middleware/auth'); 
// Import other controller functions like protect, admin, registerUser, loginUser etc.

// Get leaderboard
router.get('/leaderboard', protect, getLeaderboard);

// Public route for getting a user's profile
router.get('/:id', getUserProfile);

// Other routes like POST for registration, login, etc. would be here.

module.exports = router;