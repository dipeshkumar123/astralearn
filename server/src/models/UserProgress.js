import mongoose, { Schema } from 'mongoose';
// Sub-schema for progressData
const progressDataSchema = new Schema({
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
}, { _id: false });

// Main UserProgress schema
/**
 * UserProgress Schema
 * @module models/UserProgress
 * @description Tracks a user's progress in courses and lessons, including quiz attempts and completions.
 * - progressData: Stores granular details about a user's attempt (score, time, notes, etc.).
 * - If more fields are needed, add sub-schemas for modularity.
 * Arrays: No unbounded arrays in main schema; subdocuments may contain arrays but should be paginated if large.
 * Business logic: All business logic should be implemented in service/model methods, not in the schema definition.
 * Middleware: Add robust pre/post hooks for validation, analytics, etc. as needed.
 */
const userProgressSchema = new Schema({
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
  /**
   * progressData: Sub-document for attempt details (score, timeSpent, attempts, completionPercentage, notes).
   * Extend with more fields or sub-schemas as needed for richer analytics.
   */
  progressData: progressDataSchema,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  /**
   * Custom toJSON transform to remove MongoDB internals and sensitive fields from API responses.
   * - Removes _id, __v
   * - Optionally remove or mask any sensitive fields here
   * @param {Document} doc
   * @param {Object} ret
   */
  toJSON: {
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      // Add additional sensitive field removals here if needed
      return ret;
    }
  }
});

// If more fields are needed in the future, create additional sub-schemas and modularize here.

/**
 * Compound indexes for analytics queries:
 * - userId+courseId+timestamp: Recent progress in a course
 * - userId+progressType+timestamp: Recent activity by type
 * - courseId+progressType+timestamp: Course-wide analytics by type
 */

// Compound indexes for analytics queries
userProgressSchema.index({ userId: 1, courseId: 1, timestamp: -1 });
userProgressSchema.index({ userId: 1, progressType: 1, timestamp: -1 });
userProgressSchema.index({ courseId: 1, progressType: 1, timestamp: -1 });


/**
 * Virtual/Static: totalEstimatedDuration
 * Aggregates the total estimated duration of all lessons completed by the user in a course.
 *
 * This uses a MongoDB aggregation pipeline:
 *   1. Match UserProgress docs for the user, course, and 'lesson_complete' type.
 *   2. $lookup to join with the lessons collection on lessonId.
 *   3. $unwind the lesson array.
 *   4. $group and sum the lesson.estimatedDuration field.
 *
 * For performance, consider caching this value or using a denormalized field if needed at scale.
 *
 * Example usage:
 *   const total = await UserProgress.totalEstimatedDuration(userId, courseId);
 */

// Static method to get user's recent activity for AI context

/**
 * Static: getRecentActivity
 * Returns the most recent UserProgress records for a user, populated with course and lesson titles.
 * Used for AI context, dashboards, and activity feeds.
 * @param {ObjectId} userId - The user's ObjectId
 * @param {number} limit - Max number of records to return (default 10)
 */
userProgressSchema.statics.getRecentActivity = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('courseId', 'title')
    .populate('lessonId', 'title');
};

/**
 * Aggregates the total estimated duration of all lessons completed by the user in a course.
 * @param {ObjectId} userId - The user's ObjectId
 * @param {ObjectId} courseId - The course's ObjectId
 * @returns {Promise<number>} Total estimated duration in minutes
 *
 * Example usage:
 *   const total = await UserProgress.totalEstimatedDuration(userId, courseId);
 */

/**
 * Static: totalEstimatedDuration
 * Aggregates the total estimated duration of all lessons completed by the user in a course.
 * @param {ObjectId} userId - The user's ObjectId
 * @param {ObjectId} courseId - The course's ObjectId
 * @returns {Promise<number>} Total estimated duration in minutes
 */
userProgressSchema.statics.totalEstimatedDuration = async function(userId, courseId) {
  const result = await this.aggregate([
    { $match: { userId, courseId, progressType: 'lesson_complete' } },
    { $lookup: {
        from: 'lessons',
        localField: 'lessonId',
        foreignField: '_id',
        as: 'lesson'
    }},
    { $unwind: '$lesson' },
    { $group: { _id: null, total: { $sum: '$lesson.estimatedDuration' } } }
  ]);
  return result[0]?.total || 0;
};

export const UserProgress = mongoose.model('UserProgress', userProgressSchema);
