import User from '../models/user.js';

const CONTRIBUTOR_STATUS_ORDER = [
  'Student',
  'Contributor',
  'Verified Contributor',
  'Top Scholar',
  'Campus Ambassador',
];

const getContributorStatus = ({ reputation = 0, uploadCount = 0 }) => {
  if (uploadCount >= 60 && reputation >= 1200) {
    return 'Campus Ambassador';
  }

  if (uploadCount >= 30 && reputation >= 600) {
    return 'Top Scholar';
  }

  if (uploadCount >= 10 && reputation >= 200) {
    return 'Verified Contributor';
  }

  if (uploadCount >= 1 || reputation >= 50) {
    return 'Contributor';
  }

  return 'Student';
};

const syncContributorStatus = async (userId) => {
  if (!userId) {
    return null;
  }

  const user = await User.findById(userId).select('reputation uploadCount contributorStatus');
  if (!user) {
    return null;
  }

  const nextStatus = getContributorStatus({
    reputation: user.reputation || 0,
    uploadCount: user.uploadCount || 0,
  });

  if (user.contributorStatus !== nextStatus) {
    user.contributorStatus = nextStatus;
    await user.save();
  }

  return nextStatus;
};

export {
  CONTRIBUTOR_STATUS_ORDER,
  getContributorStatus,
  syncContributorStatus,
};
