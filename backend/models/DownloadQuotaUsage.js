import mongoose from 'mongoose';

const downloadQuotaUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateKey: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

downloadQuotaUsageSchema.index({ user: 1, dateKey: 1 }, { unique: true });

export default mongoose.model('DownloadQuotaUsage', downloadQuotaUsageSchema);
