import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
console.log('Defining POST /register');
router.post('/register', async (req, res) => {
      const { username, email, password, university, department, semester, batch } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, email, password, university, department, semester, batch });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });

    // Send successful response
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, university: user.university, department: user.department } });

  } catch (err) {
    console.error('Error during user registration:', err); // Log full error object
    return res.status(500).send('Server error');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
console.log('Defining POST /login');
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, university: user.university, department: user.department, profilePicture: user.profilePicture } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @desc    Get logged in user
// @route   GET /api/auth/me
// @access  Private
console.log('Defining GET /me');
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
console.log('Defining POST /change-password');
router.post('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // Mongoose pre-save hook will hash the new password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



export default router;