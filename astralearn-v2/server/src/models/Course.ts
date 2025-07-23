import mongoose, { Schema, Document, Model } from 'mongoose';
import { Course as ICourseType } from '@astralearn/shared';

// Course document interface
export interface ICourse extends Document {
  title: string;
  description: string;
  shortDescription?: string;
  instructorId: mongoose.Types.ObjectId;
  thumbnail?: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  objectives: string[];
  prerequisites: string[];
  status: 'draft' | 'published' | 'archived';
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  language: string;
  modules: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateRating(newRating: number): void;
  incrementEnrollment(): void;
  decrementEnrollment(): void;
  toJSON(): ICourseType;
}

// Course schema
const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
    index: 'text',
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000,
    index: 'text',
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  thumbnail: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Thumbnail must be a valid URL',
    },
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
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
  objectives: [{
    type: String,
    required: true,
    trim: true,
  }],
  prerequisites: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
  },
  language: {
    type: String,
    default: 'en',
    lowercase: true,
  },
  modules: [{
    type: Schema.Types.ObjectId,
    ref: 'Module',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, difficulty: 1 });
courseSchema.index({ isPublished: 1, isFeatured: 1 });
courseSchema.index({ rating: -1, enrollmentCount: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ price: 1, isPublished: 1 });

// Virtual for instructor population
courseSchema.virtual('instructor', {
  ref: 'User',
  localField: 'instructorId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for module count
courseSchema.virtual('moduleCount').get(function() {
  return this.modules.length;
});

// Pre-save middleware to update isPublished based on status
courseSchema.pre('save', function(next) {
  this.isPublished = this.status === 'published';
  next();
});

// Instance method to update rating
courseSchema.methods.updateRating = function(newRating: number): void {
  const totalRating = this.rating * this.reviewCount + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
};

// Instance method to increment enrollment
courseSchema.methods.incrementEnrollment = function(): void {
  this.enrollmentCount += 1;
};

// Instance method to decrement enrollment
courseSchema.methods.decrementEnrollment = function(): void {
  if (this.enrollmentCount > 0) {
    this.enrollmentCount -= 1;
  }
};

// Instance method to convert to JSON
courseSchema.methods.toJSON = function(): ICourseType {
  const instructor = this.instructor ? {
    id: this.instructor._id.toString(),
    firstName: this.instructor.firstName,
    lastName: this.instructor.lastName,
    avatar: this.instructor.avatar,
  } : undefined;

  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    shortDescription: this.shortDescription,
    instructorId: this.instructorId.toString(),
    instructor,
    thumbnail: this.thumbnail,
    category: this.category,
    tags: this.tags,
    difficulty: this.difficulty,
    estimatedDuration: this.estimatedDuration,
    objectives: this.objectives,
    prerequisites: this.prerequisites,
    status: this.status,
    isPublished: this.isPublished,
    isFeatured: this.isFeatured,
    enrollmentCount: this.enrollmentCount,
    rating: this.rating,
    reviewCount: this.reviewCount,
    price: this.price,
    currency: this.currency,
    language: this.language,
    modules: this.modules.map(id => id.toString()),
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

// Static methods
courseSchema.statics.findPublished = function(filters = {}) {
  return this.find({
    ...filters,
    isPublished: true,
    status: 'published',
  });
};

courseSchema.statics.findByInstructor = function(instructorId: string) {
  return this.find({ instructorId });
};

courseSchema.statics.findByCategory = function(category: string) {
  return this.findPublished({ category });
};

courseSchema.statics.findByDifficulty = function(difficulty: string) {
  return this.findPublished({ difficulty });
};

courseSchema.statics.findFeatured = function() {
  return this.findPublished({ isFeatured: true });
};

courseSchema.statics.searchCourses = function(query: string, filters = {}) {
  const searchQuery = {
    ...filters,
    isPublished: true,
    $text: { $search: query },
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Create and export model
export const Course: Model<ICourse> = mongoose.model<ICourse>('Course', courseSchema);
