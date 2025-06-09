import mongoose, { Schema } from 'mongoose';

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
  },
  instructorId: {
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
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance and search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ instructorId: 1, createdAt: -1 });
courseSchema.index({ isPublished: 1, difficulty: 1 });
courseSchema.index({ tags: 1, difficulty: 1 });

export const Course = mongoose.model('Course', courseSchema);
