import express from 'express';
import { protect } from '../middleware/auth.js';
import { getTrendingPapers, getPopularPapers } from '../services/trendingService.js';

const router = express.Router();

// @desc    Get trending papers
// @route   GET /api/trending
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      limit = 10,
      daysWindow = 30,
      university,
      department,
    } = req.query;

    const trending = await getTrendingPapers({
      limit: parseInt(limit, 10),
      daysWindow: parseInt(daysWindow, 10),
      university,
      department,
    });

    res.json({ trending });
  } catch (error) {
    console.error('Trending papers error:', error);
    res.status(500).json({ message: 'Server error fetching trending papers' });
  }
});

// @desc    Get popular papers (all-time)
// @route   GET /api/trending/popular
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const {
      limit = 10,
      university,
      department,
    } = req.query;

    const popular = await getPopularPapers({
      limit: parseInt(limit, 10),
      university,
      department,
    });

    res.json({ popular });
  } catch (error) {
    console.error('Popular papers error:', error);
    res.status(500).json({ message: 'Server error fetching popular papers' });
  }
});

export default router;
