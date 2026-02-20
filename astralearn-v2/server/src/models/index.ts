// Export all models
export { User, IUser } from './User.js';
export { Course, ICourse } from './Course.js';
export { Module, IModule } from './Module.js';
export { Lesson, ILesson } from './Lesson.js';

// Re-export types from shared package
export type {
  UserProfile,
  UserPreferences,
  UserStats,
  Course as CourseType,
  Module as ModuleType,
  Lesson as LessonType,
} from '@astralearn/shared';
