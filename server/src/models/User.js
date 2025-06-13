import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student',
    index: true,
  },  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
    required: false,
  },
  learningStyleAssessment: {
    lastAssessmentDate: {
      type: Date,
    },
    assessmentAnswers: [{
      questionId: String,
      answer: String,
      weight: Number
    }],
    scores: {
      visual: { type: Number, default: 0 },
      auditory: { type: Number, default: 0 },
      kinesthetic: { type: Number, default: 0 },
      reading: { type: Number, default: 0 }
    },
    confidence: { type: Number, default: 0 } // 0-100 confidence score
  },
  learningPreferences: {
    preferredDifficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    studyTimePreference: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'late-night'],
    },
    sessionDuration: {
      type: Number, // minutes
      default: 30,
      min: 15,
      max: 240
    },
    reminderSettings: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['daily', 'alternate', 'weekly'],
        default: 'daily'
      },
      time: { type: String } // HH:MM format
    },
    contentPreferences: {
      includeVideos: { type: Boolean, default: true },
      includeText: { type: Boolean, default: true },
      includeInteractive: { type: Boolean, default: true },
      includeQuizzes: { type: Boolean, default: true }
    }
  },
  profileCompleteness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  refreshTokens: [{
    type: String,
  }],
  lastLoginAt: {
    type: Date,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1, username: 1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ learningStyle: 1 });
userSchema.index({ 'learningPreferences.preferredDifficulty': 1 });
userSchema.index({ profileCompleteness: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate profile completeness
userSchema.pre('save', function(next) {
  // Only recalculate if relevant fields have been modified
  if (this.isModified('learningStyle') || 
      this.isModified('learningPreferences') || 
      this.isModified('learningStyleAssessment') ||
      this.isNew) {
    this.calculateProfileCompleteness();
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
  let completeness = 0;
  const weights = {
    basicInfo: 30, // firstName, lastName, email (required fields)
    learningStyle: 20,
    learningPreferences: 30,
    assessmentCompleted: 20
  };

  // Basic info is always complete (required fields)
  completeness += weights.basicInfo;

  // Learning style
  if (this.learningStyle) {
    completeness += weights.learningStyle;
  }

  // Learning preferences
  if (this.learningPreferences && 
      this.learningPreferences.preferredDifficulty &&
      this.learningPreferences.sessionDuration) {
    completeness += weights.learningPreferences;
  }

  // Assessment completed
  if (this.learningStyleAssessment && 
      this.learningStyleAssessment.lastAssessmentDate) {
    completeness += weights.assessmentCompleted;
  }

  this.profileCompleteness = Math.round(completeness);
  return this.profileCompleteness;
};

// Method to update learning style from assessment
userSchema.methods.updateLearningStyleFromAssessment = function() {
  if (!this.learningStyleAssessment || !this.learningStyleAssessment.scores) {
    return;
  }

  const scores = this.learningStyleAssessment.scores;
  const maxScore = Math.max(scores.visual, scores.auditory, scores.kinesthetic, scores.reading);
  
  if (maxScore > 0) {
    // Find the learning style with the highest score
    const styles = ['visual', 'auditory', 'kinesthetic', 'reading'];
    this.learningStyle = styles.find(style => scores[style] === maxScore);
    
    // Calculate confidence based on how much higher the top score is
    const otherScores = styles.filter(s => s !== this.learningStyle).map(s => scores[s]);
    const avgOtherScores = otherScores.reduce((a, b) => a + b, 0) / otherScores.length;
    this.learningStyleAssessment.confidence = Math.round(((maxScore - avgOtherScores) / maxScore) * 100);
  }
};

// Method to generate auth tokens
userSchema.methods.generateAuthTokens = async function() {
  const { default: JWTManager } = await import('../utils/jwt.js');
  const jwtManager = JWTManager.getInstance();
  return jwtManager.generateAuthTokens(this);
};

// Static method to find user by email or username
userSchema.statics.findByCredentials = async function(identifier) {
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
  
  return user;
};

export const User = mongoose.model('User', userSchema);
