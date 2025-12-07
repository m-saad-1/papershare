import asyncHandler from 'express-async-handler';
import Paper from '../models/paperModel.js';

// Other paper controller functions like getPapers, getPaperById, etc. would be here.

/**
 * @desc    Get all papers for a specific user
 * @route   GET /api/papers/user/:userId
 * @access  Public
 */
const getPapersByUser = asyncHandler(async (req, res) => {
  const papers = await Paper.find({ user: req.params.userId })
    .sort({ publicationDate: -1 });

  res.json(papers);
});

export {
  // other exported functions
  getPapersByUser,
};