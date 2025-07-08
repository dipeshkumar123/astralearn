// filepath: c:\Users\panji\OneDrive\Desktop\Sem 7\Projects\AstraLearn\server\src\models\Module.js
import mongoose, { Schema } from 'mongoose';

/**
 * Module Schema
 */
const moduleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  position: {
    type: Number,
    required: true,
    min: 1,
  },
  objectives: [{
    type: String,
    required: true,
    maxlength: 300,
  }],
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1,
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
  learningOutcomes: [{
    type: String,
    required: true,
    maxlength: 300,
  }],
  metadata: {
    tags: [{
      type: String,
      trim: true,
      index: true,
    }],
    category: {
      type: String,
      trim: true,
      index: true,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },

  /**
   * content: Main instructional content for the module.
   */
  content: {
    introduction: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    keyTopics: [{
      type: String,
      required: true,
      trim: true,
      index: true,
    }],
    // data: Optional extensible content blocks (e.g., for AI, quizzes, media)
    data: {
      type: Schema.Types.Mixed,
      required: false,
      default: undefined,
      /*
        Example shape:
        [
          { type: 'video', url: '...' },
          { type: 'quiz', questions: [...] },
          { type: 'ai', generatedSummary: '...' }
        ]
      */
    },
  },
  resources: [{
    type: {
      type: String,
      enum: ['link', 'file', 'reference', 'video', 'document'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
  }],
  /**
   * aiContext: Stores AI-generated and instructor-curated pedagogical metadata for the module.
   */
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
    teachingStrategies: [{
      type: String,
      maxlength: 200,
    }],
  },
  /**
   * versionControl: Tracks all changes to the module for audit, rollback, and collaboration.
   */
  versionControl: {
    version: {
      type: String,
      default: '1.0.0',
    },
    changeLog: [{
      version: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      changes: [{
        type: String,
        required: true,
      }],
      changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    }],
    isDraft: {
      type: Boolean,
      default: true,
    },
    publishedVersion: String,
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  toJSON: {
    /**
     * Custom transform to remove MongoDB internals and sensitive fields from API responses.
     * - Removes _id, __v
     * - Optionally remove or mask any sensitive fields here
     */
    transform: function(_, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Add additional sensitive field removals here if needed
      return ret;
    }
  },
});

// Compound indexes for performance
moduleSchema.index({ courseId: 1, position: 1 });
moduleSchema.index({ courseId: 1, isPublished: 1, isActive: 1 });
moduleSchema.index({ 'content.keyTopics': 1, difficulty: 1 });
moduleSchema.index({ 'metadata.tags': 1, 'metadata.category': 1 });
moduleSchema.index({ title: 'text', description: 'text', 'content.keyTopics': 'text' });

// Pre-save middleware to update version control
moduleSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.metadata.lastUpdated = new Date();
    // Auto-increment version if content changes
    if (this.isModified('content') || this.isModified('objectives') || this.isModified('learningOutcomes')) {
      const currentVersion = this.versionControl.version;
      const versionParts = currentVersion.split('.').map(Number);
      versionParts[2]++; // Increment patch version
      this.versionControl.version = versionParts.join('.');
    }
  }
  next();
});

// Virtual for lesson count
moduleSchema.virtual('lessonCount', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'moduleId',
  count: true,
});

// Virtual for total estimated duration including lessons
moduleSchema.virtual('totalEstimatedDuration').get(function() {
  // This would need to be populated with lessons to calculate accurately
  return this.estimatedDuration;
});

export const Module = mongoose.model('Module', moduleSchema);
