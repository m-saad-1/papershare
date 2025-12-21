import asyncHandler from 'express-async-handler';
import User from './models/user.js';
import path from 'path';
import fs from 'fs';

// Other user controller functions like registerUser, loginUser, etc. would be here.

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

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
      username: user.username,
      email: user.email,
      university: user.university,
      department: user.department,
      semester: user.semester,
      batch: user.batch,
      role: user.role,
      bio: user.bio,
      profilePicture: user.profilePicture,
      uploadCount: user.uploadCount,
      createdAt: user.createdAt,
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
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({})
      .sort({ uploadCount: -1 })
      .select('-password -__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments();

    // Add rank to each user
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: (page - 1) * limit + index + 1,
    }));

    res.json({
      users: usersWithRank,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Get leaderboard error details:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard', error: error.message });
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this user profile');
    }

    user.username = req.body.username || user.username;
    user.university = req.body.university || user.university;
    user.department = req.body.department || user.department;
    user.semester = req.body.semester || user.semester;
    user.batch = req.body.batch || user.batch;
    user.bio = req.body.bio || user.bio;

    if (req.file) {
      // If there's an old picture, delete it
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, '..', 'uploads', path.basename(user.profilePicture));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      user.profilePicture = path.join('uploads', req.file.filename);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      university: updatedUser.university,
      department: updatedUser.department,
      semester: updatedUser.semester,
      batch: updatedUser.batch,
      role: updatedUser.role,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      uploadCount: updatedUser.uploadCount,
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getAllUsers, getUserProfile, getLeaderboard, updateUserProfile };
