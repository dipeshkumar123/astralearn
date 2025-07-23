import { z } from 'zod';

// Study Group Schema
export const StudyGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  courseId: z.string().optional(),
  createdBy: z.string(),
  members: z.array(z.object({
    userId: z.string(),
    role: z.enum(['owner', 'moderator', 'member']),
    joinedAt: z.string().datetime(),
  })),
  maxMembers: z.number().positive().default(10),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  schedule: z.object({
    timezone: z.string(),
    recurringDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
    time: z.string(), // HH:MM format
  }).optional(),
  settings: z.object({
    allowInvites: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    allowDiscussions: z.boolean().default(true),
  }),
  stats: z.object({
    totalSessions: z.number().nonnegative().default(0),
    totalStudyTime: z.number().nonnegative().default(0),
    averageAttendance: z.number().min(0).max(100).default(0),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type StudyGroup = z.infer<typeof StudyGroupSchema>;

// Discussion Forum Schema
export const DiscussionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  author: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
  }).optional(),
  courseId: z.string().optional(),
  studyGroupId: z.string().optional(),
  category: z.enum(['question', 'discussion', 'announcement', 'resource']),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  votes: z.object({
    upvotes: z.number().nonnegative().default(0),
    downvotes: z.number().nonnegative().default(0),
  }),
  replies: z.array(z.object({
    id: z.string(),
    content: z.string(),
    authorId: z.string(),
    author: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      avatar: z.string().optional(),
    }).optional(),
    votes: z.object({
      upvotes: z.number().nonnegative().default(0),
      downvotes: z.number().nonnegative().default(0),
    }),
    isAccepted: z.boolean().default(false),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })).default([]),
  viewCount: z.number().nonnegative().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Discussion = z.infer<typeof DiscussionSchema>;

// Study Buddy Schema
export const StudyBuddySchema = z.object({
  id: z.string(),
  user1Id: z.string(),
  user2Id: z.string(),
  user1: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
    learningStyle: z.string().optional(),
  }).optional(),
  user2: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
    learningStyle: z.string().optional(),
  }).optional(),
  status: z.enum(['pending', 'accepted', 'declined', 'blocked']),
  commonCourses: z.array(z.string()).default([]),
  matchScore: z.number().min(0).max(100),
  interactions: z.array(z.object({
    type: z.enum(['message', 'study_session', 'resource_share', 'help_request']),
    timestamp: z.string().datetime(),
    metadata: z.record(z.any()).optional(),
  })).default([]),
  stats: z.object({
    totalSessions: z.number().nonnegative().default(0),
    totalStudyTime: z.number().nonnegative().default(0),
    helpfulInteractions: z.number().nonnegative().default(0),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type StudyBuddy = z.infer<typeof StudyBuddySchema>;

// Live Session Schema
export const LiveSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  hostId: z.string(),
  host: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
  }).optional(),
  type: z.enum(['study_group', 'tutoring', 'discussion', 'presentation']),
  courseId: z.string().optional(),
  studyGroupId: z.string().optional(),
  participants: z.array(z.object({
    userId: z.string(),
    joinedAt: z.string().datetime(),
    leftAt: z.string().datetime().optional(),
    role: z.enum(['host', 'moderator', 'participant']),
  })),
  maxParticipants: z.number().positive().default(50),
  scheduledAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  duration: z.number().positive(), // in minutes
  status: z.enum(['scheduled', 'live', 'ended', 'cancelled']),
  settings: z.object({
    allowChat: z.boolean().default(true),
    allowScreenShare: z.boolean().default(true),
    allowRecording: z.boolean().default(false),
    requireApproval: z.boolean().default(false),
  }),
  recording: z.object({
    url: z.string().url(),
    duration: z.number().positive(),
    size: z.number().positive(),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LiveSession = z.infer<typeof LiveSessionSchema>;

// Social Interaction Schema
export const SocialInteractionSchema = z.object({
  id: z.string(),
  type: z.enum(['like', 'comment', 'share', 'follow', 'mention', 'help_request', 'help_provided']),
  actorId: z.string(),
  targetId: z.string(),
  targetType: z.enum(['user', 'discussion', 'course', 'study_group', 'session']),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

export type SocialInteraction = z.infer<typeof SocialInteractionSchema>;
