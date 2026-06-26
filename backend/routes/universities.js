import express from 'express';
import Paper from '../models/paper.js';
import Note from '../models/Note.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const universities = await Paper.distinct('university', { status: 'approved', visibility: 'public' });
    res.json({ universities: universities.sort() });
  } catch (error) {
    console.error('List universities error:', error);
    res.status(500).json({ message: 'Server error fetching universities' });
  }
});

router.get('/:university/community', async (req, res) => {
  try {
    const universityName = decodeURIComponent(req.params.university);
    const {
      page = 1,
      limit = 12,
      department,
      course,
      semester,
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const universityRegex = new RegExp(`^${universityName}$`, 'i');

    const baseFilter = {
      university: universityRegex,
      status: 'approved',
      visibility: 'public',
    };
    const noteFilter = {
      university: universityRegex,
      status: 'approved',
      visibility: 'public',
    };

    if (department) {
      baseFilter.department = new RegExp(department, 'i');
      noteFilter.department = new RegExp(department, 'i');
    }
    if (course) {
      baseFilter.course = new RegExp(course, 'i');
      noteFilter.course = new RegExp(course, 'i');
    }
    if (semester) {
      baseFilter.semester = new RegExp(semester, 'i');
      noteFilter.semester = new RegExp(semester, 'i');
    }

    const [
      totalPapers,
      totalNotes,
      communityPaperStats,
      communityNoteStats,
      papers,
      total,
      topContributorAgg,
      paperDepartments,
      noteDepartments,
      paperCourses,
      noteCourses,
      paperSemesters,
      noteSemesters,
    ] = await Promise.all([
      Paper.countDocuments({ university: universityRegex, status: 'approved', visibility: 'public' }),
      Note.countDocuments({ university: universityRegex, status: 'approved', visibility: 'public' }),
      Paper.aggregate([
        { $match: { university: universityRegex, status: 'approved', visibility: 'public' } },
        {
          $group: {
            _id: null,
            totalUploads: { $sum: 1 },
            totalDownloads: { $sum: { $ifNull: ['$downloadCount', 0] } },
            totalVotes: {
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
            contributors: { $addToSet: '$uploader' },
          },
        },
      ]),
      Note.aggregate([
        { $match: { university: universityRegex, status: 'approved', visibility: 'public' } },
        {
          $group: {
            _id: null,
            totalUploads: { $sum: 1 },
            totalDownloads: { $sum: { $ifNull: ['$downloadCount', 0] } },
            totalVotes: {
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
            contributors: { $addToSet: '$uploader' },
          },
        },
      ]),
      Paper.find(baseFilter)
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .populate('uploader', 'username profilePicture reputation contributorStatus badgeKeys')
        .select('title course courseCode semester year paperType department downloadCount helpfulVotes createdAt uploader'),
      Paper.countDocuments(baseFilter),
      User.aggregate([
        { $match: { role: { $ne: 'admin' } } },
        {
          $lookup: {
            from: 'papers',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  university: universityRegex,
                  status: 'approved',
                  visibility: 'public',
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
                  _id: null,
                  uploads: { $sum: 1 },
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
                  university: universityRegex,
                  status: 'approved',
                  visibility: 'public',
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
                  _id: null,
                  uploads: { $sum: 1 },
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
                },
              },
            ],
            as: 'noteStats',
          },
        },
        {
          $addFields: {
            paperUploads: { $ifNull: [{ $arrayElemAt: ['$paperStats.uploads', 0] }, 0] },
            noteUploads: { $ifNull: [{ $arrayElemAt: ['$noteStats.uploads', 0] }, 0] },
            paperDownloadsGenerated: { $ifNull: [{ $arrayElemAt: ['$paperStats.downloadsGenerated', 0] }, 0] },
            noteDownloadsGenerated: { $ifNull: [{ $arrayElemAt: ['$noteStats.downloadsGenerated', 0] }, 0] },
            paperHelpfulVotesReceived: { $ifNull: [{ $arrayElemAt: ['$paperStats.helpfulVotesReceived', 0] }, 0] },
            noteHelpfulVotesReceived: { $ifNull: [{ $arrayElemAt: ['$noteStats.helpfulVotesReceived', 0] }, 0] },
            paperViews: { $ifNull: [{ $arrayElemAt: ['$paperStats.totalViews', 0] }, 0] },
            noteViews: { $ifNull: [{ $arrayElemAt: ['$noteStats.totalViews', 0] }, 0] },
          },
        },
        {
          $addFields: {
            totalUploads: { $add: ['$paperUploads', '$noteUploads'] },
            downloadsGenerated: { $add: ['$paperDownloadsGenerated', '$noteDownloadsGenerated'] },
            helpfulVotesReceived: { $add: ['$paperHelpfulVotesReceived', '$noteHelpfulVotesReceived'] },
            totalViews: { $add: ['$paperViews', '$noteViews'] },
            points: { $ifNull: ['$reputation', 0] },
          },
        },
        { $match: { totalUploads: { $gt: 0 } } },
        { $sort: { points: -1, helpfulVotesReceived: -1, totalUploads: -1, downloadsGenerated: -1, totalViews: -1, createdAt: 1 } },
        { $limit: 1 },
        {
          $project: {
            _id: 1,
            username: 1,
            profilePicture: 1,
            reputation: 1,
            contributorStatus: 1,
            badgeKeys: 1,
            paperUploads: 1,
            noteUploads: 1,
            totalUploads: 1,
            downloadsGenerated: 1,
            helpfulVotesReceived: 1,
            totalViews: 1,
            points: 1,
          },
        },
      ]),
      Paper.distinct('department', { university: universityRegex, status: 'approved', visibility: 'public' }),
      Note.distinct('department', { university: universityRegex, status: 'approved', visibility: 'public' }),
      Paper.distinct('course', { university: universityRegex, status: 'approved', visibility: 'public' }),
      Note.distinct('course', { university: universityRegex, status: 'approved', visibility: 'public' }),
      Paper.distinct('semester', { university: universityRegex, status: 'approved', visibility: 'public' }),
      Note.distinct('semester', { university: universityRegex, status: 'approved', visibility: 'public' }),
    ]);

    const paperCommunityStats = communityPaperStats[0] || {
      totalUploads: 0,
      totalDownloads: 0,
      totalVotes: 0,
      totalViews: 0,
      contributors: [],
    };
    const noteCommunityStats = communityNoteStats[0] || {
      totalUploads: 0,
      totalDownloads: 0,
      totalVotes: 0,
      totalViews: 0,
      contributors: [],
    };

    const contributorIds = new Set([
      ...(paperCommunityStats.contributors || []).map((id) => String(id)),
      ...(noteCommunityStats.contributors || []).map((id) => String(id)),
    ]);

    const topContributor = topContributorAgg[0] || null;
    const departments = [...new Set([...(paperDepartments || []), ...(noteDepartments || [])].filter(Boolean))].sort();
    const courses = [...new Set([...(paperCourses || []), ...(noteCourses || [])].filter(Boolean))].sort();
    const semesters = [...new Set([...(paperSemesters || []), ...(noteSemesters || [])].filter(Boolean))].sort();
    const totalUploads = (paperCommunityStats.totalUploads || 0) + (noteCommunityStats.totalUploads || 0);

    res.json({
      university: universityName,
      stats: {
        totalPapers,
        totalNotes,
        totalUploads,
        totalDownloads: (paperCommunityStats.totalDownloads || 0) + (noteCommunityStats.totalDownloads || 0),
        totalVotes: (paperCommunityStats.totalVotes || 0) + (noteCommunityStats.totalVotes || 0),
        totalViews: (paperCommunityStats.totalViews || 0) + (noteCommunityStats.totalViews || 0),
        activeContributors: contributorIds.size,
      },
      topContributor,
      recentUploads: papers,
      pagination: {
        currentPage: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
        total,
      },
      filters: {
        departments: departments.sort(),
        courses: courses.sort(),
        semesters: semesters.sort(),
      },
    });
  } catch (error) {
    console.error('University community error:', error);
    res.status(500).json({ message: 'Server error fetching university community page' });
  }
});

export default router;
