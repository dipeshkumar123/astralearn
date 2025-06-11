/**
 * Discussion Forum Service for AstraLearn
 * Phase 4 Step 2: Advanced Gamification Features - Community Forums Implementation
 * 
 * Provides comprehensive discussion forum features including:
 * - Course-specific discussion boards
 * - Q&A format with voting and best answers
 * - Tag-based organization and search
 * - Moderation tools and content guidelines
 * - Community engagement tracking
 */

console.log('=== Loading DiscussionForumService - Phase 4 Step 2 ===');

import { User } from '../models/User.js';
import gamificationService from './gamificationService.js';

class DiscussionForumService {
  constructor() {
    console.log('=== Constructing DiscussionForumService ===');
    
    this.forumCategories = {
      general: 'General Discussion',
      course_specific: 'Course-Specific',
      q_and_a: 'Questions & Answers',
      study_groups: 'Study Groups',
      announcements: 'Announcements',
      feedback: 'Feedback & Suggestions',
      technical_support: 'Technical Support',
      career_advice: 'Career & Professional Development'
    };
    
    this.postTypes = {
      discussion: 'Discussion Thread',
      question: 'Question',
      announcement: 'Announcement',
      poll: 'Poll',
      resource_share: 'Resource Sharing',
      study_material: 'Study Material'
    };
    
    this.voteTypes = {
      upvote: 1,
      downvote: -1,
      neutral: 0
    };
    
    this.moderationActions = {
      approve: 'Approve Content',
      flag: 'Flag for Review',
      hide: 'Hide Content',
      delete: 'Delete Content',
      warning: 'Issue Warning',
      feature: 'Feature Content'
    };
    
    this.engagementWeights = {
      view: 1,
      vote: 3,
      reply: 5,
      best_answer: 10,
      feature: 15
    };
  }

  /**
   * Create a new discussion post
   */
  async createDiscussion(userId, discussionData, courseId = null) {
    try {
      console.log('Creating discussion post:', discussionData.title);
      
      const discussionId = `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const discussion = {
        discussionId,
        title: discussionData.title,
        content: discussionData.content,
        type: discussionData.type || 'discussion',
        category: discussionData.category || 'general',
        tags: discussionData.tags || [],
        authorId: userId,
        courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        visibility: discussionData.visibility || 'public',
        replies: [],
        votes: {
          upvotes: 0,
          downvotes: 0,
          score: 0,
          voters: []
        },
        engagement: {
          views: 0,
          replyCount: 0,
          lastActivity: new Date(),
          participantCount: 1,
          avgRating: 0
        },
        moderation: {
          isModerated: false,
          flags: [],
          moderatorActions: [],
          isFeatured: false
        },
        metadata: {
          attachments: discussionData.attachments || [],
          difficulty: discussionData.difficulty,
          estimatedReadTime: this.calculateReadTime(discussionData.content),
          relatedTopics: discussionData.relatedTopics || []
        }
      };
      
      await this.saveDiscussion(discussion);
      
      // Award points for creating discussion
      await gamificationService.awardPoints(userId, 'forum_contribution', {
        contributionType: 'create_discussion',
        discussionId,
        category: discussionData.category,
        description: `Created discussion: ${discussionData.title}`
      });
      
      // Update user forum statistics
      await this.updateUserForumStats(userId, 'discussion_created');
      
      console.log('Discussion created successfully:', discussionId);
      return {
        success: true,
        discussion,
        discussionId
      };
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  }

  /**
   * Reply to a discussion
   */
  async replyToDiscussion(discussionId, userId, replyData) {
    try {
      console.log('Adding reply to discussion:', discussionId);
      
      const discussion = await this.getDiscussion(discussionId);
      if (!discussion) {
        throw new Error('Discussion not found');
      }
      
      const replyId = `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const reply = {
        replyId,
        content: replyData.content,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentReplyId: replyData.parentReplyId || null, // For nested replies
        votes: {
          upvotes: 0,
          downvotes: 0,
          score: 0,
          voters: []
        },
        moderation: {
          isModerated: false,
          flags: [],
          isHidden: false
        },
        metadata: {
          attachments: replyData.attachments || [],
          isAnswer: false,
          isBestAnswer: false,
          helpfulVotes: 0
        }
      };
      
      discussion.replies.push(reply);
      discussion.engagement.replyCount = discussion.replies.length;
      discussion.engagement.lastActivity = new Date();
      discussion.updatedAt = new Date();
      
      await this.saveDiscussion(discussion);
      
      // Award points for replying
      await gamificationService.awardPoints(userId, 'forum_contribution', {
        contributionType: 'reply_discussion',
        discussionId,
        replyId,
        description: `Replied to discussion: ${discussion.title}`
      });
      
      // Update user forum statistics
      await this.updateUserForumStats(userId, 'reply_posted');
      
      // Send notification to discussion author (if different user)
      if (discussion.authorId.toString() !== userId.toString()) {
        await this.sendForumNotification(discussion.authorId, {
          type: 'discussion_reply',
          discussionId,
          replyId,
          authorId: userId,
          message: 'Someone replied to your discussion'
        });
      }
      
      return {
        success: true,
        reply,
        replyId
      };
    } catch (error) {
      console.error('Error replying to discussion:', error);
      throw error;
    }
  }

  /**
   * Vote on a post or reply
   */
  async voteOnPost(postId, userId, voteType, isReply = false) {
    try {
      console.log('Voting on post:', postId, voteType);
      
      if (!['upvote', 'downvote', 'neutral'].includes(voteType)) {
        throw new Error('Invalid vote type');
      }
      
      const discussion = await this.getDiscussionByPostId(postId, isReply);
      if (!discussion) {
        throw new Error('Post not found');
      }
      
      let post;
      if (isReply) {
        post = discussion.replies.find(reply => reply.replyId === postId);
      } else {
        post = discussion;
      }
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Check if user has already voted
      const existingVoteIndex = post.votes.voters.findIndex(voter => 
        voter.userId.toString() === userId.toString()
      );
      
      const voteValue = this.voteTypes[voteType];
      
      if (existingVoteIndex >= 0) {
        // Update existing vote
        const oldVote = post.votes.voters[existingVoteIndex];
        post.votes.voters[existingVoteIndex] = {
          userId,
          vote: voteValue,
          votedAt: new Date()
        };
        
        // Update vote counts
        this.updateVoteCounts(post, oldVote.vote, voteValue);
      } else {
        // Add new vote
        post.votes.voters.push({
          userId,
          vote: voteValue,
          votedAt: new Date()
        });
        
        this.updateVoteCounts(post, 0, voteValue);
      }
      
      await this.saveDiscussion(discussion);
      
      // Award points for voting
      if (voteType !== 'neutral') {
        await gamificationService.awardPoints(userId, 'discussion_vote', {
          voteType,
          postId,
          isReply,
          description: `Voted ${voteType} on ${isReply ? 'reply' : 'discussion'}`
        });
      }
      
      // Award points to post author for receiving upvote
      if (voteType === 'upvote' && post.authorId.toString() !== userId.toString()) {
        await gamificationService.awardPoints(post.authorId, 'community_support', {
          supportType: 'received_upvote',
          fromUserId: userId,
          postId,
          description: 'Received upvote on forum post'
        });
      }
      
      return {
        success: true,
        newScore: post.votes.score,
        userVote: voteValue
      };
    } catch (error) {
      console.error('Error voting on post:', error);
      throw error;
    }
  }

  /**
   * Mark a reply as the best answer
   */
  async markBestAnswer(discussionId, replyId, userId) {
    try {
      console.log('Marking best answer:', discussionId, replyId);
      
      const discussion = await this.getDiscussion(discussionId);
      if (!discussion) {
        throw new Error('Discussion not found');
      }
      
      // Only discussion author or moderators can mark best answer
      if (discussion.authorId.toString() !== userId.toString()) {
        const userRole = await this.getUserForumRole(userId);
        if (!['moderator', 'admin'].includes(userRole)) {
          throw new Error('Unauthorized to mark best answer');
        }
      }
      
      // Remove existing best answer
      discussion.replies.forEach(reply => {
        reply.metadata.isBestAnswer = false;
      });
      
      // Mark new best answer
      const reply = discussion.replies.find(r => r.replyId === replyId);
      if (!reply) {
        throw new Error('Reply not found');
      }
      
      reply.metadata.isBestAnswer = true;
      reply.metadata.bestAnswerMarkedAt = new Date();
      reply.metadata.markedBy = userId;
      
      await this.saveDiscussion(discussion);
      
      // Award points to reply author for best answer
      await gamificationService.awardPoints(reply.authorId, 'answer_accepted', {
        discussionId,
        replyId,
        markedBy: userId,
        description: 'Answer marked as best answer'
      });
      
      // Send notification to reply author
      await this.sendForumNotification(reply.authorId, {
        type: 'best_answer_marked',
        discussionId,
        replyId,
        markedBy: userId,
        message: 'Your answer was marked as the best answer!'
      });
      
      return {
        success: true,
        message: 'Reply marked as best answer'
      };
    } catch (error) {
      console.error('Error marking best answer:', error);
      throw error;
    }
  }

  /**
   * Search discussions
   */
  async searchDiscussions(query, filters = {}, userId = null) {
    try {
      console.log('Searching discussions:', query);
      
      const searchFilters = {
        query: query.toLowerCase(),
        category: filters.category,
        tags: filters.tags,
        courseId: filters.courseId,
        type: filters.type,
        dateRange: filters.dateRange,
        sortBy: filters.sortBy || 'relevance',
        limit: filters.limit || 20,
        offset: filters.offset || 0
      };
      
      // Get discussions (mock implementation)
      const discussions = await this.getDiscussionsWithFilters(searchFilters);
      
      // Apply relevance scoring
      const scoredDiscussions = discussions.map(discussion => ({
        ...discussion,
        relevanceScore: this.calculateRelevanceScore(discussion, query, userId),
        matchedTerms: this.getMatchedTerms(discussion, query)
      }));
      
      // Sort by relevance or other criteria
      this.sortDiscussions(scoredDiscussions, searchFilters.sortBy);
      
      return {
        success: true,
        discussions: scoredDiscussions.slice(searchFilters.offset, searchFilters.offset + searchFilters.limit),
        totalResults: scoredDiscussions.length,
        searchQuery: query,
        filters: searchFilters
      };
    } catch (error) {
      console.error('Error searching discussions:', error);
      throw error;
    }
  }

  /**
   * Get popular topics and trending discussions
   */
  async getPopularTopics(courseId = null, timeframe = 'week') {
    try {
      console.log('Getting popular topics for timeframe:', timeframe);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }
      
      const popularTopics = await this.getTopicsWithEngagement(startDate, endDate, courseId);
      const trendingDiscussions = await this.getTrendingDiscussions(startDate, endDate, courseId);
      const topContributors = await this.getTopContributors(startDate, endDate, courseId);
      
      return {
        success: true,
        timeframe,
        popularTopics: popularTopics.slice(0, 10),
        trendingDiscussions: trendingDiscussions.slice(0, 15),
        topContributors: topContributors.slice(0, 10),
        analytics: {
          totalDiscussions: await this.getDiscussionCount(startDate, endDate, courseId),
          totalReplies: await this.getReplyCount(startDate, endDate, courseId),
          activeUsers: await this.getActiveUserCount(startDate, endDate, courseId)
        }
      };
    } catch (error) {
      console.error('Error getting popular topics:', error);
      throw error;
    }
  }

  /**
   * Moderate content
   */
  async moderateContent(postId, moderatorId, action, reason = '') {
    try {
      console.log('Moderating content:', postId, action);
      
      const moderatorRole = await this.getUserForumRole(moderatorId);
      if (!['moderator', 'admin'].includes(moderatorRole)) {
        throw new Error('Insufficient permissions to moderate content');
      }
      
      const discussion = await this.getDiscussionByPostId(postId);
      if (!discussion) {
        throw new Error('Content not found');
      }
      
      const moderationAction = {
        actionId: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        moderatorId,
        reason,
        timestamp: new Date()
      };
      
      // Apply moderation action
      switch (action) {
        case 'approve':
          discussion.moderation.isModerated = true;
          discussion.status = 'active';
          break;
        case 'hide':
          discussion.status = 'hidden';
          break;
        case 'delete':
          discussion.status = 'deleted';
          break;
        case 'feature':
          discussion.moderation.isFeatured = true;
          break;
        case 'flag':
          discussion.moderation.flags.push({
            flaggedBy: moderatorId,
            reason,
            timestamp: new Date()
          });
          break;
      }
      
      discussion.moderation.moderatorActions.push(moderationAction);
      await this.saveDiscussion(discussion);
      
      // Send notification to content author
      await this.sendForumNotification(discussion.authorId, {
        type: 'content_moderated',
        action,
        reason,
        postId,
        message: `Your content has been ${action}ed by a moderator`
      });
      
      return {
        success: true,
        message: `Content ${action}ed successfully`,
        moderationAction
      };
    } catch (error) {
      console.error('Error moderating content:', error);
      throw error;
    }
  }

  /**
   * Get forum analytics for a user
   */
  async getUserForumAnalytics(userId) {
    try {
      const userDiscussions = await this.getUserDiscussions(userId);
      const userReplies = await this.getUserReplies(userId);
      const userVotes = await this.getUserVotes(userId);
      
      const analytics = {
        overview: {
          totalDiscussions: userDiscussions.length,
          totalReplies: userReplies.length,
          totalVotesReceived: this.calculateTotalVotesReceived(userDiscussions, userReplies),
          bestAnswersCount: userReplies.filter(reply => reply.metadata.isBestAnswer).length,
          helpfulnessRating: await this.calculateHelpfulnessRating(userId)
        },
        engagement: {
          averageResponseTime: this.calculateAverageResponseTime(userReplies),
          participationRate: await this.calculateParticipationRate(userId),
          topCategories: this.getTopCategories(userDiscussions),
          engagementTrend: await this.getEngagementTrend(userId)
        },
        reputation: {
          forumReputation: await this.calculateForumReputation(userId),
          contributorLevel: await this.getContributorLevel(userId),
          specializations: await this.getForumSpecializations(userId),
          achievements: await this.getForumAchievements(userId)
        }
      };
      
      return analytics;
    } catch (error) {
      console.error('Error getting user forum analytics:', error);
      return {};
    }
  }

  /**
   * Helper methods
   */
  
  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  updateVoteCounts(post, oldVote, newVote) {
    // Remove old vote
    if (oldVote === 1) post.votes.upvotes--;
    else if (oldVote === -1) post.votes.downvotes--;
    
    // Add new vote
    if (newVote === 1) post.votes.upvotes++;
    else if (newVote === -1) post.votes.downvotes++;
    
    // Update score
    post.votes.score = post.votes.upvotes - post.votes.downvotes;
  }

  calculateRelevanceScore(discussion, query, userId) {
    let score = 0;
    const queryTerms = query.toLowerCase().split(' ');
    
    // Title match (highest weight)
    queryTerms.forEach(term => {
      if (discussion.title.toLowerCase().includes(term)) {
        score += 10;
      }
    });
    
    // Content match
    queryTerms.forEach(term => {
      if (discussion.content.toLowerCase().includes(term)) {
        score += 5;
      }
    });
    
    // Tag match
    queryTerms.forEach(term => {
      if (discussion.tags.some(tag => tag.toLowerCase().includes(term))) {
        score += 7;
      }
    });
    
    // Engagement boost
    score += Math.log(discussion.engagement.views + 1) * 2;
    score += discussion.votes.score * 3;
    score += discussion.engagement.replyCount * 2;
    
    return score;
  }

  sortDiscussions(discussions, sortBy) {
    switch (sortBy) {
      case 'relevance':
        discussions.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'newest':
        discussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        discussions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'most_voted':
        discussions.sort((a, b) => b.votes.score - a.votes.score);
        break;
      case 'most_replied':
        discussions.sort((a, b) => b.engagement.replyCount - a.engagement.replyCount);
        break;
      default:
        discussions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  async updateUserForumStats(userId, statType) {
    try {
      await gamificationService.updateUserStatistics(userId, 'forum_activity', { statType });
    } catch (error) {
      console.error('Error updating user forum stats:', error);
    }
  }

  // Placeholder methods for database operations (to be implemented)
  async saveDiscussion(discussion) {
    console.log('Saving discussion:', discussion.discussionId);
  }

  async getDiscussion(discussionId) {
    console.log('Getting discussion:', discussionId);
    return null; // Placeholder
  }

  async getDiscussionByPostId(postId, isReply = false) {
    console.log('Getting discussion by post ID:', postId);
    return null; // Placeholder
  }

  async sendForumNotification(userId, notification) {
    console.log('Sending forum notification:', userId, notification);
  }

  async getUserForumRole(userId) {
    return 'member'; // Placeholder
  }

  async getDiscussionsWithFilters(filters) {
    return []; // Placeholder
  }

  // Additional placeholder methods
  getMatchedTerms(discussion, query) { return []; }
  async getTopicsWithEngagement(start, end, courseId) { return []; }
  async getTrendingDiscussions(start, end, courseId) { return []; }
  async getTopContributors(start, end, courseId) { return []; }
  async getDiscussionCount(start, end, courseId) { return 0; }
  async getReplyCount(start, end, courseId) { return 0; }
  async getActiveUserCount(start, end, courseId) { return 0; }
  async getUserDiscussions(userId) { return []; }
  async getUserReplies(userId) { return []; }
  async getUserVotes(userId) { return []; }
  calculateTotalVotesReceived(discussions, replies) { return 0; }
  async calculateHelpfulnessRating(userId) { return 0; }
  calculateAverageResponseTime(replies) { return 0; }
  async calculateParticipationRate(userId) { return 0; }
  getTopCategories(discussions) { return []; }
  async getEngagementTrend(userId) { return []; }
  async calculateForumReputation(userId) { return 0; }
  async getContributorLevel(userId) { return 'Beginner'; }
  async getForumSpecializations(userId) { return []; }
  async getForumAchievements(userId) { return []; }
}

const discussionForumService = new DiscussionForumService();

// Test the service
try {
  console.log('✅ DiscussionForumService initialized successfully');
} catch (error) {
  console.error('❌ DiscussionForumService initialization failed:', error);
}

export default discussionForumService;
