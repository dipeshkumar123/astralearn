import mongoose, { Document, Schema } from 'mongoose';

export interface UserProgressDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  progressType: 'enrollment' | 'lesson_start' | 'lesson_complete' | 'quiz_attempt' | 'course_complete';
  progressData: {
    score?: number;
    timeSpent?: number; // in minutes
    attempts?: number;
    completionPercentage?: number;
    notes?: string;
  };
  timestamp: Date;
  createdAt: Date;
}

const userProgressSchema = new Schema<UserProgressDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    index: true,
  },
  progressType: {
    type: String,
    enum: ['enrollment', 'lesson_start', 'lesson_complete', 'quiz_attempt', 'course_complete'],
    required: true,
    index: true,
  },
  progressData: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      min: 0,
    },
    attempts: {
      type: Number,
      min: 1,
      default: 1,
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for analytics queries
userProgressSchema.index({ userId: 1, courseId: 1, timestamp: -1 });
userProgressSchema.index({ userId: 1, progressType: 1, timestamp: -1 });
userProgressSchema.index({ courseId: 1, progressType: 1, timestamp: -1 });

// Static method to get user's recent activity for AI context
userProgressSchema.statics.getRecentActivity = async function(userId: string, limit: number = 10) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('courseId', 'title')
    .populate('lessonId', 'title');
};

export const UserProgress = mongoose.model<UserProgressDocument>('UserProgress', userProgressSchema);
