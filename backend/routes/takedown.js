import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import FacultyTakedown from '../models/FacultyTakedown.js';
import Paper from '../models/paper.js';
import User from '../models/user.js';

const router = express.Router();

// @desc    Submit faculty takedown request
// @route   POST /api/takedown
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { paperId, facultyEmail, facultyName, reason, reasonDescription } = req.body;

    if (!paperId || !facultyEmail || !facultyName || !reason || !reasonDescription) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate reason
    const validReasons = ['copyright_violation', 'unauthorized_use', 'academic_honesty', 'licensing_violation', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: 'Invalid reason' });
    }

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Check if takedown request already exists for this paper
    const existingRequest = await FacultyTakedown.findOne({
      paper: paperId,
      status: { $in: ['pending', 'under_review'] },
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'A takedown request for this paper is already under review' 
      });
    }

    const takedownRequest = new FacultyTakedown({
      paper: paperId,
      requestedBy: req.user?._id, // Optional for public submissions
      facultyEmail,
      facultyName,
      reason,
      reasonDescription,
    });

    await takedownRequest.save();

    res.status(201).json({
      message: 'Takedown request submitted successfully and will be reviewed',
      request: takedownRequest,
    });
  } catch (error) {
    console.error('Submit takedown request error:', error);
    res.status(500).json({ message: 'Server error submitting takedown request' });
  }
});

// @desc    Get takedown requests (admin)
// @route   GET /api/takedown/admin/requests
// @access  Private/Admin
router.get('/admin/requests', [protect, admin], async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const requests = await FacultyTakedown.find({ status })
      .populate('paper', 'title course university uploader')
      .populate('requestedBy', 'username email')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get takedown requests error:', error);
    res.status(500).json({ message: 'Server error fetching takedown requests' });
  }
});

// @desc    Review takedown request (admin)
// @route   PATCH /api/takedown/:id/review
// @access  Private/Admin
router.patch('/:id/review', [protect, admin], async (req, res) => {
  try {
    const { status, adminNotes, action } = req.body;

    const takedownRequest = await FacultyTakedown.findById(req.params.id);
    if (!takedownRequest) {
      return res.status(404).json({ message: 'Takedown request not found' });
    }

    takedownRequest.status = status || takedownRequest.status;
    takedownRequest.adminNotes = adminNotes || takedownRequest.adminNotes;
    takedownRequest.reviewedBy = req.user._id;
    takedownRequest.reviewedAt = new Date();

    if (action === 'hide_temporarily') {
      takedownRequest.paperTemporarilyHidden = true;
      takedownRequest.hiddenUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      // Hide paper in database
      await Paper.findByIdAndUpdate(takedownRequest.paper, {
        $set: { visibility: 'private' },
      });
    } else if (action === 'approve_removal') {
      takedownRequest.status = 'approved';
      
      // Permanently remove paper
      await Paper.findByIdAndUpdate(takedownRequest.paper, {
        $set: { isActive: false, visibility: 'private' },
      });
    } else if (action === 'reject') {
      takedownRequest.status = 'rejected';
      
      // Make paper public again if it was hidden
      await Paper.findByIdAndUpdate(takedownRequest.paper, {
        $set: { visibility: 'public' },
      });
    }

    await takedownRequest.save();

    res.json({
      message: 'Takedown request reviewed',
      request: takedownRequest,
    });
  } catch (error) {
    console.error('Review takedown request error:', error);
    res.status(500).json({ message: 'Server error reviewing takedown request' });
  }
});

// @desc    Get public policy page content
// @route   GET /api/takedown/policy
// @access  Public
router.get('/policy', (req, res) => {
  res.json({
    title: 'Academic Integrity & Takedown Policy',
    content: `
      <h2>Platform Guidelines</h2>
      <p>Our platform is designed to facilitate peer learning through sharing of past examination materials and study resources. We maintain strict academic integrity standards.</p>
      
      <h3>What's Allowed</h3>
      <ul>
        <li>Past examination papers and midterms</li>
        <li>Study guides and notes</li>
        <li>Sample questions and practice problems</li>
        <li>Course materials shared with permission</li>
      </ul>
      
      <h3>What's Not Allowed</h3>
      <ul>
        <li>Copyrighted material without permission</li>
        <li>Solutions to ongoing coursework</li>
        <li>Copyright-protected textbooks or materials</li>
        <li>Instructor lecture notes without permission</li>
      </ul>
      
      <h3>Faculty Takedown Requests</h3>
      <p>If you are an instructor or content creator and believe that content on our platform violates copyright or academic integrity:</p>
      <ol>
        <li>Submit a formal takedown request via our form</li>
        <li>Provide your faculty email and institution verification</li>
        <li>Describe the violation in detail</li>
        <li>Our team will review within 5 business days</li>
        <li>Content may be temporarily hidden during review</li>
      </ol>
      
      <h3>Contact</h3>
      <p>For policy questions: support@pastpapers.com</p>
    `,
  });
});

export default router;
