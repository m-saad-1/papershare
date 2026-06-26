import PaperRequest from '../models/PaperRequest.js';
import { adjustUserReputation } from './reputationService.js';

const REQUEST_FULFILL_BONUS = 15;

const fulfillMatchingPaperRequests = async (paper) => {
  if (!paper) {
    return { fulfilledCount: linkedFulfilledCount };
  }

  let linkedFulfilledCount = 0;
  const linkedRequestId = paper.linkedRequest?.request;
  if (linkedRequestId) {
    const linkedResult = await PaperRequest.updateOne(
      { _id: linkedRequestId, status: 'open' },
      {
        $set: {
          status: 'fulfilled',
          fulfilledByPaper: paper._id,
          fulfilledByUser: paper.uploader,
          fulfilledAt: new Date(),
        },
      }
    );

    linkedFulfilledCount = linkedResult.modifiedCount || 0;
  }

  const matches = await PaperRequest.find({
    status: 'open',
    university: new RegExp(`^${paper.university}$`, 'i'),
    department: new RegExp(`^${paper.department}$`, 'i'),
    courseName: new RegExp(`^${paper.course}$`, 'i'),
    examType: paper.paperType,
    year: paper.year,
    ...(linkedRequestId ? { _id: { $ne: linkedRequestId } } : {}),
  }).select('_id');

  if (matches.length === 0) {
    if (linkedFulfilledCount > 0) {
      await adjustUserReputation(
        paper.uploader,
        linkedFulfilledCount * REQUEST_FULFILL_BONUS
      );
    }

    return { fulfilledCount: 0 };
  }

  const ids = matches.map((request) => request._id);

  const result = await PaperRequest.updateMany(
    { _id: { $in: ids }, status: 'open' },
    {
      $set: {
        status: 'fulfilled',
        fulfilledByPaper: paper._id,
        fulfilledByUser: paper.uploader,
        fulfilledAt: new Date(),
      },
    }
  );

  const fulfilledCount = (result.modifiedCount || 0) + linkedFulfilledCount;

  if (fulfilledCount > 0) {
    await adjustUserReputation(
      paper.uploader,
      fulfilledCount * REQUEST_FULFILL_BONUS
    );
  }

  return { fulfilledCount };
};

export {
  REQUEST_FULFILL_BONUS,
  fulfillMatchingPaperRequests,
};
