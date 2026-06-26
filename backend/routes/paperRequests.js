import express from 'express';
import { body, validationResult } from 'express-validator';
import PaperRequest from '../models/PaperRequest.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a new paper request
// @route   POST /api/requests
// @access  Private
router.post(
  '/',
  protect,
  [
    body('title').optional().isString().isLength({ max: 180 }).withMessage('Title is too long'),
    body('description').optional().isString().isLength({ max: 1500 }).withMessage('Description is too long'),
    body('university').notEmpty().withMessage('University is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('courseName').notEmpty().withMessage('Course name is required'),
    body('courseCode').optional().isString().isLength({ max: 40 }).withMessage('Course code is too long'),
    body('teacher').optional().isString().isLength({ max: 120 }).withMessage('Teacher is too long'),
    body('semester').optional().isString().isLength({ max: 60 }).withMessage('Semester is too long'),
    body('tags').optional().isString().isLength({ max: 600 }).withMessage('Tags are too long'),
    body('examType').isIn(['mid', 'final', 'quiz', 'assignment']).withMessage('Exam type is invalid'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('Year is invalid'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const request = await PaperRequest.create({
        requester: req.user._id,
        title: req.body.title?.trim() || undefined,
        description: req.body.description?.trim() || '',
        university: req.body.university,
        department: req.body.department,
        courseName: req.body.courseName,
        courseCode: req.body.courseCode?.trim() || undefined,
        teacher: req.body.teacher?.trim() || undefined,
        semester: req.body.semester?.trim() || undefined,
        examType: req.body.examType,
        year: Number(req.body.year),
        tags: req.body.tags
          ? req.body.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      });

      const populated = await PaperRequest.findById(request._id)
        .populate('requester', 'username university department profilePicture reputation badgeKeys contributorStatus');

      return res.status(201).json({
        message: 'Paper request created successfully',
        request: populated,
      });
    } catch (error) {
      console.error('Create paper request error:', error);
      return res.status(500).json({ message: 'Server error creating paper request' });
    }
  }
);

// @desc    List paper requests (public board)
// @route   GET /api/requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status = 'open', page = 1, limit = 20 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const filter = {};
    if (status && ['open', 'fulfilled', 'all'].includes(status)) {
      if (status !== 'all') {
        filter.status = status;
      }
    }

    const requests = await PaperRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .populate('requester', 'username university department profilePicture reputation badgeKeys contributorStatus')
      .populate('fulfilledByUser', 'username profilePicture reputation badgeKeys contributorStatus')
      .populate('fulfilledByPaper', 'title course courseCode year paperType');

    const total = await PaperRequest.countDocuments(filter);

    return res.json({
      requests,
      currentPage: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      total,
    });
  } catch (error) {
    console.error('List paper requests error:', error);
    return res.status(500).json({ message: 'Server error listing paper requests' });
  }
});

// @desc    Get a single paper request by ID
// @route   GET /api/requests/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await PaperRequest.findById(req.params.id)
      .populate('requester', 'username university department profilePicture reputation badgeKeys contributorStatus')
      .populate('fulfilledByUser', 'username profilePicture reputation badgeKeys contributorStatus')
      .populate('fulfilledByPaper', 'title course courseCode year paperType');

    if (!request) {
      return res.status(404).json({ message: 'Paper request not found' });
    }

    return res.json({ request });
  } catch (error) {
    console.error('Get paper request error:', error);
    return res.status(500).json({ message: 'Server error fetching paper request' });
  }
});

export default router;
