import Paper from '../models/paper.js';
import User from '../models/user.js';
import Certificate from '../models/Certificate.js';

// Get current semester (Spring: Jan-May, Fall: Aug-Dec)
export function getCurrentSemester() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  if (month >= 1 && month <= 5) {
    return { semester: 'Spring', year };
  } else if (month >= 8 && month <= 12) {
    return { semester: 'Fall', year };
  }
  return { semester: 'Summer', year };
}

// Issue certificates at semester end
export async function issueSemesterCertificates() {
  try {
    const { semester, year } = getCurrentSemester();
    const semesterKey = `${semester} ${year}`;

    // Get top contributors for this semester
    const now = new Date();
    const semesterStart = getSemesterStartDate(semester, year);
    const semesterEnd = getSemesterEndDate(semester, year);

    const topContributors = await Paper.aggregate([
      {
        $match: {
          createdAt: { $gte: semesterStart, $lte: semesterEnd },
          status: 'approved',
          visibility: 'public',
        },
      },
      {
        $group: {
          _id: '$uploader',
          papersUploaded: { $sum: 1 },
          totalDownloads: { $sum: { $ifNull: ['$downloadCount', 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          papersUploaded: 1,
          totalDownloads: 1,
          reputation: '$user.reputation',
          university: '$user.university',
          username: '$user.username',
        },
      },
      {
        $sort: { totalDownloads: -1, papersUploaded: -1, reputation: -1 },
      },
      { $limit: 100 }, // Top 100 contributors
    ]);

    const certificates = [];

    for (let i = 0; i < topContributors.length; i++) {
      const contributor = topContributors[i];

      // Determine certificate type based on rank
      let certificateType = 'emerging_contributor';
      if (i < 10) certificateType = 'top_contributor';
      else if (i < 50) certificateType = 'active_contributor';

      // Get universities reached metric
      const universitiesReached = await Paper.distinct('university', {
        uploader: contributor._id,
        createdAt: { $gte: semesterStart, $lte: semesterEnd },
        status: 'approved',
        visibility: 'public',
      }).then((unis) => unis.length);

      // Create/update certificate
      const existingCert = await Certificate.findOne({
        user: contributor._id,
        semester: semesterKey.split(' ')[0],
        year: parseInt(semesterKey.split(' ')[1]),
      });

      if (!existingCert) {
        const certificate = new Certificate({
          user: contributor._id,
          semester: semesterKey.split(' ')[0],
          year: parseInt(semesterKey.split(' ')[1]),
          certificateType,
          rank: i + 1,
          contributorStats: {
            papersUploaded: contributor.papersUploaded,
            totalDownloads: contributor.totalDownloads,
            reputation: contributor.reputation,
            universitiesReached,
          },
        });
        await certificate.save();
        certificates.push(certificate);
      }
    }

    return certificates;
  } catch (error) {
    console.error('Issue certificates error:', error);
    throw error;
  }
}

function getSemesterStartDate(semester, year) {
  if (semester === 'Spring') return new Date(year, 0, 1); // Jan 1
  if (semester === 'Summer') return new Date(year, 5, 1); // Jun 1
  if (semester === 'Fall') return new Date(year, 7, 1); // Aug 1
}

function getSemesterEndDate(semester, year) {
  if (semester === 'Spring') return new Date(year, 4, 31); // May 31
  if (semester === 'Summer') return new Date(year, 6, 31); // Jul 31
  if (semester === 'Fall') return new Date(year, 11, 31); // Dec 31
}

// Generate certificate details for display
export function getCertificateDisplayInfo(certificate) {
  const typeLabels = {
    top_contributor: 'Top Contributor',
    active_contributor: 'Active Contributor',
    emerging_contributor: 'Emerging Contributor',
  };

  return {
    title: typeLabels[certificate.certificateType],
    subtitle: `${certificate.semester} ${certificate.year}`,
    rank: certificate.rank,
    stats: certificate.contributorStats,
  };
}
