/**
 * Social Learning Models for AstraLearn
 * Phase 4 Step 2: Advanced Gamification Features - Social Learning Data Models
 * 
 * Defines database schemas for social learning features including:
 * - Study Groups and Teams
 * - Discussion Forums and Q&A
 * - Collaborative Workspaces
 * - Social Interactions and Relationships
 * - Peer Learning Analytics
 */

import mongoose from 'mongoose';
const { Schema } = mongoose;

// Study Group Schema
const studyGroupSchema = new Schema({
  groupId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['open', 'private', 'course_specific', 'skill_based', 'exam_prep'],
    default: 'open'
  },
  subject: {
    type: String,
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  maxMembers: {
    type: Number,
    default: 20,
    min: 2,
    max: 100
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'course_only'],
    default: 'public'
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'mentor', 'member', 'observer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      canInvite: { type: Boolean, default: false },
      canModerate: { type: Boolean, default: false },
      canSchedule: { type: Boolean, default: false }
    }
  }],
  settings: {
    isPublic: { type: Boolean, default: true },
    allowInvites: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    studySchedule: {
      timezone: String,
      recurringDays: [String],
      preferredTimes: [String]
    },
    notifications: {
      newMembers: { type: Boolean, default: true },
      studySessions: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true }
    }
  },
  analytics: {
    totalSessions: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 },
    averageAttendance: { type: Number, default: 0 },
    memberEngagement: Schema.Types.Mixed,
    performanceMetrics: Schema.Types.Mixed
  }
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

// Discussion Forum Schema
const discussionSchema = new Schema({
  discussionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  type: {
    type: String,
    enum: ['discussion', 'question', 'announcement', 'poll', 'resource_share', 'study_material'],
    default: 'discussion'
  },
  category: {
    type: String,
    enum: ['general', 'course_specific', 'q_and_a', 'study_groups', 'announcements', 'feedback', 'technical_support', 'career_advice'],
    default: 'general'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  studyGroupId: {
    type: String,
    ref: 'StudyGroup'
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'course_only', 'group_only'],
    default: 'public'
  },
  replies: [{
    replyId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parentReplyId: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    votes: {
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      voters: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        vote: { type: Number, enum: [-1, 0, 1] },
        votedAt: { type: Date, default: Date.now }
      }]
    },
    moderation: {
      isModerated: { type: Boolean, default: false },
      flags: [{
        flaggedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        timestamp: { type: Date, default: Date.now }
      }],
      isHidden: { type: Boolean, default: false }
    },
    metadata: {
      attachments: [Schema.Types.Mixed],
      isAnswer: { type: Boolean, default: false },
      isBestAnswer: { type: Boolean, default: false },
      bestAnswerMarkedAt: Date,
      markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      helpfulVotes: { type: Number, default: 0 }
    }
  }],
  votes: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    voters: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      vote: { type: Number, enum: [-1, 0, 1] },
      votedAt: { type: Date, default: Date.now }
    }]
  },
  engagement: {
    views: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
    participantCount: { type: Number, default: 1 },
    avgRating: { type: Number, default: 0 }
  },
  moderation: {
    isModerated: { type: Boolean, default: false },
    flags: [{
      flaggedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      timestamp: { type: Date, default: Date.now }
    }],
    moderatorActions: [{
      actionId: String,
      action: { type: String, enum: ['approve', 'flag', 'hide', 'delete', 'warning', 'feature'] },
      moderatorId: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      timestamp: { type: Date, default: Date.now }
    }],
    isFeatured: { type: Boolean, default: false }
  },
  metadata: {
    attachments: [Schema.Types.Mixed],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    estimatedReadTime: { type: Number, default: 1 },
    relatedTopics: [String]
  }
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

// Study Buddy Relationship Schema
const studyBuddySchema = new Schema({
  relationshipId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user1Id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'ended'],
    default: 'active'
  },
  initiatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  sharedSubjects: [String],
  commonGoals: [String],
  studySchedule: {
    timezone: String,
    availableDays: [String],
    availableTimes: [String],
    preferredDuration: Number
  },
  interactions: [{
    interactionId: String,
    type: { type: String, enum: ['message', 'study_session', 'resource_share', 'help_request'] },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    data: Schema.Types.Mixed
  }],
  analytics: {
    totalInteractions: { type: Number, default: 0 },
    studySessionsCount: { type: Number, default: 0 },
    mutualHelpCount: { type: Number, default: 0 },
    satisfactionRating: { type: Number, min: 1, max: 5 }
  }
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

// Collaboration Workspace Schema
const collaborationWorkspaceSchema = new Schema({
  workspaceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['study_room', 'project_workspace', 'tutoring_session', 'group_assignment', 'exam_prep', 'brainstorming'],
    default: 'study_room'
  },
  subject: String,
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'course_only'],
    default: 'private'
  },
  settings: {
    allowScreenShare: { type: Boolean, default: true },
    allowFileShare: { type: Boolean, default: true },
    allowWhiteboard: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    recordSessions: { type: Boolean, default: false },
    autoTranscription: { type: Boolean, default: false }
  },
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['host', 'co_host', 'presenter', 'participant', 'observer'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      canInvite: { type: Boolean, default: false },
      canManage: { type: Boolean, default: false },
      canPresent: { type: Boolean, default: false },
      canModerate: { type: Boolean, default: false }
    }
  }],
  resources: {
    documents: [{
      documentId: String,
      name: String,
      type: String,
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now },
      permissions: Schema.Types.Mixed
    }],
    files: [{
      fileId: String,
      name: String,
      type: String,
      size: Number,
      uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now }
    }],
    whiteboards: [{
      whiteboardId: String,
      name: String,
      createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      data: Schema.Types.Mixed
    }],
    recordings: [{
      recordingId: String,
      sessionId: String,
      duration: Number,
      createdAt: { type: Date, default: Date.now },
      size: Number
    }]
  },
  analytics: {
    totalSessions: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    averageParticipants: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    collaborationMetrics: Schema.Types.Mixed
  }
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

// Live Session Schema
const liveSessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  workspaceId: {
    type: String,
    ref: 'CollaborationWorkspace'
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number,
    default: 0
  },
  mode: {
    type: String,
    enum: ['text_only', 'voice_chat', 'video_call', 'screen_share', 'whiteboard', 'document_edit'],
    default: 'video_call'
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended', 'cancelled'],
    default: 'active'
  },
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['host', 'co_host', 'presenter', 'participant', 'observer'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    },
    rejoinedAt: {
      type: Date
    },
    isPresenting: {
      type: Boolean,
      default: false
    },
    audioEnabled: {
      type: Boolean,
      default: true
    },
    videoEnabled: {
      type: Boolean,
      default: true
    }
  }],
  tools: {
    whiteboard: { type: Boolean, default: false },
    screenShare: { type: Boolean, default: false },
    fileShare: { type: Boolean, default: false },
    recording: { type: Boolean, default: false },
    breakoutRooms: { type: Boolean, default: false }
  },
  chat: {
    messages: [{
      messageId: String,
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      content: String,
      type: { type: String, enum: ['text', 'file_share', 'screen_annotation', 'system', 'reaction', 'poll'] },
      timestamp: { type: Date, default: Date.now },
      reactions: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
        timestamp: { type: Date, default: Date.now }
      }],
      isPrivate: { type: Boolean, default: false },
      recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
      metadata: Schema.Types.Mixed
    }],
    polls: [{
      pollId: String,
      question: String,
      options: [String],
      createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      responses: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        choice: String,
        timestamp: { type: Date, default: Date.now }
      }]
    }],
    reactions: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      emoji: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  content: {
    whiteboardData: Schema.Types.Mixed,
    sharedDocuments: [{
      documentId: String,
      sharedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      sharedAt: { type: Date, default: Date.now },
      permissions: Schema.Types.Mixed,
      collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      versions: [Schema.Types.Mixed],
      currentVersion: { type: Number, default: 1 }
    }],
    screenShareData: Schema.Types.Mixed,
    annotations: [Schema.Types.Mixed]
  },
  analytics: {
    peakParticipants: { type: Number, default: 1 },
    totalInteractions: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    participationMetrics: Schema.Types.Mixed
  }
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

// Social Interaction Schema
const socialInteractionSchema = new Schema({
  interactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['message', 'help_request', 'study_invite', 'resource_share', 'feedback', 'mentorship', 'peer_review'],
    required: true
  },
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  groupId: {
    type: String
  },
  sessionId: {
    type: String
  },
  content: {
    type: String,
    maxlength: 2000
  },
  metadata: Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  responseData: Schema.Types.Mixed,
  respondedAt: Date,
  expiresAt: Date
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

// Create indexes for performance
studyGroupSchema.index({ 'members.userId': 1, status: 1 });
studyGroupSchema.index({ subject: 1, type: 1, visibility: 1 });
studyGroupSchema.index({ createdAt: -1 });

discussionSchema.index({ authorId: 1, createdAt: -1 });
discussionSchema.index({ courseId: 1, category: 1, status: 1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ 'engagement.lastActivity': -1 });

studyBuddySchema.index({ user1Id: 1, user2Id: 1 });
studyBuddySchema.index({ status: 1, createdAt: -1 });

collaborationWorkspaceSchema.index({ 'participants.userId': 1, status: 1 });
collaborationWorkspaceSchema.index({ subject: 1, type: 1, visibility: 1 });

liveSessionSchema.index({ 'participants.userId': 1, status: 1 });
liveSessionSchema.index({ hostId: 1, startedAt: -1 });

socialInteractionSchema.index({ fromUserId: 1, type: 1, createdAt: -1 });
socialInteractionSchema.index({ toUserId: 1, status: 1 });

// Export models
export const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);
export const Discussion = mongoose.model('Discussion', discussionSchema);
export const StudyBuddy = mongoose.model('StudyBuddy', studyBuddySchema);
export const CollaborationWorkspace = mongoose.model('CollaborationWorkspace', collaborationWorkspaceSchema);
export const LiveSession = mongoose.model('LiveSession', liveSessionSchema);
export const SocialInteraction = mongoose.model('SocialInteraction', socialInteractionSchema);
