const asyncHandler = require('express-async-handler');
const User = require('./models/user.js');

// Other user controller functions like registerUser, loginUser, etc. would be here.

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Get leaderboard of users based on uploadCount
 * @route   GET /api/users/leaderboard
 * @access  Private (protected)
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  try { // Added try-catch block
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({})
      .sort({ uploadCount: -1 }) // Sort by uploadCount in descending order
      .select('-password -__v') // Exclude sensitive fields
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) { // Added catch block
    console.error('Get leaderboard error details:', error); // More specific logging
    res.status(500).json({ message: 'Server error fetching leaderboard', error: error.message }); // Send error message to client
  }
});

module.exports = { getUserProfile, getLeaderboard };