import express from 'express';
import { protect } from '../middleware/auth.js';
import Report from '../models/Report.js';
import Paper from '../models/paper.js';
import Note from '../models/Note.js';
import User from '../models/user.js';

const router = express.Router();

// @desc    Submit a report for a paper
// @route   POST /api/reports
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { paperId, noteId, reason, description } = req.body;

    if ((!paperId && !noteId) || !reason || !description) {
      return res.status(400).json({ message: 'A paper ID or note ID, reason, and description are required' });
    }

    if (paperId && noteId) {
      return res.status(400).json({ message: 'Report either a paper or a note, not both' });
    }

    const isNoteReport = Boolean(noteId);
    const targetField = isNoteReport ? 'note' : 'paper';
    const targetId = noteId || paperId;
    const targetModel = isNoteReport ? Note : Paper;
    const targetLabel = isNoteReport ? 'Note' : 'Paper';

    const targetDoc = await targetModel.findById(targetId);
    if (!targetDoc) {
      return res.status(404).json({ message: `${targetLabel} not found` });
    }

    // Check if user already reported this content
    const existingReport = await Report.findOne({
      [targetField]: targetId,
      reporter: req.user.id,
    });

    if (existingReport) {
      return res.status(400).json({ message: `You have already reported this ${isNoteReport ? 'note' : 'paper'}` });
    }

    const report = new Report({
      [targetField]: targetId,
      reporter: req.user.id,
      reason,
      description,
    });

    await report.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ message: 'Server error submitting report' });
  }
});

// @desc    Get user's submitted reports
// @route   GET /api/reports/my-reports
// @access  Private
router.get('/my-reports', protect, async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user.id })
      .populate('paper', 'title course university department')
      .populate('note', 'title course university department')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ reports });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// @desc    Get moderation queue (Admin or Campus Ambassador)
// @route   GET /api/reports/moderation-queue
// @access  Private (Admin or Campus Ambassador)
router.get('/moderation-queue', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'admin' && !user.isCampusAmbassador) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status = 'pending' } = req.query;

    let filter = { status };

    // Campus ambassadors can only moderate papers from their university
    if (user.isCampusAmbassador && user.role !== 'admin') {
      const reportedPapers = await Report.find(filter).distinct('paper');
      const reportedNotes = await Report.find(filter).distinct('note');
      const universityPapers = await Paper.find({
        _id: { $in: reportedPapers },
        university: new RegExp(`^${user.ambassadorUniversity}$`, 'i'),
      }).select('_id');
      const universityNotes = await Note.find({
        _id: { $in: reportedNotes },
        university: new RegExp(`^${user.ambassadorUniversity}$`, 'i'),
      }).select('_id');
      
      filter._id = {
        $in: await Report.find({
          $or: [
            { paper: { $in: universityPapers.map((p) => p._id) } },
            { note: { $in: universityNotes.map((note) => note._id) } },
          ],
        }).distinct('_id'),
      };
    }

    const reports = await Report.find(filter)
      .populate('paper', 'title course university department uploader file')
      .populate('note', 'title course university department uploader file')
      .populate('reporter', 'username email')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ reports });
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({ message: 'Server error fetching moderation queue' });
  }
});

// @desc    Review a report (Admin or Campus Ambassador)
// @route   PATCH /api/reports/:id/review
// @access  Private (Admin or Campus Ambassador)
router.patch('/:id/review', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'admin' && !user.isCampusAmbassador) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, adminNotes, action } = req.body;

    const report = await Report.findById(req.params.id)
      .populate('paper')
      .populate('note');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const targetDoc = report.paper || report.note;
    const targetType = report.paper ? 'paper' : 'note';

    // Campus ambassadors can only moderate papers from their university
    if (user.isCampusAmbassador && user.role !== 'admin') {
      if (!targetDoc?.university?.match(new RegExp(`^${user.ambassadorUniversity}$`, 'i'))) {
        return res.status(403).json({ message: `You can only moderate ${targetType}s from your university` });
      }
    }

    report.status = status || report.status;
    report.adminNotes = adminNotes || report.adminNotes;
    report.action = action || report.action;
    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();

    // Execute action if specified
    if (action === 'paper_removed' && report.paper) {
      await Paper.findByIdAndUpdate(report.paper._id, {
        $set: { isActive: false, visibility: 'private' },
      });
    }

    if (action === 'note_removed' && report.note) {
      await Note.findByIdAndUpdate(report.note._id, {
        $set: { visibility: 'private', status: 'rejected' },
      });
    }

    await report.save();

    res.json({
      message: 'Report reviewed successfully',
      report,
    });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({ message: 'Server error reviewing report' });
  }
});

export default router;
