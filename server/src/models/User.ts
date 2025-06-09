import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser } from '@shared/types/index.js';

// Extend the interface to include Mongoose Document methods
export interface UserDocument extends Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>, Document {
  _id: mongoose.Types.ObjectId;
  password: string;
  refreshTokens: string[];
  lastLoginAt?: Date;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthTokens(): { accessToken: string; refreshToken: string };
}

const userSchema = new Schema<UserDocument>({
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
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
    required: false,
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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth tokens
userSchema.methods.generateAuthTokens = function() {
  const JWTManager = require('../utils/jwt.js').default;
  const jwtManager = JWTManager.getInstance();
  return jwtManager.generateAuthTokens(this);
};

// Static method to find user by email or username
userSchema.statics.findByCredentials = async function(identifier: string) {
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  }).select('+password');
  
  return user;
};

export const User = mongoose.model<UserDocument>('User', userSchema);
