import mongoose from 'mongoose';

const paperRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1500,
  },
  university: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  courseCode: {
    type: String,
    trim: true,
  },
  teacher: {
    type: String,
    trim: true,
  },
  semester: {
    type: String,
    trim: true,
  },
  examType: {
    type: String,
    enum: ['mid', 'final', 'quiz', 'assignment'],
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
  status: {
    type: String,
    enum: ['open', 'fulfilled'],
    default: 'open',
  },
  fulfilledByPaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paper',
  },
  fulfilledByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  fulfilledAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

paperRequestSchema.index({ university: 1, department: 1, courseName: 1, examType: 1, year: 1, status: 1 });

export default mongoose.model('PaperRequest', paperRequestSchema);
