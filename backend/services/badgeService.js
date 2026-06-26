import User from '../models/user.js';
import Paper from '../models/paper.js';
import Note from '../models/Note.js';

const BADGE_DEFINITIONS = Object.freeze({
  first_upload: {
    key: 'first_upload',
    name: 'First Upload',
    description: 'Uploaded your first paper.',
  },
  contributor: {
    key: 'contributor',
    name: 'Contributor',
    description: 'Uploaded 10 papers.',
  },
  department_hero: {
    key: 'department_hero',
    name: 'Department Hero',
    description: 'Uploaded 50 papers.',
  },
  exam_saver: {
    key: 'exam_saver',
    name: 'Exam Saver',
    description: 'Generated 50 downloads.',
  },
  knowledge_king: {
    key: 'knowledge_king',
    name: 'Knowledge King',
    description: 'Earned 20 helpful votes.',
  },
  study_guide: {
    key: 'study_guide',
    name: 'Study Guide',
    description: 'Uploaded 3 quality study notes.',
  },
});

const getBadgeDetailsFromKeys = (badgeKeys = []) => (
  badgeKeys
    .map((key) => BADGE_DEFINITIONS[key])
    .filter(Boolean)
);

const evaluateAndGrantBadges = async (userId) => {
  if (!userId) {
    return [];
  }

  const user = await User.findById(userId).select('uploadCount badgeKeys');
  if (!user) {
    return [];
  }

  const [paperStats, noteStats] = await Promise.all([
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
          _id: '$uploader',
          uploads: { $sum: 1 },
          downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
          helpfulVotes: { $sum: { $ifNull: ['$helpfulVotes', 0] } },
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
          _id: '$uploader',
          uploads: { $sum: 1 },
          downloadsGenerated: { $sum: { $ifNull: ['$downloadCount', 0] } },
          helpfulVotes: { $sum: { $ifNull: ['$helpfulVotes', 0] } },
        },
      },
    ]),
  ]);

  const paperDownloads = paperStats[0]?.downloadsGenerated || 0;
  const paperVotes = paperStats[0]?.helpfulVotes || 0;
  const noteDownloads = noteStats[0]?.downloadsGenerated || 0;
  const noteVotes = noteStats[0]?.helpfulVotes || 0;
  const noteUploads = noteStats[0]?.uploads || 0;

  const downloadsGenerated = paperDownloads + noteDownloads;
  const helpfulVotes = paperVotes + noteVotes;
  const uploads = user.uploadCount || 0;

  const candidates = [];

  if (uploads >= 1) candidates.push('first_upload');
  if (uploads >= 10) candidates.push('contributor');
  if (uploads >= 50) candidates.push('department_hero');
  if (downloadsGenerated >= 50) candidates.push('exam_saver');
  if (helpfulVotes >= 20) candidates.push('knowledge_king');
  if (noteUploads >= 3) candidates.push('study_guide');

  const existing = new Set(user.badgeKeys || []);
  const toGrant = candidates.filter((key) => !existing.has(key));

  if (toGrant.length > 0) {
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { badgeKeys: { $each: toGrant } } }
    );
  }

  return toGrant;
};

export {
  BADGE_DEFINITIONS,
  getBadgeDetailsFromKeys,
  evaluateAndGrantBadges,
};
