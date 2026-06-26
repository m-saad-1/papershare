import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  paper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper',
    default: null,
  },
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    default: null,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    enum: ['incorrect_content', 'duplicate', 'copyright', 'broken_file', 'spam', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'rejected'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  action: {
    type: String,
    enum: ['none', 'paper_removed', 'note_removed', 'uploader_warned', 'duplicate_marked'],
    default: 'none',
  },
}, {
  timestamps: true,
});

ReportSchema.pre('validate', function validateTarget(next) {
  if (!this.paper && !this.note) {
    return next(new Error('A report must target a paper or a note'));
  }

  if (this.paper && this.note) {
    return next(new Error('A report cannot target both a paper and a note'));
  }

  return next();
});

// Index for faster query on pending reports
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index(
  { paper: 1, reporter: 1 },
  { unique: true, partialFilterExpression: { paper: { $exists: true, $type: 'objectId' } } }
);
ReportSchema.index(
  { note: 1, reporter: 1 },
  { unique: true, partialFilterExpression: { note: { $exists: true, $type: 'objectId' } } }
);

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
