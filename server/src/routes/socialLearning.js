/**
 * Social Learning Routes for AstraLearn
 * Phase 4 Step 2: Advanced Gamification Features - Social Learning API Endpoints
 * 
 * Provides comprehensive API endpoints for social learning features including:
 * - Study groups management
 * - Discussion forums and Q&A
 * - Study buddy matching and relationships
 * - Collaboration workspaces and live sessions
 * - Social analytics and insights
 */

import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import socialLearningService from '../services/socialLearningService.js';
import discussionForumService from '../services/discussionForumService.js';
import collaborationService from '../services/collaborationService.js';
import gamificationService from '../services/gamificationService.js';
import { flexibleAuthenticate, flexibleAuthorize } from '../middleware/authMiddleware.js';

const router = express.Router();

console.log('=== Loading Social Learning Routes - Phase 4 Step 2 ===');

// ======================
// STUDY GROUPS ENDPOINTS
// ======================

// Create a new study group
router.post('/study-groups',
  flexibleAuthenticate,
  [
    body('name').notEmpty().withMessage('Group name is required').isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('type').optional().isIn(['open', 'private', 'course_specific', 'skill_based', 'exam_prep']),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('maxMembers').optional().isInt({ min: 2, max: 100 }),
    body('isPublic').optional().isBoolean(),
    body('requireApproval').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await socialLearningService.createStudyGroup(req.body, req.user._id);
      
      res.status(201).json({
        success: true,
        message: 'Study group created successfully',
        studyGroup: result.studyGroup,
        groupId: result.groupId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Create study group error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not create study group'
      });
    }
  }
);

// Join a study group
router.post('/study-groups/:groupId/join',
  flexibleAuthenticate,
  [
    param('groupId').notEmpty().withMessage('Group ID is required'),
    body('inviteCode').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { groupId } = req.params;
      const { inviteCode } = req.body;
      
      const result = await socialLearningService.joinStudyGroup(req.user._id, groupId, inviteCode);
      
      res.json({
        success: true,
        message: result.message,
        studyGroup: result.studyGroup,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Join study group error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Could not join study group'
      });
    }
  }
);

// Get user's study groups
router.get('/study-groups/my-groups',
  flexibleAuthenticate,
  [
    query('status').optional().isIn(['active', 'inactive', 'archived']),
    query('role').optional().isIn(['admin', 'moderator', 'mentor', 'member', 'observer']),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  async (req, res) => {
    try {
      const { status, role, limit = 20 } = req.query;
      
      // Mock response for now
      const studyGroups = [];
      
      res.json({
        success: true,
        studyGroups,
        total: studyGroups.length,
        filters: { status, role },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get user study groups error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve study groups'
      });
    }
  }
);

// =========================
// STUDY BUDDY ENDPOINTS
// =========================

// Find study buddy matches
router.get('/study-buddies/find',
  flexibleAuthenticate,
  [
    query('subject').optional().isString(),
    query('learningStyle').optional().isIn(['visual', 'auditory', 'kinesthetic', 'reading']),
    query('performanceLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
    query('timezone').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 20 })
  ],
  async (req, res) => {
    try {
      const preferences = {
        subject: req.query.subject,
        learningStyle: req.query.learningStyle,
        performanceLevel: req.query.performanceLevel,
        timezone: req.query.timezone
      };
      
      const result = await socialLearningService.findStudyBuddies(req.user._id, preferences);
      
      res.json({
        success: true,
        studyBuddies: result.studyBuddies,
        totalCandidates: result.totalCandidates,
        criteria: result.criteria,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Find study buddies error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not find study buddies'
      });
    }
  }
);

// Send study buddy request
router.post('/study-buddies/request',
  flexibleAuthenticate,
  [
    body('toUserId').isMongoId().withMessage('Valid user ID required'),
    body('message').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { toUserId, message } = req.body;
      
      const result = await socialLearningService.sendStudyBuddyRequest(req.user._id, toUserId, message);
      
      res.status(201).json({
        success: true,
        message: result.message,
        requestId: result.requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Send study buddy request error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Could not send study buddy request'
      });
    }
  }
);

// Respond to study buddy request
router.put('/study-buddies/request/:requestId',
  flexibleAuthenticate,
  [
    param('requestId').notEmpty().withMessage('Request ID is required'),
    body('response').isIn(['accepted', 'declined']).withMessage('Response must be accepted or declined'),
    body('message').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { requestId } = req.params;
      const { response, message } = req.body;
      
      const result = await socialLearningService.respondToStudyBuddyRequest(requestId, req.user._id, response, message);
      
      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Respond to study buddy request error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Could not respond to study buddy request'
      });
    }
  }
);

// ============================
// DISCUSSION FORUM ENDPOINTS
// ============================

// Create a new discussion
router.post('/forums/discussions',
  flexibleAuthenticate,
  [
    body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('content').notEmpty().withMessage('Content is required').isLength({ max: 10000 }),
    body('type').optional().isIn(['discussion', 'question', 'announcement', 'poll', 'resource_share', 'study_material']),
    body('category').optional().isIn(['general', 'course_specific', 'q_and_a', 'study_groups', 'announcements', 'feedback', 'technical_support', 'career_advice']),
    body('tags').optional().isArray(),
    body('courseId').optional().isMongoId(),
    body('visibility').optional().isIn(['public', 'private', 'course_only', 'group_only'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId } = req.body;
      const result = await discussionForumService.createDiscussion(req.user._id, req.body, courseId);
      
      res.status(201).json({
        success: true,
        message: 'Discussion created successfully',
        discussion: result.discussion,
        discussionId: result.discussionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Create discussion error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not create discussion'
      });
    }
  }
);

// Reply to a discussion
router.post('/forums/discussions/:discussionId/replies',
  flexibleAuthenticate,
  [
    param('discussionId').notEmpty().withMessage('Discussion ID is required'),
    body('content').notEmpty().withMessage('Content is required').isLength({ max: 5000 }),
    body('parentReplyId').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { discussionId } = req.params;
      const result = await discussionForumService.replyToDiscussion(discussionId, req.user._id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Reply posted successfully',
        reply: result.reply,
        replyId: result.replyId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Reply to discussion error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Could not post reply'
      });
    }
  }
);

// Vote on a post or reply
router.post('/forums/posts/:postId/vote',
  flexibleAuthenticate,
  [
    param('postId').notEmpty().withMessage('Post ID is required'),
    body('voteType').isIn(['upvote', 'downvote', 'neutral']).withMessage('Invalid vote type'),
    body('isReply').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { postId } = req.params;
      const { voteType, isReply = false } = req.body;
      
      const result = await discussionForumService.voteOnPost(postId, req.user._id, voteType, isReply);
      
      res.json({
        success: true,
        message: 'Vote recorded successfully',
        newScore: result.newScore,
        userVote: result.userVote,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Vote on post error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Could not record vote'
      });
    }
  }
);

// Search discussions
router.get('/forums/discussions/search',
  flexibleAuthenticate,
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('category').optional().isString(),
    query('tags').optional().isString(),
    query('courseId').optional().isMongoId(),
    query('type').optional().isString(),
    query('sortBy').optional().isIn(['relevance', 'newest', 'oldest', 'most_voted', 'most_replied']),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const { q: query, ...filters } = req.query;
      
      const result = await discussionForumService.searchDiscussions(query, filters, req.user._id);
      
      res.json({
        success: true,
        discussions: result.discussions,
        totalResults: result.totalResults,
        searchQuery: result.searchQuery,
        filters: result.filters,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search discussions error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not search discussions'
      });
    }
  }
);

// Get popular topics
router.get('/forums/popular',
  flexibleAuthenticate,
  [
    query('courseId').optional().isMongoId(),
    query('timeframe').optional().isIn(['day', 'week', 'month'])
  ],
  async (req, res) => {
    try {
      const { courseId, timeframe = 'week' } = req.query;
      
      const result = await discussionForumService.getPopularTopics(courseId, timeframe);
      
      res.json({
        success: true,
        timeframe: result.timeframe,
        popularTopics: result.popularTopics,
        trendingDiscussions: result.trendingDiscussions,
        topContributors: result.topContributors,
        analytics: result.analytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get popular topics error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve popular topics'
      });
    }
  }
);

// =============================
// COLLABORATION ENDPOINTS
// =============================

// Create collaboration workspace
router.post('/collaboration/workspaces',
  flexibleAuthenticate,
  [
    body('name').notEmpty().withMessage('Workspace name is required').isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('type').optional().isIn(['study_room', 'project_workspace', 'tutoring_session', 'group_assignment', 'exam_prep', 'brainstorming']),
    body('subject').optional().isString(),
    body('maxParticipants').optional().isInt({ min: 2, max: 50 }),
    body('visibility').optional().isIn(['public', 'private', 'course_only'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await collaborationService.createWorkspace(req.user._id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        workspace: result.workspace,
        workspaceId: result.workspaceId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Create workspace error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not create workspace'
      });
    }
  }
);

// Start live session
router.post('/collaboration/sessions',
  flexibleAuthenticate,
  [
    body('title').notEmpty().withMessage('Session title is required').isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('workspaceId').optional().isString(),
    body('mode').optional().isIn(['text_only', 'voice_chat', 'video_call', 'screen_share', 'whiteboard', 'document_edit']),
    body('enableWhiteboard').optional().isBoolean(),
    body('enableScreenShare').optional().isBoolean(),
    body('enableRecording').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await collaborationService.startLiveSession(req.body, req.user._id);
      
      res.status(201).json({
        success: true,
        message: 'Live session started successfully',
        session: result.session,
        sessionId: result.sessionId,
        joinUrl: result.joinUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Start live session error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not start live session'
      });
    }
  }
);

// Join live session
router.post('/collaboration/sessions/:sessionId/join',
  flexibleAuthenticate,
  [
    param('sessionId').notEmpty().withMessage('Session ID is required'),
    body('audioEnabled').optional().isBoolean(),
    body('videoEnabled').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userSettings = {
        audioEnabled: req.body.audioEnabled,
        videoEnabled: req.body.videoEnabled
      };
      
      const result = await collaborationService.joinLiveSession(sessionId, req.user._id, userSettings);
      
      res.json({
        success: true,
        message: 'Joined session successfully',
        session: result.session,
        participantCount: result.participantCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Join live session error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Could not join session'
      });
    }
  }
);

// Send message in session
router.post('/collaboration/sessions/:sessionId/messages',
  flexibleAuthenticate,
  [
    param('sessionId').notEmpty().withMessage('Session ID is required'),
    body('content').notEmpty().withMessage('Message content is required').isLength({ max: 2000 }),
    body('type').optional().isIn(['text', 'file_share', 'screen_annotation', 'reaction', 'poll']),
    body('isPrivate').optional().isBoolean(),
    body('recipientId').optional().isMongoId()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { sessionId } = req.params;
      const result = await collaborationService.sendInstantMessage(sessionId, req.user._id, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Could not send message'
      });
    }
  }
);

// ========================
// ANALYTICS ENDPOINTS
// ========================

// Get social learning analytics
router.get('/analytics/social',
  flexibleAuthenticate,
  [
    query('timeframe').optional().isIn(['week', 'month', 'quarter', 'year'])
  ],
  async (req, res) => {
    try {
      const { timeframe = 'month' } = req.query;
      
      const analytics = await socialLearningService.getSocialLearningAnalytics(req.user._id);
      
      res.json({
        success: true,
        analytics,
        timeframe,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get social analytics error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve social analytics'
      });
    }
  }
);

// Get collaboration analytics
router.get('/analytics/collaboration',
  flexibleAuthenticate,
  [
    query('timeframe').optional().isIn(['week', 'month', 'quarter'])
  ],
  async (req, res) => {
    try {
      const { timeframe = 'month' } = req.query;
      
      const analytics = await collaborationService.getCollaborationAnalytics(req.user._id, timeframe);
      
      res.json({
        success: true,
        analytics,
        timeframe,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get collaboration analytics error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve collaboration analytics'
      });
    }
  }
);

// Get forum analytics
router.get('/analytics/forum',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      const analytics = await discussionForumService.getUserForumAnalytics(req.user._id);
      
      res.json({
        success: true,
        analytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get forum analytics error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve forum analytics'
      });
    }
  }
);

// Enhanced social dashboard (combines all social features)
router.get('/dashboard/social',
  flexibleAuthenticate,
  async (req, res) => {
    try {
      // Get enhanced gamification dashboard with social features
      const dashboard = await gamificationService.getUserDashboard(req.user._id);
      
      res.json({
        success: true,
        dashboard,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get social dashboard error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Could not retrieve social dashboard'
      });
    }
  }
);

// =============================
// MODERATION ENDPOINTS (Admin/Moderator only)
// =============================

// Moderate discussion content
router.post('/forums/moderate/:postId',
  flexibleAuthenticate,
  flexibleAuthorize(['admin', 'moderator']),
  [
    param('postId').notEmpty().withMessage('Post ID is required'),
    body('action').isIn(['approve', 'flag', 'hide', 'delete', 'warning', 'feature']).withMessage('Invalid moderation action'),
    body('reason').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { postId } = req.params;
      const { action, reason } = req.body;
      
      const result = await discussionForumService.moderateContent(postId, req.user._id, action, reason);
      
      res.json({
        success: true,
        message: result.message,
        moderationAction: result.moderationAction,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Moderate content error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Could not moderate content'
      });
    }
  }
);

console.log('✅ Social Learning Routes loaded successfully');

export default router;
