import DownloadQuotaUsage from '../models/DownloadQuotaUsage.js';

const getDailyDownloadLimit = (uploadCount = 0) => {
  if (uploadCount >= 5) {
    return null; // Unlimited
  }

  if (uploadCount >= 1) {
    return 5;
  }

  return 3;
};

const getDateKeyUtc = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const enforceDownloadQuota = async (req, res, next) => {
  try {
    const uploadCount = req.user?.uploadCount || 0;
    const limit = getDailyDownloadLimit(uploadCount);

    if (limit === null) {
      req.downloadQuota = {
        isUnlimited: true,
        dailyLimit: null,
        usedToday: null,
        remainingToday: null,
      };
      return next();
    }

    const dateKey = getDateKeyUtc();

    let usage;
    try {
      usage = await DownloadQuotaUsage.findOneAndUpdate(
        {
          user: req.user._id,
          dateKey,
          count: { $lt: limit },
        },
        {
          $inc: { count: 1 },
          $setOnInsert: {
            user: req.user._id,
            dateKey,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    } catch (error) {
      if (error?.code === 11000) {
        usage = null;
      } else {
        throw error;
      }
    }

    if (!usage) {
      const todayUsage = await DownloadQuotaUsage.findOne({ user: req.user._id, dateKey }).select('count');
      const usedToday = todayUsage?.count || limit;
      return res.status(403).json({
        message: 'Daily download limit reached. Upload papers to unlock higher limits.',
        downloadQuota: {
          isUnlimited: false,
          dailyLimit: limit,
          usedToday,
          remainingToday: Math.max(0, limit - usedToday),
        },
      });
    }

    req.downloadQuota = {
      isUnlimited: false,
      dailyLimit: limit,
      usedToday: usage.count,
      remainingToday: Math.max(0, limit - usage.count),
    };

    return next();
  } catch (error) {
    console.error('Download quota middleware error:', error);
    return res.status(500).json({ message: 'Server error checking download quota' });
  }
};

export { enforceDownloadQuota, getDailyDownloadLimit };
