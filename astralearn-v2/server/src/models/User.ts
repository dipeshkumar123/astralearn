import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserProfile, UserPreferences, UserStats } from '@astralearn/shared';

// User document interface
export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  bio?: string;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  timezone?: string;
  language: string;
  isEmailVerified: boolean;
  isActive: boolean;
  profileCompleteness: number;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  stats: UserStats;
  refreshTokens: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
  updateProfileCompleteness(): void;
  toProfileJSON(): UserProfile;
}

// User schema
const userSchema = new Schema<IUser>({
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
    lowercase: true,
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
  },
  avatar: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Avatar must be a valid URL',
    },
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true,
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  language: {
    type: String,
    default: 'en',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  profileCompleteness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  lastLoginAt: {
    type: Date,
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      courseUpdates: { type: Boolean, default: true },
      socialActivity: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
      },
      showProgress: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true },
    },
    learning: {
      autoplay: { type: Boolean, default: false },
      playbackSpeed: { type: Number, min: 0.5, max: 2, default: 1 },
      subtitles: { type: Boolean, default: false },
      darkMode: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false },
    },
  },
  stats: {
    coursesEnrolled: { type: Number, default: 0, min: 0 },
    coursesCompleted: { type: Number, default: 0, min: 0 },
    totalLearningTime: { type: Number, default: 0, min: 0 },
    streakDays: { type: Number, default: 0, min: 0 },
    totalPoints: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    badgesEarned: { type: Number, default: 0, min: 0 },
    achievementsUnlocked: { type: Number, default: 0, min: 0 },
    studyGroupsJoined: { type: Number, default: 0, min: 0 },
    helpfulAnswers: { type: Number, default: 0, min: 0 },
  },
  refreshTokens: [{
    type: String,
    select: false,
  }],
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ username: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.totalPoints': -1 });
userSchema.index({ 'stats.level': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update profile completeness
userSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updateProfileCompleteness();
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const verificationToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
  
  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return verificationToken;
};

// Instance method to update profile completeness
userSchema.methods.updateProfileCompleteness = function(): void {
  let completeness = 0;
  const fields = [
    'firstName', 'lastName', 'email', 'username', 'bio', 
    'avatar', 'learningStyle', 'timezone'
  ];
  
  fields.forEach(field => {
    if (this[field]) completeness += 12.5; // 100 / 8 fields
  });
  
  this.profileCompleteness = Math.round(completeness);
};

// Instance method to convert to profile JSON
userSchema.methods.toProfileJSON = function(): UserProfile {
  return {
    id: this._id.toString(),
    email: this.email,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    avatar: this.avatar,
    bio: this.bio,
    learningStyle: this.learningStyle,
    timezone: this.timezone,
    language: this.language,
    isEmailVerified: this.isEmailVerified,
    isActive: this.isActive,
    profileCompleteness: this.profileCompleteness,
    lastLoginAt: this.lastLoginAt?.toISOString(),
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

// Static methods interface
interface IUserModel extends Model<IUser> {
  findByEmailOrUsername(identifier: string): Promise<IUser | null>;
  findByResetToken(token: string): Promise<IUser | null>;
  findByVerificationToken(token: string): Promise<IUser | null>;
}

// Static methods
userSchema.statics.findByEmailOrUsername = function(identifier: string) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() }
    ],
    isActive: true
  }).select('+password');
};

userSchema.statics.findByResetToken = function(token: string) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
    isActive: true
  });
};

userSchema.statics.findByVerificationToken = function(token: string) {
  return this.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
    isActive: true
  });
};

// Create and export model
export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
