import mongoose, { Schema, Document, Model } from 'mongoose';
import { Module as IModuleType } from '@astralearn/shared';

// Module document interface
export interface IModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  position: number;
  objectives: string[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  isPublished: boolean;
  lessons: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addLesson(lessonId: mongoose.Types.ObjectId): void;
  removeLesson(lessonId: mongoose.Types.ObjectId): void;
  reorderLessons(lessonIds: mongoose.Types.ObjectId[]): void;
  toJSON(): IModuleType;
}

// Module schema
const moduleSchema = new Schema<IModule>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  position: {
    type: Number,
    required: true,
    min: 1,
  },
  objectives: [{
    type: String,
    required: true,
    trim: true,
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
  },
  prerequisites: [{
    type: String,
    trim: true,
  }],
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
moduleSchema.index({ courseId: 1, position: 1 });
moduleSchema.index({ courseId: 1, isPublished: 1 });
moduleSchema.index({ createdAt: -1 });

// Virtual for lesson count
moduleSchema.virtual('lessonCount').get(function() {
  return this.lessons.length;
});

// Virtual for course population
moduleSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});

// Ensure unique position within course
moduleSchema.index({ courseId: 1, position: 1 }, { unique: true });

// Pre-save middleware to handle position conflicts
moduleSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('position')) {
    // Check if position already exists for this course
    const existingModule = await this.constructor.findOne({
      courseId: this.courseId,
      position: this.position,
      _id: { $ne: this._id },
    });

    if (existingModule) {
      // Shift other modules down
      await this.constructor.updateMany(
        {
          courseId: this.courseId,
          position: { $gte: this.position },
          _id: { $ne: this._id },
        },
        { $inc: { position: 1 } }
      );
    }
  }
  next();
});

// Pre-remove middleware to adjust positions
moduleSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // Shift modules up to fill the gap
  await this.constructor.updateMany(
    {
      courseId: this.courseId,
      position: { $gt: this.position },
    },
    { $inc: { position: -1 } }
  );
  next();
});

// Instance method to add lesson
moduleSchema.methods.addLesson = function(lessonId: mongoose.Types.ObjectId): void {
  if (!this.lessons.includes(lessonId)) {
    this.lessons.push(lessonId);
  }
};

// Instance method to remove lesson
moduleSchema.methods.removeLesson = function(lessonId: mongoose.Types.ObjectId): void {
  this.lessons = this.lessons.filter(id => !id.equals(lessonId));
};

// Instance method to reorder lessons
moduleSchema.methods.reorderLessons = function(lessonIds: mongoose.Types.ObjectId[]): void {
  // Validate that all lesson IDs belong to this module
  const validLessons = lessonIds.filter(id => 
    this.lessons.some(lessonId => lessonId.equals(id))
  );
  
  this.lessons = validLessons;
};

// Instance method to convert to JSON
moduleSchema.methods.toJSON = function(): IModuleType {
  return {
    id: this._id.toString(),
    courseId: this.courseId.toString(),
    title: this.title,
    description: this.description,
    position: this.position,
    objectives: this.objectives,
    estimatedDuration: this.estimatedDuration,
    difficulty: this.difficulty,
    prerequisites: this.prerequisites,
    isPublished: this.isPublished,
    lessons: this.lessons.map(id => id.toString()),
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

// Static methods
moduleSchema.statics.findByCourse = function(courseId: string, publishedOnly = false) {
  const query: any = { courseId };
  if (publishedOnly) {
    query.isPublished = true;
  }
  return this.find(query).sort({ position: 1 });
};

moduleSchema.statics.findPublished = function(filters = {}) {
  return this.find({
    ...filters,
    isPublished: true,
  }).sort({ position: 1 });
};

moduleSchema.statics.getNextPosition = async function(courseId: string): Promise<number> {
  const lastModule = await this.findOne({ courseId })
    .sort({ position: -1 })
    .select('position');
  
  return lastModule ? lastModule.position + 1 : 1;
};

moduleSchema.statics.reorderModules = async function(
  courseId: string, 
  modulePositions: { moduleId: string; position: number }[]
): Promise<void> {
  const bulkOps = modulePositions.map(({ moduleId, position }) => ({
    updateOne: {
      filter: { _id: moduleId, courseId },
      update: { position },
    },
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
};

// Create and export model
export const Module: Model<IModule> = mongoose.model<IModule>('Module', moduleSchema);
