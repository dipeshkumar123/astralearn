import mongoose, { Schema } from 'mongoose';

/**
 * Lesson Schema
 * @module models/Lesson
 * @description Represents a lesson with content, objectives, resources, and AI context.
 * Arrays: objectives, keyTopics, prerequisites, resources, aiContext fields are not capped but should be paginated at the API/service layer if large.
 * Business logic: All business logic should be implemented in service/model methods, not in the schema definition.
 * Middleware: Add robust pre/post hooks for validation, notifications, etc. as needed.
 */
const lessonSchema = new Schema({
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
  /**
   * Custom toJSON transform to remove MongoDB internals and sensitive fields from API responses.
   * - Removes _id, __v
   * - Optionally remove or mask any sensitive fields here
   * @param {Document} doc
   * @param {Object} ret
   */
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Add additional sensitive field removals here if needed
      return ret;
    }
  }
});

// Indexes for performance and context queries
lessonSchema.index({ courseId: 1, moduleId: 1, position: 1 });
lessonSchema.index({ keyTopics: 1, difficulty: 1 });
lessonSchema.index({ title: 'text', contentSummary: 'text', keyTopics: 'text' });

export const Lesson = mongoose.model('Lesson', lessonSchema);
