// Advanced Gamification service for AstraLearn - Phase 4 Step 2
console.log('=== Loading Advanced GamificationService v4 - Phase 4 Step 2 ===');

import { UserGamification, PointsActivity, Achievement, Badge, Leaderboard } from '../models/Gamification.js';
import { User } from '../models/User.js';
import challengeService from './challengeService.js';

class GamificationService {
  constructor() {
    console.log('=== Constructing Advanced GamificationService v4 - Social Features ===');
    this.levelThresholds = [
      0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 25000, 35000, 50000, 75000
    ];
    
    this.pointValues = {
      lesson_complete: 10,
      assessment_complete: 25,
      daily_login: 5,
      streak_bonus: 10,
      collaboration: 15,
      help_peer: 20,
      create_content: 30,
      challenge_complete: 50,
      level_up: 100,
      // New social activity point values
      social_interaction: 5,
      peer_help: 15,
      study_group_activity: 20,
      forum_contribution: 10,
      discussion_vote: 2,
      answer_accepted: 25,
      mentor_session: 40,
      knowledge_share: 15,
      peer_review: 20,
      community_support: 12,
      group_milestone: 30,
      collaboration_bonus: 10
    };
    
    this.streakBonusMultipliers = {
      7: 1.2,   // 7-day streak: 20% bonus
      14: 1.5,  // 14-day streak: 50% bonus
      30: 2.0,  // 30-day streak: 100% bonus
      60: 2.5,  // 60-day streak: 150% bonus
      100: 3.0  // 100-day streak: 200% bonus
    };

    this.leaderboardTypes = {
      global: 'Global Rankings',
      course: 'Course-Specific Rankings',
      weekly: 'Weekly Competition',
      monthly: 'Monthly Competition',
      friends: 'Friend Circle Rankings',
      study_group: 'Study Group Rankings',
      collaborative: 'Collaboration Leaders',
      mentorship: 'Top Mentors',
      community: 'Community Contributors'
    };

    this.socialAchievementTypes = {
      mentor: 'Mentoring & Helping Others',
      collaborator: 'Team Collaboration',
      community: 'Community Engagement',
      leader: 'Leadership & Initiative',
      supporter: 'Peer Support',
      contributor: 'Content Creation'
    };

    // Social recommendation weights
    this.socialRecommendationWeights = {
      similar_performance: 0.3,
      complementary_skills: 0.25,
      learning_style_match: 0.2,
      activity_overlap: 0.15,
      engagement_level: 0.1
    };
  }

  test() {
    console.log('🧪 Advanced GamificationService v4 - Social Features Test');
    return true;
  }

  /**
   * Get comprehensive user dashboard with advanced social features
   */
  async getUserDashboard(userId) {
    try {
      console.log('Getting advanced social dashboard for user:', userId);
      
      // Get user gamification profile
      const profile = await this.getUserGamificationProfile(userId);
      
      // Get recent activities including social activities
      const recentActivities = await PointsActivity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(15)
        .lean();
      
      // Get active challenges
      const activeChallenges = await challengeService.getActiveChallenges(userId, { 
        includeJoined: true, 
        includeAvailable: false,
        limit: 5 
      });
      
      // Get upcoming challenges
      const upcomingChallenges = await challengeService.getUpcomingChallenges(userId, { limit: 3 });
      
      // Get achievements in progress
      const achievementProgress = await this.getAchievementsInProgress(userId);
      
      // Get social stats including peer interactions
      const socialStats = await this.getSocialStats(userId);
      
      // Get personalized social recommendations
      const socialRecommendations = await this.getPersonalizedSocialRecommendations(userId);
      
      // Get collaborative milestones
      const collaborativeMilestones = await this.getCollaborativeMilestones(userId);
      
      // Calculate level progress
      const levelProgress = this.calculateLevelProgress(profile.totalPoints);
      
      // Get user rank with social context
      const globalRank = await this.getUserGlobalRank(userId);
      const socialRank = await this.getUserSocialRank(userId);
      
      return {
        profile: {
          totalPoints: profile.totalPoints,
          level: profile.level,
          currentStreak: profile.streaks.current.dailyLearning,
          longestStreak: profile.streaks.longest.dailyLearning,
          globalRank: globalRank.rank,
          socialRank: socialRank.rank,
          levelProgress: levelProgress.percentage,
          pointsToNextLevel: levelProgress.pointsToNext,
          badges: profile.badges.length,
          achievements: profile.achievements.length,
          collaborationScore: socialStats.collaborationScore,
          mentorshipLevel: socialStats.mentorshipLevel
        },
        badges: profile.badges.slice(-5), // Last 5 earned badges
        achievements: achievementProgress.slice(0, 4), // Top 4 in progress
        recentActivities: recentActivities.map(activity => ({
          type: activity.activityType,
          points: activity.points,
          description: activity.description,
          timestamp: activity.createdAt,
          metadata: activity.metadata,
          isSocial: this.isSocialActivity(activity.activityType)
        })),
        streakInfo: {
          current: profile.streaks.current.dailyLearning,
          multiplier: this.getStreakMultiplier(profile.streaks.current.dailyLearning),
          nextThreshold: this.getNextStreakThreshold(profile.streaks.current.dailyLearning)
        },
        challenges: {
          active: activeChallenges.challenges || [],
          upcoming: upcomingChallenges.challenges || []
        },
        socialStats,
        socialRecommendations,
        collaborativeMilestones,
        pointsBreakdown: {
          ...profile.pointsBreakdown,
          social: this.calculateSocialPoints(recentActivities),
          collaborative: this.calculateCollaborativePoints(recentActivities)
        },
        statistics: profile.statistics
      };
    } catch (error) {
      console.error('Error in getUserDashboard:', error);
      // Return fallback data
      return {
        profile: { 
          totalPoints: 0, 
          level: 1, 
          currentStreak: 0, 
          longestStreak: 0,
          globalRank: 'N/A',
          socialRank: 'N/A',
          levelProgress: 0,
          pointsToNextLevel: 100,
          badges: 0,
          achievements: 0,
          collaborationScore: 0,
          mentorshipLevel: 'Beginner'
        },
        badges: [],
        achievements: [],
        recentActivities: [],
        streakInfo: { 
          current: 0, 
          multiplier: 1.0, 
          nextThreshold: { days: 7, multiplier: 1.2 }
        },
        challenges: { active: [], upcoming: [] },
        socialStats: {},
        socialRecommendations: {},
        collaborativeMilestones: [],
        pointsBreakdown: {},
        statistics: {}
      };
    }
  }

  /**
   * Get or create user gamification profile
   */
  async getUserGamificationProfile(userId) {
    try {
      let profile = await UserGamification.findOne({ userId });
      
      if (!profile) {
        // Create new profile for user with enhanced social features
        profile = new UserGamification({
          userId,
          totalPoints: 0,
          level: 1,
          experiencePoints: 0,
          pointsBreakdown: {
            learning: 0,
            consistency: 0,
            collaboration: 0,
            engagement: 0,
            bonus: 0,
            social: 0,
            mentorship: 0
          },
          badges: [],
          streaks: {
            current: {
              dailyLearning: 0,
              weeklyGoals: 0,
              assessmentStreak: 0,
              socialInteraction: 0,
              collaborationStreak: 0
            },
            longest: {
              dailyLearning: 0,
              weeklyGoals: 0,
              assessmentStreak: 0,
              socialInteraction: 0,
              collaborationStreak: 0
            }
          },
          achievements: [],
          preferences: {
            showPublicProfile: true,
            allowLeaderboards: true,
            notificationsEnabled: true,
            preferredChallenges: [],
            socialVisibility: 'public',
            mentorshipAvailable: true,
            studyGroupNotifications: true
          },
          statistics: {
            totalLessonsCompleted: 0,
            totalAssessmentsCompleted: 0,
            totalTimeSpent: 0,
            averageScore: 0,
            collaborationsCount: 0,
            helpfulAnswers: 0,
            mentoringSessions: 0,
            studyGroupsJoined: 0,
            forumContributions: 0,
            peerReviewsCompleted: 0
          }
        });
        
        await profile.save();
        console.log('Created new enhanced gamification profile for user:', userId);
      }
      
      return profile;
    } catch (error) {
      console.error('Error getting user gamification profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const profile = await this.getUserGamificationProfile(userId);
      return {
        totalPoints: profile.totalPoints,
        level: profile.level,
        badges: profile.badges,
        achievements: profile.achievements,
        currentStreak: profile.streaks.current.dailyLearning,
        longestStreak: profile.streaks.longest.dailyLearning,
        lastActivityDate: profile.updatedAt,
        collaborationScore: await this.calculateCollaborationScore(userId),
        mentorshipLevel: await this.getMentorshipLevel(userId),
        socialEngagementScore: await this.calculateSocialEngagementScore(userId)
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  async generateLeaderboard(type = 'global', courseId = null, limit = 10) {
    try {
      const leaderboardData = await this.getLeaderboard(type, { courseId, limit });
      return leaderboardData.leaderboard || [];
    } catch (error) {
      console.error('Error in generateLeaderboard:', error);
      throw error;
    }
  }

  async awardPoints(userId, activityType, metadata = {}) {
    try {
      console.log(`Awarding points: ${userId}, ${activityType}`, metadata);
      
      const profile = await this.getUserGamificationProfile(userId);
      const basePoints = this.pointValues[activityType] || 10;
      
      // Calculate social and collaboration bonuses
      let socialBonus = 0;
      let collaborationBonus = 0;
      
      if (this.isSocialActivity(activityType)) {
        socialBonus = await this.calculateSocialBonus(userId, activityType, metadata);
      }
      
      if (this.isCollaborativeActivity(activityType)) {
        collaborationBonus = await this.calculateCollaborationBonus(userId, activityType, metadata);
      }
      
      // Apply streak multipliers
      const streakMultiplier = this.getStreakMultiplier(profile.streaks.current.dailyLearning);
      
      // Calculate total points
      const bonusPoints = socialBonus + collaborationBonus;
      const totalPoints = Math.round((basePoints + bonusPoints) * streakMultiplier);
      
      // Update profile
      profile.totalPoints += totalPoints;
      profile.experiencePoints += totalPoints;
      
      // Update points breakdown
      if (this.isSocialActivity(activityType)) {
        profile.pointsBreakdown.social += totalPoints;
      } else if (this.isCollaborativeActivity(activityType)) {
        profile.pointsBreakdown.collaboration += totalPoints;
      } else {
        profile.pointsBreakdown.learning += totalPoints;
      }
      
      // Check for level up
      const oldLevel = profile.level;
      const newLevel = this.calculateLevel(profile.totalPoints);
      const leveledUp = newLevel > oldLevel;
      
      if (leveledUp) {
        profile.level = newLevel;
        // Award level up points
        const levelUpPoints = this.pointValues.level_up;
        profile.totalPoints += levelUpPoints;
        profile.pointsBreakdown.bonus += levelUpPoints;
      }
      
      await profile.save();
      
      // Record activity
      await this.recordPointsActivity(userId, activityType, totalPoints, metadata);
      
      return {
        pointsAwarded: totalPoints,
        basePoints,
        bonusPoints,
        socialBonus,
        collaborationBonus,
        newTotal: profile.totalPoints,
        newLevel,
        leveledUp,
        currentStreak: profile.streaks.current.dailyLearning,
        streakMultiplier
      };
    } catch (error) {
      console.error('Error in awardPoints:', error);
      throw error;
    }
  }

  // New social and collaborative methods

  /**
   * Get social statistics for a user
   */
  async getSocialStats(userId) {
    try {
      const profile = await this.getUserGamificationProfile(userId);
      const socialActivities = await PointsActivity.find({
        userId,
        activityType: { 
          $in: ['social_interaction', 'peer_help', 'study_group_activity', 'forum_contribution', 
                'discussion_vote', 'answer_accepted', 'mentor_session', 'knowledge_share'] 
        }
      }).lean();
      
      const collaborationScore = await this.calculateCollaborationScore(userId);
      const mentorshipLevel = await this.getMentorshipLevel(userId);
      const communityRank = await this.getCommunityRank(userId);
      
      return {
        totalSocialInteractions: socialActivities.length,
        collaborationScore,
        mentorshipLevel,
        communityRank,
        helpfulAnswers: profile.statistics.helpfulAnswers || 0,
        mentoringSessions: profile.statistics.mentoringSessions || 0,
        studyGroupsJoined: profile.statistics.studyGroupsJoined || 0,
        forumContributions: profile.statistics.forumContributions || 0,
        socialStreakCurrent: profile.streaks.current.socialInteraction || 0,
        socialStreakLongest: profile.streaks.longest.socialInteraction || 0,
        peerReviewsCompleted: profile.statistics.peerReviewsCompleted || 0
      };
    } catch (error) {
      console.error('Error getting social stats:', error);
      return {};
    }
  }

  /**
   * Get personalized social recommendations
   */
  async getPersonalizedSocialRecommendations(userId) {
    try {
      const userProfile = await this.getUserGamificationProfile(userId);
      const user = await User.findById(userId);
      
      // Get study buddy recommendations
      const studyBuddies = await this.recommendStudyBuddies(userId);
      
      // Get study group recommendations
      const studyGroups = await this.recommendStudyGroups(userId);
      
      // Get mentorship opportunities
      const mentorshipOpportunities = await this.recommendMentorshipOpportunities(userId);
      
      // Get collaborative challenges
      const collaborativeChallenges = await this.recommendCollaborativeChallenges(userId);
      
      return {
        studyBuddies: studyBuddies.slice(0, 3),
        studyGroups: studyGroups.slice(0, 3),
        mentorshipOpportunities: mentorshipOpportunities.slice(0, 2),
        collaborativeChallenges: collaborativeChallenges.slice(0, 3),
        socialActivitiesSuggestions: await this.getSocialActivitiesSuggestions(userId)
      };
    } catch (error) {
      console.error('Error getting social recommendations:', error);
      return {};
    }
  }

  /**
   * Calculate collaboration score
   */
  async calculateCollaborationScore(userId) {
    try {
      const collaborativeActivities = await PointsActivity.find({
        userId,
        activityType: { 
          $in: ['collaboration', 'study_group_activity', 'peer_help', 'mentor_session', 'peer_review'] 
        }
      }).lean();
      
      const profile = await this.getUserGamificationProfile(userId);
      const recentCollaborations = collaborativeActivities.filter(
        activity => new Date(activity.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      
      const baseScore = Math.min(collaborativeActivities.length * 5, 500);
      const recentBonus = recentCollaborations.length * 3;
      const qualityBonus = profile.statistics.helpfulAnswers * 2;
      
      return Math.min(baseScore + recentBonus + qualityBonus, 1000);
    } catch (error) {
      console.error('Error calculating collaboration score:', error);
      return 0;
    }
  }

  /**
   * Get mentorship level
   */
  async getMentorshipLevel(userId) {
    try {
      const profile = await this.getUserGamificationProfile(userId);
      const mentoringSessions = profile.statistics.mentoringSessions || 0;
      const helpfulAnswers = profile.statistics.helpfulAnswers || 0;
      
      const mentorshipScore = (mentoringSessions * 10) + (helpfulAnswers * 2);
      
      if (mentorshipScore >= 200) return 'Master Mentor';
      if (mentorshipScore >= 100) return 'Expert Mentor';
      if (mentorshipScore >= 50) return 'Experienced Mentor';
      if (mentorshipScore >= 20) return 'Active Mentor';
      if (mentorshipScore >= 5) return 'Emerging Mentor';
      return 'Beginner';
    } catch (error) {
      console.error('Error getting mentorship level:', error);
      return 'Beginner';
    }
  }

  /**
   * Helper methods for social features
   */
  isSocialActivity(activityType) {
    return ['social_interaction', 'peer_help', 'forum_contribution', 'discussion_vote', 
            'answer_accepted', 'knowledge_share', 'community_support'].includes(activityType);
  }

  isCollaborativeActivity(activityType) {
    return ['collaboration', 'study_group_activity', 'mentor_session', 'peer_review', 
            'group_milestone', 'collaboration_bonus'].includes(activityType);
  }

  async calculateSocialBonus(userId, activityType, metadata) {
    // Implementation for social bonus calculation
    const recentSocialActivities = await PointsActivity.countDocuments({
      userId,
      activityType: { $in: ['social_interaction', 'peer_help', 'forum_contribution'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    return Math.min(recentSocialActivities * 2, 10); // Max 10 bonus points
  }

  async calculateCollaborationBonus(userId, activityType, metadata) {
    // Implementation for collaboration bonus calculation
    const profile = await this.getUserGamificationProfile(userId);
    const collaborationStreak = profile.streaks.current.collaborationStreak || 0;
    
    return Math.min(collaborationStreak * 3, 15); // Max 15 bonus points
  }

  // Additional helper methods will be implemented...
  async getAllBadges() {
    try {
      return await Badge.find({ isActive: true }).lean();
    } catch (error) {
      console.error('Error in getAllBadges:', error);
      return [];
    }
  }

  async getAllAchievements() {
    try {
      return await Achievement.find({ isActive: true }).lean();
    } catch (error) {
      console.error('Error in getAllAchievements:', error);
      return [];
    }
  }

  // Placeholder methods for features to be implemented
  async getAchievementsInProgress(userId) { return []; }
  async getCollaborativeMilestones(userId) { return []; }
  async getUserGlobalRank(userId) { return { rank: 'N/A' }; }
  async getUserSocialRank(userId) { return { rank: 'N/A' }; }
  calculateLevelProgress(points) { return { percentage: 0, pointsToNext: 100 }; }
  getStreakMultiplier(streak) { return 1.0; }
  getNextStreakThreshold(streak) { return { days: 7, multiplier: 1.2 }; }
  calculateSocialPoints(activities) { return 0; }
  calculateCollaborativePoints(activities) { return 0; }
  calculateLevel(points) { return 1; }
  async recordPointsActivity(userId, type, points, metadata) { return; }
  async calculateSocialEngagementScore(userId) { return 0; }
  async getLeaderboard(type, options) { return { leaderboard: [] }; }
  async getCommunityRank(userId) { return 'N/A'; }
  async recommendStudyBuddies(userId) { return []; }
  async recommendStudyGroups(userId) { return []; }
  async recommendMentorshipOpportunities(userId) { return []; }
  async recommendCollaborativeChallenges(userId) { return []; }
  async getSocialActivitiesSuggestions(userId) { return []; }
}

const gamificationService = new GamificationService();

// Test the service
try {
  gamificationService.test();
  console.log('✅ Advanced GamificationService v4 initialized successfully');
} catch (error) {
  console.error('❌ GamificationService v4 initialization failed:', error);
}

export default gamificationService;
