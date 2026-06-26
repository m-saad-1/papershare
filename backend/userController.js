import asyncHandler from 'express-async-handler';
import User from './models/user.js';
import Paper from './models/paper.js';
import Note from './models/Note.js';
import Download from './models/download.js';
import Notification from './models/Notification.js';
import PaperRequest from './models/PaperRequest.js';
import path from 'path';
import fs from 'fs';
import { getWeekKey } from './services/reputationService.js';
import { getBadgeDetailsFromKeys } from './services/badgeService.js';

// Other user controller functions like registerUser, loginUser, etc. would be here.

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      university: user.university,
      department: user.department,
      semester: user.semester,
      batch: user.batch,
      role: user.role,
      bio: user.bio,
      profilePicture: user.profilePicture,
      uploadCount: user.uploadCount,
      reputation: user.reputation,
      badgeKeys: user.badgeKeys || [],
      badges: getBadgeDetailsFromKeys(user.badgeKeys),
      contributorStatus: user.contributorStatus,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Get public contributor profile with contribution metrics
 * @route   GET /api/users/:id/public
 * @access  Public
 */
const getPublicContributorProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const [paperStatsAgg, noteStatsAgg, downloadImpactAgg, papers, totalUsers] = await Promise.all([
    Paper.aggregate([
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$uploader', user._id] },
              { $eq: [{ $toString: '$uploader' }, user._id.toString()] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
          helpfulVotesReceived: {
            $sum: {
              $max: [
                { $ifNull: ['$helpfulVotes', 0] },
                { $ifNull: ['$totalVotes', 0] },
                {
                  $cond: [
                    { $isArray: '$votedBy' },
                    { $size: '$votedBy' },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    ]),
    Note.aggregate([
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$uploader', user._id] },
              { $eq: [{ $toString: '$uploader' }, user._id.toString()] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
          helpfulVotesReceived: {
            $sum: {
              $max: [
                { $ifNull: ['$helpfulVotes', 0] },
                {
                  $cond: [
                    { $isArray: '$votedBy' },
                    { $size: '$votedBy' },
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    ]),
    Download.aggregate([
      {
        $lookup: {
          from: 'papers',
          localField: 'paper',
          foreignField: '_id',
          as: 'paperDoc',
        },
      },
      { $unwind: '$paperDoc' },
      { $match: { 'paperDoc.uploader': user._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'downloader',
        },
      },
      { $unwind: { path: '$downloader', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          studentsHelped: { $sum: 1 },
          universitiesReachedSet: { $addToSet: '$downloader.university' },
          coursesCoveredSet: { $addToSet: '$paperDoc.course' },
        },
      },
      {
        $project: {
          studentsHelped: 1,
          universitiesReached: {
            $size: {
              $filter: {
                input: '$universitiesReachedSet',
                as: 'uni',
                cond: { $and: [{ $ne: ['$$uni', null] }, { $ne: ['$$uni', ''] }] },
              },
            },
          },
          coursesCovered: {
            $size: {
              $filter: {
                input: '$coursesCoveredSet',
                as: 'course',
                cond: { $and: [{ $ne: ['$$course', null] }, { $ne: ['$$course', ''] }] },
              },
            },
          },
        },
      },
    ]),
    Paper.find({ uploader: user._id })
      .sort({ createdAt: -1 })
      .select('title course courseCode year paperType status visibility downloadCount helpfulVotes views createdAt'),
    User.countDocuments({ role: { $ne: 'admin' } }),
  ]);

  const paperStats = paperStatsAgg[0] || {
    totalUploads: 0,
    downloadsGenerated: 0,
    helpfulVotesReceived: 0,
  };

  const noteStats = noteStatsAgg[0] || {
    totalUploads: 0,
    downloadsGenerated: 0,
    helpfulVotesReceived: 0,
  };

  const stats = {
    totalUploads: (paperStats.totalUploads || 0) + (noteStats.totalUploads || 0) || user.uploadCount || 0,
    paperUploads: paperStats.totalUploads || 0,
    noteUploads: noteStats.totalUploads || 0,
    downloadsGenerated: (paperStats.downloadsGenerated || 0) + (noteStats.downloadsGenerated || 0),
    helpfulVotesReceived: (paperStats.helpfulVotesReceived || 0) + (noteStats.helpfulVotesReceived || 0),
    points: user.reputation || 0,
  };

  const higherCount = await User.countDocuments({
    role: { $ne: 'admin' },
    $or: [
      { reputation: { $gt: user.reputation || 0 } },
      {
        reputation: user.reputation || 0,
        uploadCount: { $gt: stats.totalUploads || 0 },
      },
    ],
  });

  const rank = higherCount + 1;
  const rankPercentile = totalUsers > 0
    ? Math.max(0, Math.min(100, Number((((totalUsers - rank + 1) / totalUsers) * 100).toFixed(2))))
    : 0;

  const impact = downloadImpactAgg[0] || {
    studentsHelped: stats.downloadsGenerated || 0,
    universitiesReached: 0,
    coursesCovered: 0,
  };

  res.json({
    user: {
      _id: user._id,
      username: user.username,
      university: user.university,
      department: user.department,
      profilePicture: user.profilePicture,
      contributorStatus: user.contributorStatus,
      reputation: user.reputation,
      badgeKeys: user.badgeKeys || [],
      badges: getBadgeDetailsFromKeys(user.badgeKeys),
      rank,
      rankPercentile,
    },
    metrics: {
      totalUploads: stats.totalUploads || 0,
      paperUploads: stats.paperUploads || 0,
      noteUploads: stats.noteUploads || 0,
      downloadsGenerated: stats.downloadsGenerated || 0,
      helpfulVotesReceived: stats.helpfulVotesReceived || 0,
      points: stats.points || 0,
      studentsHelped: impact.studentsHelped || 0,
      universitiesReached: impact.universitiesReached || 0,
      coursesCovered: impact.coursesCovered || 0,
    },
    papers,
  });
});

/**
 * @desc    Public social proof stats
 * @route   GET /api/users/stats/public
 * @access  Public
 */
const getPublicPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalPapers,
    totalStudents,
    downloadsAgg,
    paperDepartments,
    noteDepartments,
    openRequests,
  ] = await Promise.all([
    Paper.countDocuments({ status: 'approved', visibility: 'public' }),
    User.countDocuments({ role: { $ne: 'admin' } }),
    Paper.aggregate([
      { $match: { status: 'approved', visibility: 'public' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$downloadCount', 0] } } } },
    ]),
    Paper.distinct('department', { status: 'approved', visibility: 'public' }),
    Note.distinct('department', { status: 'approved', visibility: 'public' }),
    PaperRequest.countDocuments({ status: 'open' }),
  ]);

  const departmentSet = new Set(
    [...paperDepartments, ...noteDepartments]
      .map((department) => String(department || '').trim().toLowerCase())
      .filter(Boolean)
  );

  res.json({
    totalPapers,
    totalStudents,
    totalDownloads: downloadsAgg[0]?.total || 0,
    totalDepartments: departmentSet.size,
    openRequests,
  });
});

/**
 * @desc    Get impact metrics for current user
 * @route   GET /api/users/:id/impact
 * @access  Private
 */
const getContributorImpactMetrics = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access impact metrics');
  }

  const user = await User.findById(req.params.id).select('uploadCount reputation');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const [paperStatsAgg, noteStatsAgg, impactAgg] = await Promise.all([
    Paper.aggregate([
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$uploader', user._id] },
              { $eq: [{ $toString: '$uploader' }, user._id.toString()] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
          helpfulVotesReceived: {
            $sum: {
              $max: [
                { $ifNull: ['$helpfulVotes', 0] },
                { $ifNull: ['$totalVotes', 0] },
                {
                  $cond: [
                    { $isArray: '$votedBy' },
                    { $size: '$votedBy' },
                    0,
                  ],
                },
              ],
            },
          },
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          coursesCoveredSet: { $addToSet: '$course' },
        },
      },
      {
        $project: {
          totalUploads: 1,
          downloadsGenerated: 1,
          helpfulVotesReceived: 1,
          totalViews: 1,
          coursesCovered: {
            $size: {
              $filter: {
                input: '$coursesCoveredSet',
                as: 'course',
                cond: { $and: [{ $ne: ['$$course', null] }, { $ne: ['$$course', ''] }] },
              },
            },
          },
        },
      },
    ]),
    Note.aggregate([
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$uploader', user._id] },
              { $eq: [{ $toString: '$uploader' }, user._id.toString()] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
          helpfulVotesReceived: {
            $sum: {
              $max: [
                { $ifNull: ['$helpfulVotes', 0] },
                {
                  $cond: [
                    { $isArray: '$votedBy' },
                    { $size: '$votedBy' },
                    0,
                  ],
                },
              ],
            },
          },
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          coursesCoveredSet: { $addToSet: '$course' },
        },
      },
      {
        $project: {
          totalUploads: 1,
          downloadsGenerated: 1,
          helpfulVotesReceived: 1,
          totalViews: 1,
          coursesCovered: {
            $size: {
              $filter: {
                input: '$coursesCoveredSet',
                as: 'course',
                cond: { $and: [{ $ne: ['$$course', null] }, { $ne: ['$$course', ''] }] },
              },
            },
          },
        },
      },
    ]),
    Download.aggregate([
      {
        $lookup: {
          from: 'papers',
          localField: 'paper',
          foreignField: '_id',
          as: 'paperDoc',
        },
      },
      { $unwind: '$paperDoc' },
      { $match: { 'paperDoc.uploader': user._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'downloader',
        },
      },
      { $unwind: { path: '$downloader', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          studentsHelped: { $sum: 1 },
          universitiesReachedSet: { $addToSet: '$downloader.university' },
        },
      },
      {
        $project: {
          studentsHelped: 1,
          universitiesReached: {
            $size: {
              $filter: {
                input: '$universitiesReachedSet',
                as: 'uni',
                cond: { $and: [{ $ne: ['$$uni', null] }, { $ne: ['$$uni', ''] }] },
              },
            },
          },
        },
      },
    ]),
  ]);

  const paperStats = paperStatsAgg[0] || {
    totalUploads: 0,
    downloadsGenerated: 0,
    helpfulVotesReceived: 0,
    totalViews: 0,
    coursesCovered: 0,
  };

  const noteStats = noteStatsAgg[0] || {
    totalUploads: 0,
    downloadsGenerated: 0,
    helpfulVotesReceived: 0,
    totalViews: 0,
    coursesCovered: 0,
  };

  const mergedUploads = (paperStats.totalUploads || 0) + (noteStats.totalUploads || 0);
  const mergedDownloads = (paperStats.downloadsGenerated || 0) + (noteStats.downloadsGenerated || 0);
  const mergedVotes = (paperStats.helpfulVotesReceived || 0) + (noteStats.helpfulVotesReceived || 0);
  const mergedViews = (paperStats.totalViews || 0) + (noteStats.totalViews || 0);
  const mergedCoursesCovered = Math.max(paperStats.coursesCovered || 0, noteStats.coursesCovered || 0);
  const safeUploads = mergedUploads > 0 ? mergedUploads : (user.uploadCount || 0);

  const impact = impactAgg[0] || {
    studentsHelped: mergedDownloads || 0,
    universitiesReached: 0,
  };

  res.json({
    totalUploads: safeUploads,
    paperUploads: paperStats.totalUploads || 0,
    noteUploads: noteStats.totalUploads || 0,
    downloadsGenerated: mergedDownloads,
    helpfulVotesReceived: mergedVotes,
    totalViews: mergedViews,
    paperViews: paperStats.totalViews || 0,
    noteViews: noteStats.totalViews || 0,
    studentsHelped: impact.studentsHelped || 0,
    universitiesReached: impact.universitiesReached || 0,
    coursesCovered: mergedCoursesCovered,
    points: user.reputation || 0,
  });
});

/**
 * @desc    Get current user notifications
 * @route   GET /api/users/:id/notifications
 * @access  Private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access notifications');
  }

  const notifications = await Notification.find({ user: req.params.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  res.json({ notifications });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/users/:id/notifications/read-all
 * @access  Private
 */
const markNotificationsRead = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update notifications');
  }

  await Notification.updateMany(
    { user: req.params.id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ message: 'Notifications marked as read' });
});

/**
 * @desc    Get leaderboard of users based on reputation
 * @route   GET /api/users/leaderboard
 * @access  Public
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      scope = 'global',
      university,
      department,
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));

    const userMatch = { role: { $ne: 'admin' } };

    if (scope === 'university' && university) {
      userMatch.university = new RegExp(`^${String(university).trim()}$`, 'i');
    }

    if (scope === 'department') {
      if (university) {
        userMatch.university = new RegExp(`^${String(university).trim()}$`, 'i');
      }
      if (department) {
        userMatch.department = new RegExp(`^${String(department).trim()}$`, 'i');
      }
    }

    const leaderboardPipeline = [
      { $match: userMatch },
      {
        $lookup: {
          from: 'papers',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$uploader', '$$userId'] },
                    { $eq: [{ $toString: '$uploader' }, { $toString: '$$userId' }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$uploader',
                totalUploads: { $sum: 1 },
                downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
                helpfulVotesReceived: {
                  $sum: {
                    $max: [
                      { $ifNull: ['$helpfulVotes', 0] },
                      { $ifNull: ['$totalVotes', 0] },
                      {
                        $cond: [
                          { $isArray: '$votedBy' },
                          { $size: '$votedBy' },
                          0,
                        ],
                      },
                    ],
                  },
                },
              },
            },
          ],
          as: 'paperStats',
        },
      },
      {
        $lookup: {
          from: 'notes',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$uploader', '$$userId'] },
                    { $eq: [{ $toString: '$uploader' }, { $toString: '$$userId' }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$uploader',
                totalUploads: { $sum: 1 },
                downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
                helpfulVotesReceived: {
                  $sum: {
                    $max: [
                      { $ifNull: ['$helpfulVotes', 0] },
                      {
                        $cond: [
                          { $isArray: '$votedBy' },
                          { $size: '$votedBy' },
                          0,
                        ],
                      },
                    ],
                  },
                },
              },
            },
          ],
          as: 'noteStats',
        },
      },
      {
        $addFields: {
          paperUploads: {
            $ifNull: [{ $arrayElemAt: ['$paperStats.totalUploads', 0] }, 0],
          },
          noteUploads: {
            $ifNull: [{ $arrayElemAt: ['$noteStats.totalUploads', 0] }, 0],
          },
          paperDownloadsGenerated: {
            $ifNull: [{ $arrayElemAt: ['$paperStats.downloadsGenerated', 0] }, 0],
          },
          noteDownloadsGenerated: {
            $ifNull: [{ $arrayElemAt: ['$noteStats.downloadsGenerated', 0] }, 0],
          },
          paperHelpfulVotesReceived: {
            $ifNull: [{ $arrayElemAt: ['$paperStats.helpfulVotesReceived', 0] }, 0],
          },
          noteHelpfulVotesReceived: {
            $ifNull: [{ $arrayElemAt: ['$noteStats.helpfulVotesReceived', 0] }, 0],
          },
          points: { $ifNull: ['$reputation', 0] },
        },
      },
      {
        $addFields: {
          totalUploadsRaw: { $add: ['$paperUploads', '$noteUploads'] },
          downloadsGenerated: { $add: ['$paperDownloadsGenerated', '$noteDownloadsGenerated'] },
          helpfulVotesReceived: { $add: ['$paperHelpfulVotesReceived', '$noteHelpfulVotesReceived'] },
          totalUploads: {
            $cond: [
              { $gt: [{ $add: ['$paperUploads', '$noteUploads'] }, 0] },
              { $add: ['$paperUploads', '$noteUploads'] },
              { $ifNull: ['$uploadCount', 0] },
            ],
          },
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
          paperStats: 0,
          noteStats: 0,
          paperUploads: 0,
          noteUploads: 0,
          paperDownloadsGenerated: 0,
          noteDownloadsGenerated: 0,
          paperHelpfulVotesReceived: 0,
          noteHelpfulVotesReceived: 0,
          totalUploadsRaw: 0,
        },
      },
      {
        $sort: {
          isCampusAmbassador: -1, // Ambassadors first
          points: -1,
          helpfulVotesReceived: -1,
          totalUploads: -1,
          downloadsGenerated: -1,
          createdAt: 1,
        },
      },
    ];

    const paginationPipeline = [
      ...leaderboardPipeline,
      {
        $facet: {
          users: [
            { $skip: (parsedPage - 1) * parsedLimit },
            { $limit: parsedLimit },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await User.aggregate(paginationPipeline);
    const users = (result?.users || []).map((user, index) => ({
      ...user,
      helpfulVotesReceived: Number(user.helpfulVotesReceived || 0),
      votesReceived: Number(user.helpfulVotesReceived || 0),
      downloadsGenerated: Number(user.downloadsGenerated || 0),
      totalUploads: Number(user.totalUploads || user.uploadCount || 0),
      points: Number(user.points || 0),
      rank: ((parsedPage - 1) * parsedLimit) + index + 1,
      isTopContributorThisWeek: user.lastTopContributorBonusWeek === getWeekKey(),
    }));
    const total = result?.total?.[0]?.count || 0;

    res.json({
      users,
      totalPages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
      total,
      scope,
    });
  } catch (error) {
    console.error('Get leaderboard error details:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard', error: error.message });
  }
});

/**
 * @desc    Get top contributors of current week
 * @route   GET /api/users/leaderboard/weekly
 * @access  Public
 */
const getWeeklyTopContributors = asyncHandler(async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const parsedLimit = Math.max(1, Math.min(20, parseInt(limit, 10) || 5));
    const currentWeek = getWeekKey();

    const weeklyPipeline = [
      {
        $match: {
          role: { $ne: 'admin' },
          weeklyContributionWeek: currentWeek,
          weeklyContributionScore: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: 'papers',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$uploader', '$$userId'] } } },
            {
              $group: {
                _id: '$uploader',
                totalUploads: { $sum: 1 },
                downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
              },
            },
          ],
          as: 'paperStats',
        },
      },
      {
        $addFields: {
          weeklyPoints: { $ifNull: ['$weeklyContributionScore', 0] },
          points: { $ifNull: ['$reputation', 0] },
          totalUploads: {
            $ifNull: [{ $arrayElemAt: ['$paperStats.totalUploads', 0] }, 0],
          },
          downloadsGenerated: {
            $ifNull: [{ $arrayElemAt: ['$paperStats.downloadsGenerated', 0] }, 0],
          },
        },
      },
      { $sort: { weeklyPoints: -1, points: -1, createdAt: 1 } },
      { $limit: parsedLimit },
      {
        $project: {
          password: 0,
          __v: 0,
          paperStats: 0,
        },
      },
    ];

    const usersAgg = await User.aggregate(weeklyPipeline);
    const users = usersAgg.map((user, index) => ({ ...user, rank: index + 1 }));

    res.json({
      week: currentWeek,
      users,
    });
  } catch (error) {
    console.error('Get weekly top contributors error:', error);
    res.status(500).json({ message: 'Server error fetching weekly contributors', error: error.message });
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this user profile');
    }

    user.username = req.body.username || user.username;
    user.university = req.body.university || user.university;
    user.department = req.body.department || user.department;
    user.semester = req.body.semester || user.semester;
    user.batch = req.body.batch || user.batch;
    user.bio = req.body.bio || user.bio;

    if (req.file) {
      // If there's an old picture, delete it
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, '..', 'uploads', path.basename(user.profilePicture));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      user.profilePicture = path.join('uploads', req.file.filename);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      university: updatedUser.university,
      department: updatedUser.department,
      semester: updatedUser.semester,
      batch: updatedUser.batch,
      role: updatedUser.role,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      uploadCount: updatedUser.uploadCount,
      reputation: updatedUser.reputation,
      badgeKeys: updatedUser.badgeKeys || [],
      badges: getBadgeDetailsFromKeys(updatedUser.badgeKeys),
      contributorStatus: updatedUser.contributorStatus,
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  getAllUsers,
  getUserProfile,
  getPublicContributorProfile,
  getPublicPlatformStats,
  getContributorImpactMetrics,
  getUserNotifications,
  markNotificationsRead,
  getLeaderboard,
  getWeeklyTopContributors,
  updateUserProfile,
};
