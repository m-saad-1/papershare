import Paper from '../models/paper.js';
import User from '../models/user.js';
import { REPUTATION_POINTS, adjustUserReputation } from './reputationService.js';
import { evaluateAndGrantBadges } from './badgeService.js';
import { syncContributorStatus } from './contributorStatusService.js';
import { fulfillMatchingPaperRequests } from './paperRequestService.js';
import { awardReferralBonus } from './referralService.js';
import { getUploadPointsMultiplier, isExamSeason } from './engagementService.js';

const awardApprovalRewards = async ({ content, contentType }) => {
  if (!content?.uploader || content.approvalRewardGranted) {
    return {
      awarded: false,
      uploadReputationAward: 0,
      examSeasonBoostApplied: false,
      fulfilledRequests: 0,
      referralBonusAwarded: null,
    };
  }

  const uploadPointsMultiplier = contentType === 'paper' ? getUploadPointsMultiplier() : 1;
  const uploadReputationAward = REPUTATION_POINTS.UPLOAD_PAPER * uploadPointsMultiplier;

  await User.findByIdAndUpdate(content.uploader, { $inc: { uploadCount: 1 } });
  await adjustUserReputation(content.uploader, uploadReputationAward);

  let fulfilledRequests = 0;
  let referralBonusAwarded = null;

  if (contentType === 'paper') {
    const approvedPaperCount = await Paper.countDocuments({
      uploader: content.uploader,
      status: 'approved',
    });

    if (approvedPaperCount === 1) {
      referralBonusAwarded = await awardReferralBonus(content.uploader);
    }

    const fulfillResult = await fulfillMatchingPaperRequests(content);
    fulfilledRequests = fulfillResult.fulfilledCount || 0;
  }

  content.approvalRewardGranted = true;
  await content.save();

  await evaluateAndGrantBadges(content.uploader);
  await syncContributorStatus(content.uploader);

  return {
    awarded: true,
    uploadReputationAward,
    examSeasonBoostApplied: contentType === 'paper' ? isExamSeason() : false,
    fulfilledRequests,
    referralBonusAwarded,
  };
};

export {
  awardApprovalRewards,
};