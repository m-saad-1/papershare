import Paper from '../models/paper.js';

// Calculate trending score based on recent activity
// Formula: (downloads * 2 + views + helpfulVotes * 5) / daysOld^1.5
export function calculateTrendingScore(paper, currentDate = new Date()) {
  const daysOld = Math.max(1, (currentDate - new Date(paper.createdAt)) / (1000 * 60 * 60 * 24));
  const downloads = paper.downloadCount || 0;
  const views = paper.views || 0;
  const votes = paper.helpfulVotes || 0;

  const rawScore = (downloads * 2) + views + (votes * 5);
  const trendingScore = rawScore / Math.pow(daysOld, 1.5);

  return trendingScore;
}

// Get trending papers within time window (default 30 days)
export async function getTrendingPapers(options = {}) {
  try {
    const {
      limit = 10,
      daysWindow = 30,
      university,
      department,
      minScore = 0.5, // Minimum trending score threshold
    } = options;

    const windowDate = new Date();
    windowDate.setDate(windowDate.getDate() - daysWindow);

    const filter = {
      status: 'approved',
      visibility: 'public',
      createdAt: { $gte: windowDate },
      $or: [
        { downloadCount: { $gte: 1 } },
        { views: { $gte: 3 } },
        { helpfulVotes: { $gte: 1 } },
      ],
    };

    if (university) {
      filter.university = new RegExp(`^${university}$`, 'i');
    }
    if (department) {
      filter.department = new RegExp(department, 'i');
    }

    const papers = await Paper.find(filter)
      .populate('uploader', 'username profilePicture reputation contributorStatus badgeKeys isCampusAmbassador')
      .select('title course courseCode semester year paperType department university downloadCount views helpfulVotes createdAt uploader')
      .lean();

    // Calculate trending score for each paper
    const currentDate = new Date();
    const papersWithScores = papers.map((paper) => ({
      ...paper,
      trendingScore: calculateTrendingScore(paper, currentDate),
    }));

    // Filter by minimum score and sort
    const trending = papersWithScores
      .filter((p) => p.trendingScore >= minScore)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    return trending;
  } catch (error) {
    console.error('Get trending papers error:', error);
    throw error;
  }
}

// Get popular papers (all-time based on downloads + votes)
export async function getPopularPapers(options = {}) {
  try {
    const {
      limit = 10,
      university,
      department,
    } = options;

    const filter = {
      status: 'approved',
      visibility: 'public',
    };

    if (university) {
      filter.university = new RegExp(`^${university}$`, 'i');
    }
    if (department) {
      filter.department = new RegExp(department, 'i');
    }

    const papers = await Paper.find(filter)
      .sort({ downloadCount: -1, helpfulVotes: -1 })
      .limit(limit)
      .populate('uploader', 'username profilePicture reputation contributorStatus badgeKeys isCampusAmbassador')
      .select('title course courseCode semester year paperType department university downloadCount views helpfulVotes createdAt uploader')
      .lean();

    return papers;
  } catch (error) {
    console.error('Get popular papers error:', error);
    throw error;
  }
}
