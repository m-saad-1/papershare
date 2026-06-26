import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  semester: {
    type: String, // e.g., "Spring 2026", "Fall 2025"
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  certificateType: {
    type: String,
    enum: ['top_contributor', 'active_contributor', 'emerging_contributor'],
    required: true,
  },
  rank: {
    type: Number, // Ranking in the semester (1st, 2nd, 3rd, etc.)
    required: true,
  },
  contributorStats: {
    papersUploaded: {
      type: Number,
      required: true,
    },
    totalDownloads: {
      type: Number,
      required: true,
    },
    reputation: {
      type: Number,
      required: true,
    },
    universitiesReached: {
      type: Number,
      required: true,
    },
  },
  certificateUrl: {
    type: String, // URL to generated certificate (could be PDF)
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
});

CertificateSchema.index({ user: 1, semester: 1, year: 1 }, { unique: true });

export default mongoose.models.Certificate || 
  mongoose.model('Certificate', CertificateSchema);
