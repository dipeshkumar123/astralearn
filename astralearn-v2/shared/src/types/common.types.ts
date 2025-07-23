import { z } from 'zod';

// Common utility types
export type ID = string;
export type Timestamp = Date;

// API Response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  timestamp: z.string().datetime(),
});

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  ApiResponseSchema.extend({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorResponseSchema = ApiResponseSchema.extend({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & {
  data?: T;
  error?: string;
  details?: any;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  message?: string;
  details?: any;
  timestamp: string;
};

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema,
  });

export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

// Query parameters
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const SortQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const SearchQuerySchema = z.object({
  search: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type SortQuery = z.infer<typeof SortQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// Common enums
export const DifficultyLevel = z.enum(['beginner', 'intermediate', 'advanced']);
export const UserRole = z.enum(['student', 'instructor', 'admin']);
export const LearningStyle = z.enum(['visual', 'auditory', 'kinesthetic', 'reading']);

export type DifficultyLevel = z.infer<typeof DifficultyLevel>;
export type UserRole = z.infer<typeof UserRole>;
export type LearningStyle = z.infer<typeof LearningStyle>;

// Status enums
export const PublishStatus = z.enum(['draft', 'published', 'archived']);
export const ProgressStatus = z.enum(['not_started', 'in_progress', 'completed']);
export const AssessmentStatus = z.enum(['pending', 'in_progress', 'completed', 'failed']);

export type PublishStatus = z.infer<typeof PublishStatus>;
export type ProgressStatus = z.infer<typeof ProgressStatus>;
export type AssessmentStatus = z.infer<typeof AssessmentStatus>;

// File upload types
export const FileTypeSchema = z.enum(['image', 'video', 'audio', 'document', 'archive']);
export type FileType = z.infer<typeof FileTypeSchema>;

export const UploadedFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
  type: FileTypeSchema,
  uploadedAt: z.string().datetime(),
  uploadedBy: z.string(),
});

export type UploadedFile = z.infer<typeof UploadedFileSchema>;

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}
