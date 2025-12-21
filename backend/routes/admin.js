import express from 'express';
import Paper from '../models/paper.js';
import User from '../models/user.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get papers for approval
router.get('/papers/pending', [protect, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const papers = await Paper.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploader', 'username university department');

    const total = await Paper.countDocuments({ status: 'pending' });

    res.json({
      papers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get pending papers error:', error);
    res.status(500).json({ message: 'Server error fetching pending papers' });
  }
});

// Approve/reject paper
router.patch('/papers/:id/status', [protect, admin], async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    paper.status = status;
    paper.approvedAt = new Date();
    paper.approvedBy = req.user._id;

    // Clear reports after action
    if (status === 'approved' || status === 'rejected') {
      paper.reports = [];
    }

    await paper.save();

    res.json({ 
      message: `Paper ${status} successfully`,
      paper 
    });
  } catch (error) {
    console.error('Update paper status error:', error);
    res.status(500).json({ message: 'Server error updating paper status' });
  }
});

// Get reported papers
router.get('/papers/reported', [protect, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const papers = await Paper.find({ 
      'reports.0': { $exists: true } // Papers with at least one report
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploader', 'username university department')
      .populate('reports.user', 'username');

    const total = await Paper.countDocuments({ 
      'reports.0': { $exists: true } 
    });

    res.json({
      papers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reported papers error:', error);
    res.status(500).json({ message: 'Server error fetching reported papers' });
  }
});

// Get dashboard stats
router.get('/stats', [protect, admin], async (req, res) => {
  try {
    const totalPapers = await Paper.countDocuments();
    const pendingPapers = await Paper.countDocuments({ status: 'pending' });
    const approvedPapers = await Paper.countDocuments({ status: 'approved' });
    const totalUsers = await User.countDocuments();
    const totalDownloads = await Paper.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);

    res.json({
      totalPapers,
      pendingPapers,
      approvedPapers,
      totalUsers,
      totalDownloads: totalDownloads[0]?.total || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// Get all users
router.get('/users', [protect, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Update user role
router.patch('/users/:id/role', [protect, admin], async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});




// Get all papers
router.get('/papers/all', [protect, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const papers = await Paper.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploader', 'username university department');

    const total = await Paper.countDocuments();

    res.json({
      papers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all papers error:', error);
    res.status(500).json({ message: 'Server error fetching all papers' });
  }
});

export default router;