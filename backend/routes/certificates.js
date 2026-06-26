import express from 'express';
import { protect } from '../middleware/auth.js';
import Certificate from '../models/Certificate.js';
import User from '../models/user.js';
import { getCertificateDisplayInfo } from '../services/certificateService.js';

const router = express.Router();

// @desc    Get user's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
router.get('/my-certificates', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .sort({ issuedAt: -1 })
      .populate('user', 'username university email');

    const certificatesWithDisplay = certificates.map((cert) => ({
      ...cert.toObject(),
      display: getCertificateDisplayInfo(cert),
    }));

    res.json({ certificates: certificatesWithDisplay });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Server error fetching certificates' });
  }
});

// @desc    Get certificate details
// @route   GET /api/certificates/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'username university');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({
      certificate: {
        ...certificate.toObject(),
        display: getCertificateDisplayInfo(certificate),
      },
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Server error fetching certificate' });
  }
});

// @desc    Get all certificates (public leaderboard view)
// @route   GET /api/certificates/leaderboard/:semester/:year
// @access  Public
router.get('/leaderboard/:semester/:year', async (req, res) => {
  try {
    const { semester, year } = req.params;

    const certificates = await Certificate.find({
      semester,
      year: parseInt(year),
    })
      .sort({ rank: 1, certificateType: 1 })
      .populate('user', 'username university profilePicture reputation')
      .limit(100);

    const grouped = {
      top_contributor: [],
      active_contributor: [],
      emerging_contributor: [],
    };

    certificates.forEach((cert) => {
      grouped[cert.certificateType].push({
        ...cert.toObject(),
        display: getCertificateDisplayInfo(cert),
      });
    });

    res.json({ semester, year, certificates: grouped });
  } catch (error) {
    console.error('Get leaderboard certificates error:', error);
    res.status(500).json({ message: 'Server error fetching certificates' });
  }
});

export default router;
