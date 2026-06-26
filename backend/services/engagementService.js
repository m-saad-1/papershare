import Notification from '../models/Notification.js';

const EXAM_SEASON_MONTHS = [4, 5, 10, 11]; // Apr/May and Oct/Nov
const EXAM_SEASON_UPLOAD_MULTIPLIER = 2;

const isExamSeason = (date = new Date()) => {
  const month = date.getMonth() + 1;
  return EXAM_SEASON_MONTHS.includes(month);
};

const getUploadPointsMultiplier = (date = new Date()) => {
  return isExamSeason(date) ? EXAM_SEASON_UPLOAD_MULTIPLIER : 1;
};

const maybeCreateExamSeasonReminder = async (userId) => {
  if (!userId || !isExamSeason()) {
    return null;
  }

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const existing = await Notification.findOne({
    user: userId,
    type: 'exam_season_upload_reminder',
    createdAt: { $gte: weekAgo },
  }).select('_id');

  if (existing) {
    return existing;
  }

  return Notification.create({
    user: userId,
    type: 'exam_season_upload_reminder',
    title: 'Exam Season Boost Active',
    message: 'Upload papers this week to earn double reputation points.',
    metadata: {
      multiplier: EXAM_SEASON_UPLOAD_MULTIPLIER,
      seasonMonths: EXAM_SEASON_MONTHS,
    },
  });
};

export {
  EXAM_SEASON_MONTHS,
  EXAM_SEASON_UPLOAD_MULTIPLIER,
  isExamSeason,
  getUploadPointsMultiplier,
  maybeCreateExamSeasonReminder,
};
