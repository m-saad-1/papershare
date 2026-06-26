import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper',
    required: true,
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
});

downloadSchema.index({ user: 1, paper: 1 }, { unique: true });

export default mongoose.model('Download', downloadSchema);
