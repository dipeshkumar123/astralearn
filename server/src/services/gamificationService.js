// Advanced Gamification service for AstraLearn - Phase 4 Step 3
console.log('=== Loading Advanced GamificationService v4.3 - Phase 4 Step 3 Complete ===');

import { UserGamification, PointsActivity, Achievement, Badge, Leaderboard } from '../models/Gamification.js';
import { User } from '../models/User.js';
import challengeService from './challengeService.js';
import achievementService from './achievementService.js';

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

      // 🏆 Check for achievements after awarding points
      let newAchievements = [];
      try {
        newAchievements = await achievementService.checkAchievements(userId, activityType, {
          ...metadata,
          pointsAwarded: totalPoints,
          newLevel: newLevel,
          leveledUp: leveledUp
        });
        console.log(`Checked achievements for ${userId}: found ${newAchievements.length} new achievements`);
      } catch (achievementError) {
        console.error('Error checking achievements:', achievementError);
        // Don't block points awarding if achievement checking fails
      }
      
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
        streakMultiplier,
        newAchievements: newAchievements
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
  async getAchievementsInProgress(userId) { 
    try {
      return await achievementService.getAchievementsInProgress(userId);
    } catch (error) {
      console.error('Error getting achievements in progress:', error);
      return [];
    }
  }
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
  
  // New method: Get streak data and history
  async getStreakData(userId) {
    try {
      const profile = await this.getUserGamificationProfile(userId);
      
      // Get streak history for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const streakHistory = await PointsActivity.find({
        userId,
        createdAt: { $gte: thirtyDaysAgo },
        activityType: { $in: ['lesson_complete', 'assessment_complete', 'daily_login'] }
      }).sort({ createdAt: 1 });
      
      // Calculate daily completion status
      const dailyActivity = this.calculateDailyActivity(streakHistory);
      
      // Calculate streak multipliers
      const currentStreak = profile.streaks.current.dailyLearning;
      const multipliers = this.calculateStreakMultipliers(currentStreak);
      
      // Get streak milestones
      const milestones = this.getStreakMilestones(currentStreak);
      
      return {
        current: profile.streaks.current,
        longest: profile.streaks.longest,
        multipliers,
        milestones,
        history: dailyActivity,
        statistics: {
          totalDays: dailyActivity.length,
          completedDays: dailyActivity.filter(d => d.completed).length,
          currentWeekStreak: this.calculateWeekStreak(dailyActivity.slice(-7)),
          monthlyConsistency: this.calculateMonthlyConsistency(dailyActivity)
        }
      };
    } catch (error) {
      console.error('Error getting streak data:', error);
      throw new Error('Could not retrieve streak data');
    }
  }

  // Calculate daily activity from point history
  calculateDailyActivity(activities) {
    const dailyMap = new Map();
    const today = new Date();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyMap.set(dateKey, {
        date: dateKey,
        completed: false,
        activities: 0,
        points: 0
      });
    }
    
    // Fill with actual activity data
    activities.forEach(activity => {
      const dateKey = activity.createdAt.toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        const day = dailyMap.get(dateKey);
        day.activities++;
        day.points += activity.points;
        day.completed = true;
      }
    });
    
    return Array.from(dailyMap.values());
  }

  // Calculate streak multipliers based on current streak
  calculateStreakMultipliers(currentStreak) {
    let pointsMultiplier = 1.0;
    let xpMultiplier = 1.0;
    let badgeProgressMultiplier = 1.0;
    
    if (currentStreak >= 7) {
      pointsMultiplier = 1.2;
      xpMultiplier = 1.1;
    }
    if (currentStreak >= 14) {
      pointsMultiplier = 1.4;
      xpMultiplier = 1.2;
      badgeProgressMultiplier = 1.1;
    }
    if (currentStreak >= 30) {
      pointsMultiplier = 1.6;
      xpMultiplier = 1.3;
      badgeProgressMultiplier = 1.2;
    }
    
    return {
      pointsMultiplier,
      xpMultiplier,
      badgeProgressMultiplier
    };
  }

  // Get streak milestone information
  getStreakMilestones(currentStreak) {
    const milestones = [
      { days: 3, reward: 'Bronze Streak Badge', achieved: currentStreak >= 3 },
      { days: 7, reward: 'Silver Streak Badge', achieved: currentStreak >= 7 },
      { days: 14, reward: 'Gold Streak Badge', achieved: currentStreak >= 14 },
      { days: 30, reward: 'Platinum Streak Badge', achieved: currentStreak >= 30 },
      { days: 60, reward: 'Diamond Streak Badge', achieved: currentStreak >= 60 },
      { days: 100, reward: 'Legendary Streak Badge', achieved: currentStreak >= 100 }
    ];
    
    return milestones;
  }

  // Calculate week streak from daily activity
  calculateWeekStreak(weekData) {
    return weekData.filter(day => day.completed).length;
  }

  // Calculate monthly consistency percentage
  calculateMonthlyConsistency(monthData) {
    const completedDays = monthData.filter(day => day.completed).length;
    return Math.round((completedDays / monthData.length) * 100);
  }

  // New method: Get daily goals for user
  async getDailyGoals(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's activity
      const todayActivities = await PointsActivity.find({
        userId,
        createdAt: {
          $gte: new Date(today),
          $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      // Calculate progress for each goal
      const lessonCount = todayActivities.filter(a => a.activityType === 'lesson_complete').length;
      const studyTime = todayActivities.reduce((sum, a) => sum + (a.metadata?.duration || 0), 0);
      const quizCount = todayActivities.filter(a => a.activityType === 'assessment_complete').length;
      
      const goals = [
        {
          id: 'learn_30min',
          title: 'Learn for 30 minutes',
          description: 'Spend at least 30 minutes learning today',
          progress: Math.min(studyTime, 30),
          target: 30,
          unit: 'minutes',
          completed: studyTime >= 30,
          points: 50,
          type: 'time'
        },
        {
          id: 'complete_lesson',
          title: 'Complete 1 lesson',
          description: 'Finish at least one lesson today',
          progress: Math.min(lessonCount, 1),
          target: 1,
          unit: 'lessons',
          completed: lessonCount >= 1,
          points: 25,
          type: 'count'
        },
        {
          id: 'answer_quiz',
          title: 'Answer 5 quiz questions',
          description: 'Answer at least 5 quiz questions correctly',
          progress: Math.min(quizCount * 5, 5), // Assume 5 questions per quiz
          target: 5,
          unit: 'questions',
          completed: quizCount >= 1,
          points: 30,
          type: 'count'
        }
      ];
      
      return goals;
    } catch (error) {
      console.error('Error getting daily goals:', error);
      throw new Error('Could not retrieve daily goals');
    }
  }

  // New method: Create and manage challenges
  async createChallenge(challengeData, creatorId) {
    try {
      const { Challenge } = await import('../models/Gamification.js');
      
      const challenge = new Challenge({
        ...challengeData,
        createdBy: creatorId,
        participants: [creatorId],
        isActive: true,
        createdAt: new Date()
      });
      
      await challenge.save();
      
      // Award points for creating challenge
      await this.awardPoints(creatorId, 'challenge_create', {
        challengeId: challenge._id,
        description: `Created challenge: ${challenge.title}`
      });
      
      return challenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw new Error('Could not create challenge');
    }
  }

  // New method: Join a challenge
  async joinChallenge(challengeId, userId) {
    try {
      const { Challenge } = await import('../models/Gamification.js');
      
      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      if (challenge.participants.includes(userId)) {
        throw new Error('Already participating in this challenge');
      }
      
      challenge.participants.push(userId);
      await challenge.save();
      
      // Award points for joining challenge
      await this.awardPoints(userId, 'challenge_join', {
        challengeId: challenge._id,
        description: `Joined challenge: ${challenge.title}`
      });
      
      return challenge;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw new Error('Could not join challenge');
    }
  }

  // New method: Get available challenges
  async getAvailableChallenges(userId, options = {}) {
    try {
      const { Challenge } = await import('../models/Gamification.js');
      const { limit = 10, type = null, difficulty = null } = options;
      
      let query = {
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        participants: { $nin: [userId] } // Not already joined
      };
      
      if (type) query.type = type;
      if (difficulty) query.difficulty = difficulty;
      
      const challenges = await Challenge.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'name username');
      
      return challenges;
    } catch (error) {
      console.error('Error getting available challenges:', error);
      throw new Error('Could not retrieve available challenges');
    }
  }

  // New method: Get active challenges for user
  async getActiveChallenges(userId, options = {}) {
    try {
      const { Challenge } = await import('../models/Gamification.js');
      const { limit = 10 } = options;
      
      const challenges = await Challenge.find({
        participants: userId,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'name username');
      
      // Add progress information for each challenge
      const challengesWithProgress = await Promise.all(
        challenges.map(async (challenge) => {
          const progress = await this.calculateChallengeProgress(challenge._id, userId);
          return {
            ...challenge.toObject(),
            progress,
            timeRemaining: this.calculateTimeRemaining(challenge.endDate)
          };
        })
      );
      
      return challengesWithProgress;
    } catch (error) {
      console.error('Error getting active challenges:', error);
      throw new Error('Could not retrieve active challenges');
    }
  }

  // Calculate challenge progress for a user
  async calculateChallengeProgress(challengeId, userId) {
    try {
      const { Challenge } = await import('../models/Gamification.js');
      const challenge = await Challenge.findById(challengeId);
      
      if (!challenge) return { current: 0, target: 1, percentage: 0 };
      
      // Get user's activities since challenge start
      const activities = await PointsActivity.find({
        userId,
        createdAt: { $gte: challenge.startDate },
        activityType: { $in: challenge.requiredActivities || [] }
      });
      
      const current = activities.length;
      const target = challenge.targetCount || 1;
      const percentage = Math.min((current / target) * 100, 100);
      
      return { current, target, percentage };
    } catch (error) {
      console.error('Error calculating challenge progress:', error);
      return { current: 0, target: 1, percentage: 0 };
    }
  }

  // Calculate time remaining for challenge
  calculateTimeRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const timeDiff = end - now;
    
    if (timeDiff <= 0) return 'Expired';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  }
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
