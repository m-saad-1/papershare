import mongoose from 'mongoose';

const FacultyTakedownSchema = new mongoose.Schema({
  paper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  facultyEmail: {
    type: String,
    required: true,
    match: [/.+@.+/, 'Please provide a valid faculty email'],
  },
  facultyName: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    enum: ['copyright_violation', 'unauthorized_use', 'academic_honesty', 'licensing_violation', 'other'],
    required: true,
  },
  reasonDescription: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
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
  paperTemporarilyHidden: {
    type: Boolean,
    default: false,
  },
  hiddenUntil: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.FacultyTakedown || 
  mongoose.model('FacultyTakedown', FacultyTakedownSchema);
