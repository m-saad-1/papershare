const asyncHandler = require('express-async-handler');
const User = require('../models/user');

/**
 * @desc    Get user public profile by ID
 * @route   GET /api/users/:userId
 * @access  Public
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password -email'); // Exclude sensitive info

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Make sure to export the new function
module.exports = {
  getUserById,
};