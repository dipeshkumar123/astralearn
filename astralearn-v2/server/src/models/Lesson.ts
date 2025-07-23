import mongoose, { Schema, Document, Model } from 'mongoose';
import { Lesson as ILessonType } from '@astralearn/shared';

// Lesson document interface
export interface ILesson extends Document {
  moduleId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'quiz' | 'assignment';
  position: number;
  estimatedDuration: number;
  objectives: string[];
  resources: Array<{
    type: 'link' | 'file' | 'video' | 'document';
    title: string;
    url: string;
    description?: string;
  }>;
  isPublished: boolean;
  isFree: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addResource(resource: any): void;
  removeResource(resourceIndex: number): void;
  toJSON(): ILessonType;
}

// Resource sub-schema
const resourceSchema = new Schema({
  type: {
    type: String,
    enum: ['link', 'file', 'video', 'document'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Resource URL must be valid',
    },
  },
  description: {
    type: String,
    trim: true,
  },
}, { _id: false });

// Lesson schema
const lessonSchema = new Schema<ILesson>({
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
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
    trim: true,
    maxlength: 1000,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'video', 'interactive', 'quiz', 'assignment'],
    required: true,
    index: true,
  },
  position: {
    type: Number,
    required: true,
    min: 1,
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
  resources: [resourceSchema],
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  isFree: {
    type: Boolean,
    default: false,
    index: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
lessonSchema.index({ moduleId: 1, position: 1 });
lessonSchema.index({ moduleId: 1, isPublished: 1 });
lessonSchema.index({ type: 1, isPublished: 1 });
lessonSchema.index({ isFree: 1, isPublished: 1 });
lessonSchema.index({ createdAt: -1 });

// Virtual for module population
lessonSchema.virtual('module', {
  ref: 'Module',
  localField: 'moduleId',
  foreignField: '_id',
  justOne: true,
});

// Ensure unique position within module
lessonSchema.index({ moduleId: 1, position: 1 }, { unique: true });

// Pre-save middleware to handle position conflicts
lessonSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('position')) {
    // Check if position already exists for this module
    const existingLesson = await this.constructor.findOne({
      moduleId: this.moduleId,
      position: this.position,
      _id: { $ne: this._id },
    });

    if (existingLesson) {
      // Shift other lessons down
      await this.constructor.updateMany(
        {
          moduleId: this.moduleId,
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
lessonSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // Shift lessons up to fill the gap
  await this.constructor.updateMany(
    {
      moduleId: this.moduleId,
      position: { $gt: this.position },
    },
    { $inc: { position: -1 } }
  );
  next();
});

// Instance method to add resource
lessonSchema.methods.addResource = function(resource: any): void {
  this.resources.push(resource);
};

// Instance method to remove resource
lessonSchema.methods.removeResource = function(resourceIndex: number): void {
  if (resourceIndex >= 0 && resourceIndex < this.resources.length) {
    this.resources.splice(resourceIndex, 1);
  }
};

// Instance method to convert to JSON
lessonSchema.methods.toJSON = function(): ILessonType {
  return {
    id: this._id.toString(),
    moduleId: this.moduleId.toString(),
    title: this.title,
    description: this.description,
    content: this.content,
    type: this.type,
    position: this.position,
    estimatedDuration: this.estimatedDuration,
    objectives: this.objectives,
    resources: this.resources.map(resource => ({
      type: resource.type,
      title: resource.title,
      url: resource.url,
      description: resource.description,
    })),
    isPublished: this.isPublished,
    isFree: this.isFree,
    metadata: this.metadata,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

// Static methods
lessonSchema.statics.findByModule = function(moduleId: string, publishedOnly = false) {
  const query: any = { moduleId };
  if (publishedOnly) {
    query.isPublished = true;
  }
  return this.find(query).sort({ position: 1 });
};

lessonSchema.statics.findPublished = function(filters = {}) {
  return this.find({
    ...filters,
    isPublished: true,
  }).sort({ position: 1 });
};

lessonSchema.statics.findFree = function() {
  return this.findPublished({ isFree: true });
};

lessonSchema.statics.findByType = function(type: string, publishedOnly = true) {
  const query: any = { type };
  if (publishedOnly) {
    query.isPublished = true;
  }
  return this.find(query).sort({ position: 1 });
};

lessonSchema.statics.getNextPosition = async function(moduleId: string): Promise<number> {
  const lastLesson = await this.findOne({ moduleId })
    .sort({ position: -1 })
    .select('position');
  
  return lastLesson ? lastLesson.position + 1 : 1;
};

lessonSchema.statics.reorderLessons = async function(
  moduleId: string, 
  lessonPositions: { lessonId: string; position: number }[]
): Promise<void> {
  const bulkOps = lessonPositions.map(({ lessonId, position }) => ({
    updateOne: {
      filter: { _id: lessonId, moduleId },
      update: { position },
    },
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
};

// Create and export model
export const Lesson: Model<ILesson> = mongoose.model<ILesson>('Lesson', lessonSchema);
