import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  university: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: false,
    default: '',
  },
  batch: {
    type: String,
    required: false,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  bio: {
    type: String,
  },
  profilePicture: {
    type: String,
  },

  uploadCount: { // Added for leaderboard
    type: Number,
    default: 0,
  },
  reputation: {
    type: Number,
    default: 0,
    min: 0,
  },
  weeklyContributionScore: {
    type: Number,
    default: 0,
    min: 0,
  },
  weeklyContributionWeek: {
    type: String,
    default: '',
  },
  lastTopContributorBonusWeek: {
    type: String,
    default: '',
  },
  weeklyTopContributorAwardedAt: {
    type: Date,
  },
  badgeKeys: [{
    type: String,
  }],
  contributorStatus: {
    type: String,
    enum: ['Student', 'Contributor', 'Verified Contributor', 'Top Scholar', 'Campus Ambassador'],
    default: 'Student',
  },
  // Campus Ambassador Program (Feature 13)
  isCampusAmbassador: {
    type: Boolean,
    default: false,
  },
  ambassadorUniversity: {
    type: String,
    default: '',
  },
  ambassadorAssignedAt: {
    type: Date,
  },
  // Referral System (Feature 14)
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  referralBonusAwarded: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.models.User || mongoose.model('User', UserSchema);