import User from '../models/user.js';
import crypto from 'crypto';
import { syncContributorStatus } from './contributorStatusService.js';

// Generate unique referral code
export function generateReferralCode(username) {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const usernamePart = username.substring(0, 4).toUpperCase();
  return `${usernamePart}${randomPart}`;
}

// Award referral bonuses when referred user uploads first paper
export async function awardReferralBonus(referredUserId) {
  try {
    const referredUser = await User.findById(referredUserId);
    
    if (!referredUser || !referredUser.referredBy || referredUser.referralBonusAwarded) {
      return null;
    }

    const referrer = await User.findById(referredUser.referredBy);
    if (!referrer) {
      return null;
    }

    const REFERRAL_BONUS = 20; // Both users get 20 reputation points

    // Award bonus to both users
    await Promise.all([
      User.findByIdAndUpdate(referrer._id, {
        $inc: { reputation: REFERRAL_BONUS },
      }),
      User.findByIdAndUpdate(referredUser._id, {
        $inc: { reputation: REFERRAL_BONUS },
        $set: { referralBonusAwarded: true },
      }),
    ]);

    await Promise.all([
      syncContributorStatus(referrer._id),
      syncContributorStatus(referredUser._id),
    ]);

    return {
      referrer: referrer.username,
      referred: referredUser.username,
      bonusAwarded: REFERRAL_BONUS,
    };
  } catch (error) {
    console.error('Referral bonus error:', error);
    return null;
  }
}

// Validate referral code and link users
export async function processReferral(newUserId, referralCode) {
  try {
    if (!referralCode) return null;

    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer || referrer._id.toString() === newUserId.toString()) {
      return null; // Invalid code or self-referral
    }

    // Link referred user to referrer
    await Promise.all([
      User.findByIdAndUpdate(newUserId, {
        $set: { referredBy: referrer._id },
      }),
      User.findByIdAndUpdate(referrer._id, {
        $push: { referrals: newUserId },
      }),
    ]);

    return { success: true, referrerUsername: referrer.username };
  } catch (error) {
    console.error('Process referral error:', error);
    return null;
  }
}
