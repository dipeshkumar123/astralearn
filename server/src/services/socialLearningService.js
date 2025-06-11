/**
 * Social Learning Service for AstraLearn
 * Phase 4 Step 2: Advanced Gamification Features - Social Learning Implementation
 * 
 * Provides comprehensive social learning features including:
 * - Study groups and team management
 * - Peer learning and mentorship
 * - Social matching and recommendations
 * - Collaborative learning analytics
 * - Real-time social interactions
 */

console.log('=== Loading SocialLearningService - Phase 4 Step 2 ===');

import { User } from '../models/User.js';
import { UserGamification } from '../models/Gamification.js';
import gamificationService from './gamificationService.js';

class SocialLearningService {
  constructor() {
    console.log('=== Constructing SocialLearningService ===');
    
    this.studyGroupTypes = {
      open: 'Open Study Group',
      private: 'Private Study Group',
      course_specific: 'Course-Specific Group',
      skill_based: 'Skill-Based Group',
      exam_prep: 'Exam Preparation Group'
    };
    
    this.groupRoles = {
      admin: 'Group Administrator',
      moderator: 'Group Moderator', 
      mentor: 'Group Mentor',
      member: 'Group Member',
      observer: 'Observer'
    };
    
    this.matchingCriteria = {
      learning_style: 0.3,
      performance_level: 0.25,
      study_schedule: 0.2,
      subject_interests: 0.15,
      personality_fit: 0.1
    };
    
    this.interactionTypes = {
      message: 'Direct Message',
      help_request: 'Help Request',
      study_invite: 'Study Session Invite',
      resource_share: 'Resource Sharing',
      feedback: 'Feedback Exchange',
      mentorship: 'Mentorship Interaction'
    };
  }

  /**
   * Create a new study group
   */
  async createStudyGroup(groupData, creatorId) {
    try {
      console.log('Creating study group:', groupData.name);
      
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const studyGroup = {
        groupId,
        name: groupData.name,
        description: groupData.description || '',
        type: groupData.type || 'open',
        subject: groupData.subject,
        maxMembers: groupData.maxMembers || 20,
        createdBy: creatorId,
        createdAt: new Date(),
        status: 'active',
        members: [{
          userId: creatorId,
          role: 'admin',
          joinedAt: new Date(),
          isActive: true
        }],
        settings: {
          isPublic: groupData.isPublic !== false,
          allowInvites: groupData.allowInvites !== false,
          requireApproval: groupData.requireApproval || false,
          studySchedule: groupData.studySchedule || {},
          notifications: {
            newMembers: true,
            studySessions: true,
            achievements: true
          }
        },
        analytics: {
          totalSessions: 0,
          totalStudyTime: 0,
          averageAttendance: 0,
          memberEngagement: {},
          performanceMetrics: {}
        }
      };
      
      // Store in cache/database (simulated for now)
      await this.saveStudyGroup(studyGroup);
      
      // Award points for group creation
      await gamificationService.awardPoints(creatorId, 'create_content', {
        contentType: 'study_group',
        groupId,
        description: `Created study group: ${groupData.name}`
      });
      
      console.log('Study group created successfully:', groupId);
      return {
        success: true,
        studyGroup,
        groupId
      };
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  }

  /**
   * Join a study group
   */
  async joinStudyGroup(userId, groupId, inviteCode = null) {
    try {
      console.log('User joining study group:', userId, groupId);
      
      const studyGroup = await this.getStudyGroup(groupId);
      if (!studyGroup) {
        throw new Error('Study group not found');
      }
      
      // Check if user is already a member
      const existingMember = studyGroup.members.find(member => 
        member.userId.toString() === userId.toString()
      );
      
      if (existingMember) {
        if (existingMember.isActive) {
          throw new Error('User is already a member of this group');
        } else {
          // Reactivate membership
          existingMember.isActive = true;
          existingMember.rejoinedAt = new Date();
        }
      } else {
        // Add new member
        studyGroup.members.push({
          userId,
          role: 'member',
          joinedAt: new Date(),
          isActive: true
        });
      }
      
      // Check group capacity
      const activeMembers = studyGroup.members.filter(m => m.isActive);
      if (activeMembers.length > studyGroup.maxMembers) {
        throw new Error('Study group is at maximum capacity');
      }
      
      await this.saveStudyGroup(studyGroup);
      
      // Award points for joining group
      await gamificationService.awardPoints(userId, 'study_group_activity', {
        activityType: 'join_group',
        groupId,
        groupName: studyGroup.name,
        description: `Joined study group: ${studyGroup.name}`
      });
      
      // Update user statistics
      await this.updateUserSocialStats(userId, 'study_group_joined');
      
      return {
        success: true,
        message: 'Successfully joined study group',
        studyGroup: this.sanitizeStudyGroupForUser(studyGroup, userId)
      };
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  }

  /**
   * Find study buddy matches for a user
   */
  async findStudyBuddies(userId, preferences = {}) {
    try {
      console.log('Finding study buddies for user:', userId);
      
      const user = await User.findById(userId);
      const userProfile = await gamificationService.getUserGamificationProfile(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get potential matches
      const candidates = await this.getStudyBuddyCandidates(userId, preferences);
      
      // Score and rank candidates
      const rankedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          const compatibility = await this.calculateCompatibilityScore(user, candidate, userProfile);
          return {
            ...candidate,
            compatibilityScore: compatibility.score,
            compatibilityReasons: compatibility.reasons,
            sharedInterests: compatibility.sharedInterests
          };
        })
      );
      
      // Sort by compatibility score
      rankedCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      
      return {
        success: true,
        studyBuddies: rankedCandidates.slice(0, 10),
        totalCandidates: candidates.length,
        criteria: this.matchingCriteria
      };
    } catch (error) {
      console.error('Error finding study buddies:', error);
      throw error;
    }
  }

  /**
   * Send a study buddy request
   */
  async sendStudyBuddyRequest(fromUserId, toUserId, message = '') {
    try {
      console.log('Sending study buddy request:', fromUserId, '->', toUserId);
      
      const requestId = `buddy_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const request = {
        requestId,
        fromUserId,
        toUserId,
        message,
        type: 'study_buddy',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };
      
      await this.saveBuddyRequest(request);
      
      // Send real-time notification
      await this.sendRealTimeNotification(toUserId, {
        type: 'study_buddy_request',
        fromUserId,
        requestId,
        message: 'You have a new study buddy request!'
      });
      
      return {
        success: true,
        requestId,
        message: 'Study buddy request sent successfully'
      };
    } catch (error) {
      console.error('Error sending study buddy request:', error);
      throw error;
    }
  }

  /**
   * Respond to study buddy request
   */
  async respondToStudyBuddyRequest(requestId, userId, response, message = '') {
    try {
      console.log('Responding to study buddy request:', requestId, response);
      
      const request = await this.getBuddyRequest(requestId);
      if (!request) {
        throw new Error('Study buddy request not found');
      }
      
      if (request.toUserId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to respond to this request');
      }
      
      if (request.status !== 'pending') {
        throw new Error('Request has already been responded to');
      }
      
      request.status = response; // 'accepted' or 'declined'
      request.responseMessage = message;
      request.respondedAt = new Date();
      
      await this.saveBuddyRequest(request);
      
      if (response === 'accepted') {
        // Create study buddy relationship
        await this.createStudyBuddyRelationship(request.fromUserId, request.toUserId);
        
        // Award points for both users
        await gamificationService.awardPoints(request.fromUserId, 'social_interaction', {
          interactionType: 'study_buddy_accepted',
          buddyId: request.toUserId
        });
        
        await gamificationService.awardPoints(request.toUserId, 'social_interaction', {
          interactionType: 'study_buddy_accepted',
          buddyId: request.fromUserId
        });
      }
      
      // Notify the requester
      await this.sendRealTimeNotification(request.fromUserId, {
        type: 'study_buddy_response',
        fromUserId: userId,
        response,
        message: response === 'accepted' ? 'Your study buddy request was accepted!' : 'Your study buddy request was declined.'
      });
      
      return {
        success: true,
        message: `Study buddy request ${response} successfully`
      };
    } catch (error) {
      console.error('Error responding to study buddy request:', error);
      throw error;
    }
  }

  /**
   * Schedule a study session
   */
  async scheduleStudySession(organizerId, sessionData) {
    try {
      console.log('Scheduling study session:', sessionData.title);
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const studySession = {
        sessionId,
        title: sessionData.title,
        description: sessionData.description || '',
        organizerId,
        scheduledAt: new Date(sessionData.scheduledAt),
        duration: sessionData.duration || 60, // minutes
        type: sessionData.type || 'general', // general, exam_prep, project_work
        isPublic: sessionData.isPublic !== false,
        maxParticipants: sessionData.maxParticipants || 10,
        subject: sessionData.subject,
        difficulty: sessionData.difficulty || 'intermediate',
        participants: [{
          userId: organizerId,
          role: 'organizer',
          joinedAt: new Date(),
          status: 'confirmed'
        }],
        resources: sessionData.resources || [],
        agenda: sessionData.agenda || [],
        status: 'scheduled',
        createdAt: new Date()
      };
      
      await this.saveStudySession(studySession);
      
      // Award points for organizing session
      await gamificationService.awardPoints(organizerId, 'study_group_activity', {
        activityType: 'organize_session',
        sessionId,
        description: `Organized study session: ${sessionData.title}`
      });
      
      return {
        success: true,
        studySession,
        sessionId
      };
    } catch (error) {
      console.error('Error scheduling study session:', error);
      throw error;
    }
  }

  /**
   * Get social learning analytics for a user
   */
  async getSocialLearningAnalytics(userId) {
    try {
      const userProfile = await gamificationService.getUserGamificationProfile(userId);
      const socialActivities = await this.getUserSocialActivities(userId);
      const studyGroups = await this.getUserStudyGroups(userId);
      const studyBuddies = await this.getUserStudyBuddies(userId);
      
      return {
        overview: {
          totalSocialInteractions: socialActivities.length,
          activeStudyGroups: studyGroups.filter(g => g.isActive).length,
          studyBuddyCount: studyBuddies.length,
          helpfulnessRating: await this.getHelpfulnessRating(userId),
          collaborationScore: await gamificationService.calculateCollaborationScore(userId)
        },
        weeklyStats: await this.getWeeklySocialStats(userId),
        engagementTrends: await this.getSocialEngagementTrends(userId),
        peerFeedback: await this.getPeerFeedback(userId),
        achievements: await this.getSocialAchievements(userId),
        recommendations: await this.getSocialRecommendations(userId)
      };
    } catch (error) {
      console.error('Error getting social learning analytics:', error);
      return {};
    }
  }

  /**
   * Helper methods for social learning features
   */
  
  async calculateCompatibilityScore(user1, user2, userProfile) {
    // Implementation for compatibility scoring
    const compatibility = {
      score: 0,
      reasons: [],
      sharedInterests: []
    };
    
    // Learning style compatibility
    if (user1.learningStyleAssessment?.dominantStyle === user2.learningStyleAssessment?.dominantStyle) {
      compatibility.score += this.matchingCriteria.learning_style * 100;
      compatibility.reasons.push('Similar learning styles');
    }
    
    // Performance level compatibility
    const performanceDiff = Math.abs((user1.performance || 0) - (user2.performance || 0));
    if (performanceDiff <= 20) {
      compatibility.score += this.matchingCriteria.performance_level * 100;
      compatibility.reasons.push('Similar performance levels');
    }
    
    return compatibility;
  }

  async updateUserSocialStats(userId, statType) {
    try {
      const profile = await gamificationService.getUserGamificationProfile(userId);
      
      switch (statType) {
        case 'study_group_joined':
          profile.statistics.studyGroupsJoined = (profile.statistics.studyGroupsJoined || 0) + 1;
          break;
        case 'forum_contribution':
          profile.statistics.forumContributions = (profile.statistics.forumContributions || 0) + 1;
          break;
        case 'peer_review':
          profile.statistics.peerReviewsCompleted = (profile.statistics.peerReviewsCompleted || 0) + 1;
          break;
        case 'mentoring_session':
          profile.statistics.mentoringSessions = (profile.statistics.mentoringSessions || 0) + 1;
          break;
      }
      
      await profile.save();
    } catch (error) {
      console.error('Error updating user social stats:', error);
    }
  }

  sanitizeStudyGroupForUser(studyGroup, userId) {
    // Remove sensitive information and add user-specific data
    const sanitized = { ...studyGroup };
    
    // Add user's role in the group
    const userMember = studyGroup.members.find(m => m.userId.toString() === userId.toString());
    sanitized.userRole = userMember?.role || null;
    
    // Remove private member information if user is not admin
    if (userMember?.role !== 'admin') {
      sanitized.members = sanitized.members.map(member => ({
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        isActive: member.isActive
      }));
    }
    
    return sanitized;
  }

  // Placeholder methods for database operations (to be implemented with actual database)
  async saveStudyGroup(studyGroup) {
    // Implementation for saving study group to database
    console.log('Saving study group:', studyGroup.groupId);
  }

  async getStudyGroup(groupId) {
    // Implementation for retrieving study group from database
    console.log('Getting study group:', groupId);
    return null; // Placeholder
  }

  async saveBuddyRequest(request) {
    // Implementation for saving buddy request
    console.log('Saving buddy request:', request.requestId);
  }

  async getBuddyRequest(requestId) {
    // Implementation for retrieving buddy request
    console.log('Getting buddy request:', requestId);
    return null; // Placeholder
  }

  async saveStudySession(session) {
    // Implementation for saving study session
    console.log('Saving study session:', session.sessionId);
  }

  async createStudyBuddyRelationship(userId1, userId2) {
    // Implementation for creating study buddy relationship
    console.log('Creating study buddy relationship:', userId1, userId2);
  }

  async sendRealTimeNotification(userId, notification) {
    // Implementation for sending real-time notifications
    console.log('Sending notification to:', userId, notification);
  }

  async getStudyBuddyCandidates(userId, preferences) {
    // Implementation for getting study buddy candidates
    return [];
  }

  // Additional placeholder methods
  async getUserSocialActivities(userId) { return []; }
  async getUserStudyGroups(userId) { return []; }
  async getUserStudyBuddies(userId) { return []; }
  async getHelpfulnessRating(userId) { return 0; }
  async getWeeklySocialStats(userId) { return {}; }
  async getSocialEngagementTrends(userId) { return {}; }
  async getPeerFeedback(userId) { return []; }
  async getSocialAchievements(userId) { return []; }
  async getSocialRecommendations(userId) { return []; }
}

const socialLearningService = new SocialLearningService();

// Test the service
try {
  console.log('✅ SocialLearningService initialized successfully');
} catch (error) {
  console.error('❌ SocialLearningService initialization failed:', error);
}

export default socialLearningService;
