import express from 'express';
import Paper from '../models/paper.js';
import Note from '../models/Note.js';
import Report from '../models/Report.js';
import User from '../models/user.js';
import { protect, admin } from '../middleware/auth.js';
import { awardApprovalRewards } from '../services/contentApprovalService.js';

const router = express.Router();

// Get papers for approval
router.get('/papers/pending', [protect, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const papers = await Paper.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploader', 'username university department')
      .populate({
        path: 'linkedRequest.request',
        select: 'title description university department courseName examType year status requester createdAt',
        populate: {
          path: 'requester',
          select: 'username university department',
        },
      });

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

router.get('/notes/pending', [protect, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const notes = await Note.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploader', 'username university department');

    const total = await Note.countDocuments({ status: 'pending' });

    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get pending notes error:', error);
    res.status(500).json({ message: 'Server error fetching pending notes' });
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

    const previousStatus = paper.status;
    paper.status = status;
    paper.approvedAt = status === 'approved' ? new Date() : undefined;
    paper.approvedBy = status === 'approved' ? req.user._id : undefined;

    // Clear reports after action
    if (status === 'approved' || status === 'rejected') {
      paper.reports = [];
    }

    await paper.save();

    if (previousStatus !== 'approved' && status === 'approved') {
      await awardApprovalRewards({ content: paper, contentType: 'paper' });
    }

    res.json({ 
      message: `Paper ${status} successfully`,
      paper 
    });
  } catch (error) {
    console.error('Update paper status error:', error);
    res.status(500).json({ message: 'Server error updating paper status' });
  }
});

router.patch('/notes/:id/status', [protect, admin], async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const previousStatus = note.status;
    note.status = status;
    note.approvedAt = status === 'approved' ? new Date() : note.approvedAt;
    note.approvedBy = status === 'approved' ? req.user._id : note.approvedBy;
    await note.save();

    if (previousStatus !== 'approved' && status === 'approved') {
      await awardApprovalRewards({ content: note, contentType: 'note' });
    }

    res.json({
      message: `Note ${status} successfully`,
      note,
    });
  } catch (error) {
    console.error('Update note status error:', error);
    res.status(500).json({ message: 'Server error updating note status' });
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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalPapers,
      totalNotes,
      pendingPapers,
      pendingNotes,
      approvedPapers,
      approvedNotes,
      totalUsers,
      totalReports,
      paperDownloads,
      noteDownloads,
      newPapersToday,
      newNotesToday,
      approvedPapersToday,
      approvedNotesToday,
      newUsersToday,
    ] = await Promise.all([
      Paper.countDocuments(),
      Note.countDocuments(),
      Paper.countDocuments({ status: 'pending' }),
      Note.countDocuments({ status: 'pending' }),
      Paper.countDocuments({ status: 'approved' }),
      Note.countDocuments({ status: 'approved' }),
      User.countDocuments(),
      Report.countDocuments(),
      Paper.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
      Note.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
      Paper.countDocuments({ createdAt: { $gte: startOfToday } }),
      Note.countDocuments({ createdAt: { $gte: startOfToday } }),
      Paper.countDocuments({ status: 'approved', approvedAt: { $gte: startOfToday } }),
      Note.countDocuments({ status: 'approved', approvedAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    res.json({
      totalPapers,
      totalNotes,
      pendingPapers,
      pendingNotes,
      pendingApprovals: pendingPapers + pendingNotes,
      approvedPapers,
      approvedNotes,
      approvedContent: approvedPapers + approvedNotes,
      totalUsers,
      totalReports,
      totalDownloads: (paperDownloads[0]?.total || 0) + (noteDownloads[0]?.total || 0),
      newPapersToday,
      newNotesToday,
      approvedPapersToday,
      approvedNotesToday,
      newUsersToday,
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
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const papers = await Paper.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploader', 'username university department')
      .populate({
        path: 'linkedRequest.request',
        select: 'title description university department courseName examType year status requester createdAt',
        populate: {
          path: 'requester',
          select: 'username university department',
        },
      });

    const total = await Paper.countDocuments(filter);

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

router.get('/notes/all', [protect, admin], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploader', 'username university department');

    const total = await Note.countDocuments(filter);

    res.json({
      notes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({ message: 'Server error fetching all notes' });
  }
});

// @desc    Assign Campus Ambassador role
// @route   PATCH /api/admin/users/:id/ambassador
// @access  Private/Admin
router.patch('/users/:id/ambassador', [protect, admin], async (req, res) => {
  try {
    const { isCampusAmbassador, ambassadorUniversity } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isCampusAmbassador && !ambassadorUniversity) {
      return res.status(400).json({ message: 'Ambassador university is required' });
    }

    user.isCampusAmbassador = isCampusAmbassador;
    user.ambassadorUniversity = isCampusAmbassador ? ambassadorUniversity : '';
    
    if (isCampusAmbassador) {
      user.ambassadorAssignedAt = new Date();
      // Also update contributor status to Campus Ambassador
      user.contributorStatus = 'Campus Ambassador';
    } else {
      user.ambassadorAssignedAt = null;
      // Optionally downgrade status based on other criteria
    }

    await user.save();

    res.json({
      message: isCampusAmbassador ? 'Campus Ambassador assigned successfully' : 'Ambassador role revoked',
      user: {
        id: user._id,
        username: user.username,
        isCampusAmbassador: user.isCampusAmbassador,
        ambassadorUniversity: user.ambassadorUniversity,
        contributorStatus: user.contributorStatus,
      },
    });
  } catch (error) {
    console.error('Update ambassador status error:', error);
    res.status(500).json({ message: 'Server error updating ambassador status' });
  }
});

// @desc    Get all campus ambassadors
// @route   GET /api/admin/ambassadors
// @access  Private/Admin
router.get('/ambassadors', [protect, admin], async (req, res) => {
  try {
    const ambassadors = await User.find({ isCampusAmbassador: true })
      .select('-password')
      .sort({ ambassadorAssignedAt: -1 });

    res.json({ ambassadors });
  } catch (error) {
    console.error('Get ambassadors error:', error);
    res.status(500).json({ message: 'Server error fetching ambassadors' });
  }
});

export default router;