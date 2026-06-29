import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import Note from '../models/Note.js';
import Report from '../models/Report.js';
import User from '../models/user.js';
import { protect, softProtect } from '../middleware/auth.js';
import { REPUTATION_POINTS, adjustUserReputation } from '../services/reputationService.js';
import { evaluateAndGrantBadges } from '../services/badgeService.js';
import { syncContributorStatus } from '../services/contributorStatusService.js';

const router = express.Router();

import { cloudinaryStorage } from '../config/cloudinary.js';

const allowedMimetypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, PNG, JPG, and WEBP files are allowed'), false);
  }
};

const upload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

const canAccessNote = (note, requester) => {
  if (!note) return false;

  const isApprovedPublic = note.status === 'approved' && note.visibility === 'public';
  const isOwner = requester?._id && String(requester._id) === String(note.uploader);
  const isAdmin = requester?.role === 'admin';

  return isApprovedPublic || isOwner || isAdmin;
};

router.get('/user/my-notes', protect, async (req, res) => {
  try {
    const notes = await Note.find({ uploader: req.user._id })
      .sort({ createdAt: -1 })
      .select('title course courseCode university department semester year status visibility downloadCount views helpfulVotes votedBy createdAt updatedAt');

    return res.json(notes);
  } catch (error) {
    console.error('Get user notes error:', error);
    return res.status(500).json({ message: 'Server error fetching user notes' });
  }
});

router.post(
  '/upload',
  protect,
  upload.single('file'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('university').notEmpty().withMessage('University is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('course').notEmpty().withMessage('Course is required'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'File is required' });
      }

      const note = new Note({
        title: req.body.title,
        description: req.body.description,
        university: req.body.university,
        department: req.body.department,
        course: req.body.course,
        courseCode: req.body.courseCode,
        semester: req.body.semester,
        year: Number(req.body.year),
        tags: req.body.tags ? req.body.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        uploader: req.user._id,
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        status: 'pending',
      });

      await note.save();

      const updatedUser = await User.findById(req.user._id);

      return res.status(201).json({
        message: 'Note submitted for approval',
        note,
        engagementFeedback: {
          totalReputation: updatedUser?.reputation || 0,
          newBadges: updatedUser?.badgeKeys || [],
          contributorStatus: updatedUser?.contributorStatus,
          uploadCount: updatedUser?.uploadCount || 0,
        },
      });
    } catch (error) {
      console.error('Upload note error:', error);
      return res.status(500).json({ message: 'Server error during note upload' });
    }
  }
);

router.get('/', softProtect, async (req, res) => {
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      visibility,
    } = req.query;

    const isAdmin = req.user?.role === 'admin';
    const filter = {};

    if (isAdmin) {
      if (status) filter.status = status;
      if (visibility) filter.visibility = visibility;
    } else {
      filter.status = 'approved';
      filter.visibility = 'public';
    }

    if (university) filter.university = new RegExp(university, 'i');
    if (department) filter.department = new RegExp(department, 'i');
    if (course) filter.course = new RegExp(course, 'i');
    if (semester) filter.semester = new RegExp(semester, 'i');
    if (year) filter.year = Number(year);

    if (search) {
      filter.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort(sortOptions)
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .populate('uploader', 'username university department reputation badgeKeys contributorStatus profilePicture'),
      Note.countDocuments(filter),
    ]);

    return res.json({
      notes,
      total,
      totalPages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
    });
  } catch (error) {
    console.error('List notes error:', error);
    return res.status(500).json({ message: 'Server error fetching notes' });
  }
});

router.get('/:id', softProtect, async (req, res) => {
  try {
    req.user = req.user || null;
    const note = await Note.findById(req.params.id)
      .populate('uploader', 'username university department reputation badgeKeys contributorStatus profilePicture');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!canAccessNote(note, req.user)) {
      return res.status(403).json({ message: 'You are not authorized to view this note' });
    }

    return res.json({
      note,
      fileUrl: note.file?.path || (note.file?.filename ? `/api/uploads/${note.file.filename}` : null),
    });
  } catch (error) {
    console.error('Get note details error:', error);
    return res.status(500).json({ message: 'Server error fetching note details' });
  }
});

router.post('/:id/report', protect, async (req, res) => {
  try {
    const { reason, description } = req.body;

    if (!reason || !description?.trim()) {
      return res.status(400).json({ message: 'Reason and description are required' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const existingReport = await Report.findOne({
      note: req.params.id,
      reporter: req.user.id,
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this note' });
    }

    const report = new Report({
      note: req.params.id,
      reporter: req.user.id,
      reason,
      description: description.trim(),
    });

    await report.save();

    return res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    console.error('Report note error:', error);
    return res.status(500).json({ message: 'Server error submitting note report' });
  }
});

router.post('/:id/download', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploader', '_id');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!canAccessNote(note, req.user)) {
      return res.status(403).json({ message: 'You are not authorized to download this note' });
    }

    note.downloadCount += 1;
    await note.save();

    if (String(req.user._id) !== String(note.uploader?._id)) {
      await adjustUserReputation(note.uploader._id, REPUTATION_POINTS.DOWNLOAD_GENERATED);
      await evaluateAndGrantBadges(note.uploader._id);
      await syncContributorStatus(note.uploader._id);
    }

    return res.json({
      message: 'Download counted',
      fileUrl: note.file?.path || `/api/uploads/${note.file?.filename}`,
      downloadCount: note.downloadCount,
    });
  } catch (error) {
    console.error('Download note error:', error);
    return res.status(500).json({ message: 'Server error downloading note' });
  }
});

router.patch('/:id/vote', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploader', '_id');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!canAccessNote(note, req.user)) {
      return res.status(403).json({ message: 'You are not authorized to vote on this note' });
    }

    const voterId = String(req.user._id);
    const uploaderId = String(note.uploader?._id || '');

    if (voterId === uploaderId) {
      return res.status(400).json({ message: 'You cannot vote on your own note' });
    }

    const votedIndex = note.votedBy.findIndex((id) => String(id) === voterId);
    let action = 'added';

    if (votedIndex >= 0) {
      note.votedBy.splice(votedIndex, 1);
      note.helpfulVotes = Math.max(0, (note.helpfulVotes || 0) - 1);
      action = 'removed';
      await adjustUserReputation(note.uploader._id, -REPUTATION_POINTS.HELPFUL_VOTE, { awardWeeklyBonus: false });
    } else {
      note.votedBy.push(req.user._id);
      note.helpfulVotes = (note.helpfulVotes || 0) + 1;
      await adjustUserReputation(note.uploader._id, REPUTATION_POINTS.HELPFUL_VOTE);
      await evaluateAndGrantBadges(note.uploader._id);
      await syncContributorStatus(note.uploader._id);
    }

    await note.save();

    return res.json({
      message: `Helpful vote ${action}`,
      helpfulVotes: note.helpfulVotes,
      votedBy: note.votedBy,
      action,
    });
  } catch (error) {
    console.error('Vote note error:', error);
    return res.status(500).json({ message: 'Server error updating note vote' });
  }
});

router.post('/:id/view', softProtect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!canAccessNote(note, req.user)) {
      return res.status(403).json({ message: 'You are not authorized to view this note' });
    }

    if (!req.user?._id || String(req.user._id) === String(note.uploader)) {
      return res.json({ views: note.views || 0 });
    }

    const hasViewed = note.viewedBy.some((id) => String(id) === String(req.user._id));
    if (!hasViewed) {
      note.viewedBy.push(req.user._id);
      note.views = (note.views || 0) + 1;
      await note.save();
    }

    return res.json({ views: note.views || 0 });
  } catch (error) {
    console.error('Count note view error:', error);
    return res.status(500).json({ message: 'Server error updating note views' });
  }
});

export default router;
