import User from '../models/user.js';
import { syncContributorStatus } from './contributorStatusService.js';

const REPUTATION_POINTS = Object.freeze({
  UPLOAD_PAPER: 20,
  DOWNLOAD_GENERATED: 2,
  HELPFUL_VOTE: 5,
  TOP_CONTRIBUTOR_WEEK: 50,
});

const getWeekKey = (date = new Date()) => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const awardWeeklyTopContributorBonus = async (weekKey) => {
  const topContributor = await User.findOne({
    weeklyContributionWeek: weekKey,
    weeklyContributionScore: { $gt: 0 },
  })
    .sort({ weeklyContributionScore: -1, updatedAt: 1 })
    .select('_id');

  if (!topContributor) {
    return;
  }

  await User.updateOne(
    {
      _id: topContributor._id,
      lastTopContributorBonusWeek: { $ne: weekKey },
    },
    {
      $inc: { reputation: REPUTATION_POINTS.TOP_CONTRIBUTOR_WEEK },
      $set: {
        lastTopContributorBonusWeek: weekKey,
        weeklyTopContributorAwardedAt: new Date(),
      },
    }
  );

  await syncContributorStatus(topContributor._id);
};

const adjustUserReputation = async (userId, delta, options = {}) => {
  if (!userId || !delta) {
    return null;
  }

  const weekKey = getWeekKey();

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    [
      {
        $set: {
          weeklyContributionWeek: weekKey,
          reputation: {
            $max: [
              0,
              {
                $add: [{ $ifNull: ['$reputation', 0] }, delta],
              },
            ],
          },
          weeklyContributionScore: {
            $max: [
              0,
              {
                $add: [
                  {
                    $cond: [
                      { $eq: ['$weeklyContributionWeek', weekKey] },
                      { $ifNull: ['$weeklyContributionScore', 0] },
                      0,
                    ],
                  },
                  delta,
                ],
              },
            ],
          },
        },
      },
    ],
    { new: true }
  );

  if (options.awardWeeklyBonus !== false) {
    await awardWeeklyTopContributorBonus(weekKey);
  }

  await syncContributorStatus(userId);

  return updatedUser;
};

export {
  REPUTATION_POINTS,
  getWeekKey,
  adjustUserReputation,
  awardWeeklyTopContributorBonus,
};
