const express = require('express');
const mongoose = require('mongoose'); // Added this line
const User = require('../models/user');

const router = express.Router();

// @desc    Get user by ID
// @route   GET /api/users/:userId
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const userProfile = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.userId) }
      },
      {
        $lookup: {
          from: 'papers', // The collection name for papers
          localField: '_id',
          foreignField: 'uploader',
          as: 'uploadedPapers'
        }
      },
      {
        $addFields: {
          totalUploads: { $size: '$uploadedPapers' },
          totalDownloads: { $sum: '$uploadedPapers.downloadCount' },
          totalViews: { $sum: '$uploadedPapers.views' },
          totalHelpfulVotes: { $sum: '$uploadedPapers.helpfulVotes' },
          // Placeholder for rank, points - these would typically be calculated globally or in a separate process
          rank: 'N/A', 
          points: { $sum: [
            { $multiply: [{ $size: '$uploadedPapers' }, 10] }, // 10 points per upload
            { $multiply: [{ $sum: '$uploadedPapers.downloadCount' }, 0.5] }, // 0.5 points per download
            { $multiply: [{ $sum: '$uploadedPapers.helpfulVotes' }, 1] } // 1 point per helpful vote
          ]} 
        }
      },
      {
        $project: {
          password: 0,
          role: 0,
          email: 0, // Exclude email for public profile
          'uploadedPapers.uploader': 0,
          'uploadedPapers.reports': 0,
          'uploadedPapers.viewedBy': 0,
          'uploadedPapers.votedBy': 0,
          'uploadedPapers.file': 0,
          'uploadedPapers.description': 0,
          'uploadedPapers.status': 0,
          'uploadedPapers.visibility': 0,
          'uploadedPapers.tags': 0,
          'uploadedPapers.approvedAt': 0,
          'uploadedPapers.approvedBy': 0,
          'uploadedPapers.totalVotes': 0,
          'uploadedPapers.isActive': 0,
          'uploadedPapers.createdAt': 0,
          'uploadedPapers.updatedAt': 0, // Assuming you have this
        }
      }
    ]);

    if (userProfile.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userProfile[0]);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;