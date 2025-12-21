import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import Paper from '../models/paper.js';
import User from '../models/user.js';
import Download from '../models/download.js';
import { protect, softProtect, admin } from '../middleware/auth.js';


const router = express.Router();

// Get user's uploaded papers
router.get('/user/my-papers', protect, async (req, res) => {
  try {
    if (!req.user) {
      console.error('req.user is not defined in /user/my-papers route.');
      return res.status(401).json({ message: 'Not authorized, user data not available.' });
    }
    console.log('User in /user/my-papers:', req.user._id); // Log only the ID for brevity
    const papers = await Paper.find({ uploader: req.user._id })
      .sort({ createdAt: -1 })
      .select('title course courseCode university department year downloadCount views status visibility paperType teacher votedBy helpfulVotes');

    res.json(papers);
  } catch (error) {
    console.error('Get user papers error details:', error); // More specific logging
    res.status(500).json({ message: 'Server error fetching user papers', error: error.message }); // Send error message to client
  }
});

// Get user's downloaded papers
router.get('/user/my-downloads', protect, async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user._id })
      .sort({ downloadedAt: -1 })
      .populate('paper');

    res.json(downloads);
  } catch (error) {
    console.error('Get user downloads error:', error);
    res.status(500).json({ message: 'Server error fetching user downloads' });
  }
});

// Public route for getting papers by a specific user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const papers = await Paper.find({ uploader: req.params.userId, status: 'approved', visibility: 'public' })
      .sort({ createdAt: -1 });

    res.json(papers);
  } catch (error) {
    console.error('Get papers by user ID error:', error);
    res.status(500).json({ message: 'Server error fetching papers by user ID' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'paper-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload paper
router.post('/upload', protect, upload.single('file'), ...[
  body('title').notEmpty().withMessage('Title is required'),
  body('university').notEmpty().withMessage('University is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('courseCode').notEmpty().withMessage('Course code is required'),
  body('semester').notEmpty().withMessage('Semester is required'),
  body('year').isInt({ min: 2000, max: 2030 }).withMessage('Valid year is required'),
  body('paperType').isIn(['mid', 'final', 'quiz', 'assignment']).withMessage('Valid paper type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const {
      title,
      description,
      university,
      department,
      course,
      courseCode,
      semester,
      year,
      paperType,
      tags,
      teacher // Add teacher here
    } = req.body;

    // Create new paper
    const paper = new Paper({
      title,
      description,
      university,
      department,
      course,
      courseCode,
      teacher, // Add teacher here
      semester,
      year: parseInt(year),
      paperType,
      tags: tags && tags.length > 0 ? tags.split(',').map(tag => tag.trim()) : [],
      uploader: req.user._id,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

    await paper.save();

    // Increment user's upload count
    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadCount: 1 } });

    res.status(201).json({
      message: 'Paper uploaded successfully and is pending approval',
      paper
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// Get all papers with filtering and pagination
router.get('/', async (req, res) => {
  console.log("--- Reached GET /api/papers handler ---"); // Debug log
  console.log("Request query:", req.query);
  try {
    let {
      page = 1,
      limit = 10,
      search,
      university,
      department,
      course,
      semester,
      year,
      paperType,
      status = 'approved',
      sortBy = 'createdAt', // Default sort by createdAt
      sortOrder = 'desc', // Default sort order to descending
      visibility, // Get visibility from query, no default here yet
    } = req.query;

    // Handle sortBy with leading '-' for descending order
    if (sortBy.startsWith('-')) {
      sortBy = sortBy.substring(1); // Remove the '-'
      sortOrder = 'desc';
    }

    // Set default visibility if not provided or invalid
    const validVisibilityOptions = ['public', 'private'];
    if (!visibility || !validVisibilityOptions.includes(visibility)) {
      visibility = 'public';
    }

    // Build filter object
    const filter = { status, visibility };
    
    if (university) filter.university = new RegExp(university, 'i');
    if (department) filter.department = new RegExp(department, 'i');
    if (course) filter.course = new RegExp(course, 'i');
    if (semester) filter.semester = new RegExp(semester, 'i');
    if (year) filter.year = parseInt(year);
    if (paperType) filter.paperType = paperType;

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    console.log("Constructed filter:", filter);

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    console.log("Constructed sortOptions:", sortOptions);

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      populate: 'uploader',
      select: '-file.path'
    };

    console.log("Before Paper.find()");
    const papers = await Paper.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .populate('uploader', 'username university department')
      .exec();
    console.log("After Paper.find()");

    console.log("Before Paper.countDocuments()");
    const total = await Paper.countDocuments(filter);
    console.log("After Paper.countDocuments()");

    res.json({
      papers,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    });

  } catch (error) {
    console.error('Get papers error:', error); // Log full error object
    res.status(500).json({
      message: 'Server error fetching papers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Admin: Get all pending papers
router.get('/admin/pending', protect, admin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      university,
      department,
      course,
      semester,
      year,
      paperType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object for pending papers
    const filter = { status: 'pending' };

    if (university) filter.university = new RegExp(university, 'i');
    if (department) filter.department = new RegExp(department, 'i');
    if (course) filter.course = new RegExp(course, 'i');
    if (semester) filter.semester = new RegExp(semester, 'i');
    if (year) filter.year = parseInt(year);
    if (paperType) filter.paperType = paperType;

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      populate: 'uploader',
      select: '-file.path'
    };

    const papers = await Paper.find(filter)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .populate('uploader', 'username university department')
      .exec();

    const total = await Paper.countDocuments(filter);

    res.json({
      papers,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    });

  } catch (error) {
    console.error('Get pending papers error:', error);
    res.status(500).json({ message: 'Server error fetching pending papers' });
  }
});

// Admin: Update paper status (approve/reject)
router.patch('/admin/:id/status', protect, admin, [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const { status } = req.body;

    paper.status = status;
    if (status === 'approved') {
      paper.approvedAt = new Date();
      paper.approvedBy = req.user._id;
    } else if (status === 'rejected') {
      paper.approvedAt = undefined; // Clear if previously approved
      paper.approvedBy = undefined; // Clear if previously approved
    }

    const updatedPaper = await paper.save();

    res.json({
      message: `Paper ${status} successfully`,
      paper: updatedPaper
    });

  } catch (error) {
    console.error('Update paper status error:', error);
    res.status(500).json({ message: 'Server error updating paper status' });
  }
});

// Get single paper
router.get('/:id', softProtect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('uploader', 'username university department profilePicture')
      .populate('reports.user', 'username');

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const isOwner = req.user && paper.uploader && req.user._id.toString() === paper.uploader._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (paper.status !== 'approved' && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to view this paper.' });
    }
    
    if (paper.visibility === 'private' && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'This paper is private.' });
    }

    res.json(paper);
  } catch (error) {
    console.error('Get paper error:', error);
    res.status(500).json({ message: 'Server error fetching paper' });
  }
});

// Update paper
router.patch('/:id', protect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Check if the user is the owner of the paper or an admin
    if (paper.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to edit this paper' });
    }

    // Update paper fields
    const {
      title,
      description,
      university,
      department,
      course,
      courseCode,
      teacher,
      semester,
      year,
      paperType,
      tags,
      visibility
    } = req.body;

    paper.title = title || paper.title;
    paper.description = description || paper.description;
    paper.university = university || paper.university;
    paper.department = department || paper.department;
    paper.course = course || paper.course;
    paper.courseCode = courseCode || paper.courseCode;
    paper.teacher = teacher || paper.teacher;
    paper.semester = semester || paper.semester;
    paper.year = year || paper.year;
    paper.paperType = paperType || paper.paperType;
    paper.tags = tags || paper.tags;
    paper.visibility = visibility || paper.visibility;

    // After updating, the paper status should be set to 'pending' for re-approval
    // But not if only visibility is changed
    const bodyKeys = Object.keys(req.body);
    if (!(bodyKeys.length === 1 && bodyKeys[0] === 'visibility')) {
      paper.status = 'pending';
    }

    const updatedPaper = await paper.save();

    res.json(updatedPaper);
  } catch (error) {
    console.error('Update paper error:', error);
    res.status(500).json({ message: 'Server error updating paper' });
  }
});

// Delete paper
router.delete('/:id', protect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Check if the user is the owner of the paper or an admin
    if (paper.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this paper' });
    }

    await paper.deleteOne();

    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    console.error('Delete paper error:', error);
    res.status(500).json({ message: 'Server error deleting paper' });
  }
});



// Helpful vote for paper
router.put('/:id/vote', protect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const userId = req.user._id;
    const userIdString = userId.toString();
    const { vote } = req.body; // Expect `vote: true` for voting, `vote: false` for unvoting

    const hasVoted = paper.votedBy.some(voterId => voterId.toString() === userIdString);

    if (vote) { // User is trying to vote
      if (hasVoted) {
        return res.status(400).json({ message: 'You have already voted on this paper.' });
      }
      paper.votedBy.push(userId);
      paper.helpfulVotes += 1;
      await paper.save();
      res.json({
        message: 'Vote recorded successfully',
        helpfulVotes: paper.helpfulVotes,
        voted: true // Indicate that the vote was cast
      });
    } else { // User is trying to unvote
      if (!hasVoted) {
        return res.status(400).json({ message: 'You have not voted on this paper.' });
      }
      paper.votedBy = paper.votedBy.filter(voterId => voterId.toString() !== userId.toString());
      paper.helpfulVotes -= 1;
      await paper.save();
      res.json({
        message: 'Vote removed successfully',
        helpfulVotes: paper.helpfulVotes,
        voted: false // Indicate that the vote was removed
      });
    }
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error recording vote' });
  }
});

// Increment view count
router.put('/:id/view', protect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const userId = req.user._id;

    // Don't count view if the user is the uploader
    if (paper.uploader.toString() === userId.toString()) {
      return res.status(200).json({ message: 'Uploader view not counted.' });
    }

    // Check if user has already viewed this paper
    if (paper.viewedBy.includes(userId)) {
      return res.status(200).json({ message: 'User has already viewed this paper.' });
    }

    // Add user to viewedBy list and increment views
    paper.viewedBy.push(userId);
    paper.views = (paper.views || 0) + 1;
    await paper.save();

    res.json({
      message: 'View count updated successfully',
      views: paper.views
    });
  } catch (error) {
    console.error('View count error:', error);
    res.status(500).json({ message: 'Server error updating view count' });
  }
});

// Download paper
router.get('/:id/download', protect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    
    if (!paper || paper.status !== 'approved') {
      return res.status(404).json({ message: 'Paper not found or not approved' });
    }

    // Increment download count
    paper.downloadCount += 1;
    await paper.save();

    // Create a download record
    const download = new Download({
      user: req.user._id,
      paper: paper._id,
    });
    await download.save();

    res.download(paper.file.path, paper.file.originalName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error during download' });
  }
});

// Report paper
router.post('/:id/report', protect, [
  body('reason').isIn(['wrong_content', 'broken_file', 'duplicate', 'other']).withMessage('Valid reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const { reason, description } = req.body;

    // Check if user already reported this paper
    const existingReport = paper.reports.find(report => 
      report.user.toString() === req.user._id.toString()
    );

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this paper' });
    }

    paper.reports.push({
      user: req.user._id,
      reason,
      description
    });

    await paper.save();

    res.json({ message: 'Paper reported successfully' });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Server error during reporting' });
  }
});

// Get public stats
router.get('/stats', async (req, res) => {
  try {
    const totalPapers = await Paper.countDocuments({ status: 'approved' });

    const totalDownloadsResult = await Paper.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);
    const totalDownloads = totalDownloadsResult[0]?.total || 0;

    const totalUniversities = (await Paper.distinct('university', { status: 'approved' })).length;
    const totalDepartments = (await Paper.distinct('department', { status: 'approved' })).length;

    res.json({
      totalPapers,
      totalDownloads,
      totalUniversities,
      totalDepartments,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// Route for checking if the router is correctly loaded
router.get('/route-check', (req, res) => {
  res.json({ message: 'Paper routes are working!', timestamp: new Date() });
});

export default router;