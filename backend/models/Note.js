import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  university: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    trim: true,
  },
  semester: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  file: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
  },
  helpfulVotes: {
    type: Number,
    default: 0,
  },
  votedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvalRewardGranted: {
    type: Boolean,
    default: false,
  },
});

noteSchema.index({
  title: 'text',
  description: 'text',
  course: 'text',
  tags: 'text',
});

noteSchema.index({ university: 1, department: 1, course: 1, semester: 1, year: 1 });

export default mongoose.model('Note', noteSchema);
