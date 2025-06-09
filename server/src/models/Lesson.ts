import mongoose, { Document, Schema } from 'mongoose';

export interface LessonDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  content: {
    type: 'text' | 'video' | 'interactive' | 'assignment';
    data: any;
    duration?: number; // in minutes
  };
  objectives: string[];
  position: number; // Order within module
  keyTopics: string[]; // For AI context
  contentSummary: string; // For AI context
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  resources: {
    type: 'link' | 'file' | 'reference';
    title: string;
    url?: string;
    fileId?: string;
  }[];
  aiContext: {
    learningGoals: string[];
    commonMisconceptions: string[];
    suggestedQuestions: string[];
    relatedConcepts: string[];
  };
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<LessonDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
    index: true,
  },
  content: {
    type: {
      type: String,
      enum: ['text', 'video', 'interactive', 'assignment'],
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    duration: {
      type: Number,
      min: 1,
    },
  },
  objectives: [{
    type: String,
    required: true,
    maxlength: 300,
  }],
  position: {
    type: Number,
    required: true,
    min: 1,
  },
  keyTopics: [{
    type: String,
    required: true,
    trim: true,
    index: true,
  }],
  contentSummary: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true,
  },
  prerequisites: [{
    type: String,
    maxlength: 200,
  }],
  resources: [{
    type: {
      type: String,
      enum: ['link', 'file', 'reference'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    url: String,
    fileId: String,
  }],
  aiContext: {
    learningGoals: [{
      type: String,
      maxlength: 200,
    }],
    commonMisconceptions: [{
      type: String,
      maxlength: 300,
    }],
    suggestedQuestions: [{
      type: String,
      maxlength: 200,
    }],
    relatedConcepts: [{
      type: String,
      maxlength: 100,
    }],
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance and context queries
lessonSchema.index({ courseId: 1, moduleId: 1, position: 1 });
lessonSchema.index({ keyTopics: 1, difficulty: 1 });
lessonSchema.index({ title: 'text', contentSummary: 'text', keyTopics: 'text' });

export const Lesson = mongoose.model<LessonDocument>('Lesson', lessonSchema);
