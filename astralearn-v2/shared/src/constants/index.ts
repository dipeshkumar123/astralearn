// Application constants
export const APP_NAME = 'AstraLearn';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'AI-Powered Social Learning Platform';

// API constants
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
} as const;

// Learning styles
export const LEARNING_STYLES = {
  VISUAL: 'visual',
  AUDITORY: 'auditory',
  KINESTHETIC: 'kinesthetic',
  READING: 'reading',
} as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

// Course categories
export const COURSE_CATEGORIES = [
  'Programming',
  'Data Science',
  'Web Development',
  'Mobile Development',
  'Machine Learning',
  'Artificial Intelligence',
  'Cybersecurity',
  'Cloud Computing',
  'DevOps',
  'Database',
  'UI/UX Design',
  'Business',
  'Marketing',
  'Languages',
  'Mathematics',
  'Science',
  'Arts',
  'Music',
  'Health',
  'Fitness',
] as const;

// Assessment types
export const ASSESSMENT_TYPES = {
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  PROJECT: 'project',
  EXAM: 'exam',
} as const;

// Question types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
  CODE: 'code',
} as const;

// Progress statuses
export const PROGRESS_STATUSES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// Assessment statuses
export const ASSESSMENT_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Publish statuses
export const PUBLISH_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// Gamification constants
export const BADGE_CATEGORIES = {
  LEARNING: 'learning',
  SOCIAL: 'social',
  ACHIEVEMENT: 'achievement',
  MILESTONE: 'milestone',
} as const;

export const BADGE_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;

export const ACHIEVEMENT_TYPES = {
  PROGRESS: 'progress',
  MILESTONE: 'milestone',
  CHALLENGE: 'challenge',
  SOCIAL: 'social',
} as const;

// Points system
export const POINTS = {
  LESSON_COMPLETED: 10,
  QUIZ_PASSED: 20,
  COURSE_COMPLETED: 100,
  DAILY_STREAK: 5,
  WEEKLY_STREAK: 25,
  MONTHLY_STREAK: 100,
  DISCUSSION_POST: 5,
  HELPFUL_ANSWER: 15,
  STUDY_GROUP_PARTICIPATION: 10,
  BADGE_EARNED: 50,
} as const;

// Level system
export const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  2000,  // Level 6
  3500,  // Level 7
  5500,  // Level 8
  8000,  // Level 9
  12000, // Level 10
  17000, // Level 11
  23000, // Level 12
  30000, // Level 13
  38000, // Level 14
  47000, // Level 15
  57000, // Level 16
  68000, // Level 17
  80000, // Level 18
  93000, // Level 19
  107000, // Level 20
] as const;

// Social learning constants
export const STUDY_GROUP_ROLES = {
  OWNER: 'owner',
  MODERATOR: 'moderator',
  MEMBER: 'member',
} as const;

export const DISCUSSION_CATEGORIES = {
  QUESTION: 'question',
  DISCUSSION: 'discussion',
  ANNOUNCEMENT: 'announcement',
  RESOURCE: 'resource',
} as const;

export const LIVE_SESSION_TYPES = {
  STUDY_GROUP: 'study_group',
  TUTORING: 'tutoring',
  DISCUSSION: 'discussion',
  PRESENTATION: 'presentation',
} as const;

// AI constants
export const AI_MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

export const AI_REQUEST_TYPES = {
  CHAT: 'chat',
  EXPLANATION: 'explanation',
  FEEDBACK: 'feedback',
  RECOMMENDATION: 'recommendation',
  DEBUG: 'debug',
} as const;

// File upload constants
export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  ARCHIVE: 'archive',
} as const;

export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 20 * 1024 * 1024, // 20MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  ARCHIVE: 50 * 1024 * 1024, // 50MB
} as const;

export const ALLOWED_FILE_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  VIDEO: ['.mp4', '.webm', '.ogg', '.avi', '.mov'],
  AUDIO: ['.mp3', '.wav', '.ogg', '.m4a'],
  DOCUMENT: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  ARCHIVE: ['.zip', '.rar', '.7z', '.tar', '.gz'],
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ACHIEVEMENT: 'achievement',
  SOCIAL: 'social',
  COURSE: 'course',
} as const;

// Time constants
export const TIME_FORMATS = {
  SHORT_DATE: 'MM/DD/YYYY',
  LONG_DATE: 'MMMM DD, YYYY',
  DATE_TIME: 'MM/DD/YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
} as const;

// Validation constants
export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  COURSE_TITLE_MIN_LENGTH: 3,
  COURSE_TITLE_MAX_LENGTH: 200,
  COURSE_DESCRIPTION_MIN_LENGTH: 10,
  COURSE_DESCRIPTION_MAX_LENGTH: 2000,
  LESSON_TITLE_MAX_LENGTH: 200,
  LESSON_DESCRIPTION_MAX_LENGTH: 1000,
} as const;
