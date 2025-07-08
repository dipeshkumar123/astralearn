import mongoose, { Schema } from 'mongoose';

/**
 * Course Schema
 * @module models/Course
 * @description Represents a course with modules, objectives, metadata, and related fields.
 *
 * Arrays: modules, objectives, tags, prerequisites, metadata fields are not capped but should be paginated at the API/service layer if large.
 * Business logic: All business logic should be implemented in service/model methods, not in the schema definition.
 * Middleware: Add robust pre/post hooks for validation, notifications, etc. as needed.
 */
const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
  },  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  modules: [{
    type: Schema.Types.ObjectId,
    ref: 'Module',
  }],
  objectives: [{
    type: String,
    required: true,
    maxlength: 500,
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true,
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1,
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    index: true,
  }],
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  thumbnail: {
    type: String,
  },
  prerequisites: [{
    type: String,
    maxlength: 200,
  }],
  metadata: {
    targetAudience: [{
      type: String,
    }],
    skillsGained: [{
      type: String,
    }],
    assessmentTypes: [{
      type: String,
      enum: ['quiz', 'assignment', 'project', 'exam', 'discussion'],
    }],
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

// Indexes for performance and search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ instructor: 1, createdAt: -1 });
courseSchema.index({ isPublished: 1, difficulty: 1 });
courseSchema.index({ tags: 1, difficulty: 1 });

// Virtual field for lessons
courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'courseId',
});

// Ensure virtual fields are included in JSON output
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

export const Course = mongoose.model('Course', courseSchema);
