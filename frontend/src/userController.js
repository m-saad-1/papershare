import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

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

export {
  // other exported functions
  getUserProfile,
};