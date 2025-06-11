/**
 * Achievement Service - Phase 4 Step 3
 * Comprehensive achievement and badge management system
 * 
 * Features:
 * - Achievement definitions and criteria management
 * - Badge unlock checking and awarding
 * - Progress tracking for achievements
 * - Social sharing capabilities
 * - Achievement analytics and statistics
 */

console.log('=== Loading AchievementService v1 - Phase 4 Step 3 ===');

import { UserGamification, Achievement, Badge } from '../models/Gamification.js';
import { User } from '../models/User.js';

class AchievementService {
  constructor() {
    console.log('=== Constructing AchievementService v1 - Core Gamification ===');
    this.achievementDefinitions = this.loadAchievementDefinitions();
    this.badgeCategories = {
      learning: 'Learning Milestones',
      engagement: 'Consistency & Engagement',
      social: 'Social & Collaboration',
      special: 'Special Achievements'
    };
  }

  /**
   * Load all achievement definitions
   */
  loadAchievementDefinitions() {
    return [
      // Learning Milestone Achievements
      {
        badgeId: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first lesson',
        category: 'learning',
        difficulty: 'bronze',
        criteria: { 
          type: 'completion', 
          threshold: 1, 
          metric: 'lessons_completed' 
        },
        rewards: { 
          points: 50, 
          multiplier: 1.0 
        },
        visual: { 
          icon: '🥉', 
          color: '#CD7F32', 
          animation: 'bounce' 
        },
        rarity: 'common',
        isActive: true
      },
      {
        badgeId: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 10 lessons',
        category: 'learning',
        difficulty: 'silver',
        criteria: { 
          type: 'completion', 
          threshold: 10, 
          metric: 'lessons_completed' 
        },
        rewards: { 
          points: 200, 
          multiplier: 1.1 
        },
        visual: { 
          icon: '🥈', 
          color: '#C0C0C0', 
          animation: 'pulse' 
        },
        rarity: 'uncommon',
        isActive: true
      },
      {
        badgeId: 'learning_master',
        name: 'Learning Master',
        description: 'Complete 50 lessons',
        category: 'learning',
        difficulty: 'gold',
        criteria: { 
          type: 'completion', 
          threshold: 50, 
          metric: 'lessons_completed' 
        },
        rewards: { 
          points: 1000, 
          multiplier: 1.25 
        },
        visual: { 
          icon: '🥇', 
          color: '#FFD700', 
          animation: 'glow' 
        },
        rarity: 'rare',
        isActive: true
      },
      {
        badgeId: 'wisdom_keeper',
        name: 'Wisdom Keeper',
        description: 'Complete 100 lessons',
        category: 'learning',
        difficulty: 'platinum',
        criteria: { 
          type: 'completion', 
          threshold: 100, 
          metric: 'lessons_completed' 
        },
        rewards: { 
          points: 2500, 
          multiplier: 1.5 
        },
        visual: { 
          icon: '💎', 
          color: '#E5E4E2', 
          animation: 'sparkle' 
        },
        rarity: 'legendary',
        isActive: true
      },

      // Consistency & Engagement Achievements
      {
        badgeId: 'streak_starter',
        name: 'Streak Starter',
        description: 'Maintain a 3-day learning streak',
        category: 'engagement',
        difficulty: 'bronze',
        criteria: { 
          type: 'streak', 
          threshold: 3, 
          metric: 'daily_learning' 
        },
        rewards: { 
          points: 75, 
          multiplier: 1.1 
        },
        visual: { 
          icon: '🔥', 
          color: '#FF6B35', 
          animation: 'flame' 
        },
        rarity: 'common',
        isActive: true
      },
      {
        badgeId: 'consistent_learner',
        name: 'Consistent Learner',
        description: 'Maintain a 7-day learning streak',
        category: 'engagement',
        difficulty: 'silver',
        criteria: { 
          type: 'streak', 
          threshold: 7, 
          metric: 'daily_learning' 
        },
        rewards: { 
          points: 200, 
          multiplier: 1.2 
        },
        visual: { 
          icon: '⚡', 
          color: '#FFEB3B', 
          animation: 'electric' 
        },
        rarity: 'uncommon',
        isActive: true
      },
      {
        badgeId: 'dedicated_student',
        name: 'Dedicated Student',
        description: 'Maintain a 30-day learning streak',
        category: 'engagement',
        difficulty: 'gold',
        criteria: { 
          type: 'streak', 
          threshold: 30, 
          metric: 'daily_learning' 
        },
        rewards: { 
          points: 1000, 
          multiplier: 1.5 
        },
        visual: { 
          icon: '🌟', 
          color: '#FFD700', 
          animation: 'twinkle' 
        },
        rarity: 'rare',
        isActive: true
      },
      {
        badgeId: 'learning_legend',
        name: 'Learning Legend',
        description: 'Maintain a 100-day learning streak',
        category: 'engagement',
        difficulty: 'platinum',
        criteria: { 
          type: 'streak', 
          threshold: 100, 
          metric: 'daily_learning' 
        },
        rewards: { 
          points: 5000, 
          multiplier: 2.0 
        },
        visual: { 
          icon: '👑', 
          color: '#E5E4E2', 
          animation: 'royal' 
        },
        rarity: 'legendary',
        isActive: true
      },

      // Social & Collaboration Achievements
      {
        badgeId: 'helper',
        name: 'Helper',
        description: 'Answer 5 questions from peers',
        category: 'social',
        difficulty: 'bronze',
        criteria: { 
          type: 'social', 
          threshold: 5, 
          metric: 'questions_answered' 
        },
        rewards: { 
          points: 100, 
          multiplier: 1.1 
        },
        visual: { 
          icon: '🤝', 
          color: '#4CAF50', 
          animation: 'handshake' 
        },
        rarity: 'common',
        isActive: true
      },
      {
        badgeId: 'discussionist',
        name: 'Discussionist',
        description: 'Participate in 10 discussions',
        category: 'social',
        difficulty: 'silver',
        criteria: { 
          type: 'social', 
          threshold: 10, 
          metric: 'discussions_participated' 
        },
        rewards: { 
          points: 250, 
          multiplier: 1.15 
        },
        visual: { 
          icon: '💬', 
          color: '#2196F3', 
          animation: 'chat' 
        },
        rarity: 'uncommon',
        isActive: true
      },
      {
        badgeId: 'mentor',
        name: 'Mentor',
        description: 'Help 20 students with their learning',
        category: 'social',
        difficulty: 'gold',
        criteria: { 
          type: 'social', 
          threshold: 20, 
          metric: 'students_helped' 
        },
        rewards: { 
          points: 750, 
          multiplier: 1.3 
        },
        visual: { 
          icon: '🎯', 
          color: '#FF9800', 
          animation: 'target' 
        },
        rarity: 'rare',
        isActive: true
      },
      {
        badgeId: 'community_champion',
        name: 'Community Champion',
        description: 'Rank in top 10 community helpers',
        category: 'social',
        difficulty: 'platinum',
        criteria: { 
          type: 'ranking', 
          threshold: 10, 
          metric: 'community_rank' 
        },
        rewards: { 
          points: 2000, 
          multiplier: 1.5 
        },
        visual: { 
          icon: '🏆', 
          color: '#E5E4E2', 
          animation: 'trophy' 
        },
        rarity: 'legendary',
        isActive: true
      },

      // Special Achievements
      {
        badgeId: 'early_adopter',
        name: 'Early Adopter',
        description: 'Join within the first month of launch',
        category: 'special',
        difficulty: 'gold',
        criteria: { 
          type: 'special', 
          threshold: 1, 
          metric: 'early_adoption' 
        },
        rewards: { 
          points: 500, 
          multiplier: 1.2 
        },
        visual: { 
          icon: '🎮', 
          color: '#9C27B0', 
          animation: 'special' 
        },
        rarity: 'rare',
        isActive: true
      },
      {
        badgeId: 'speed_runner',
        name: 'Speed Runner',
        description: 'Complete a course in record time',
        category: 'special',
        difficulty: 'gold',
        criteria: { 
          type: 'performance', 
          threshold: 1, 
          metric: 'record_completion' 
        },
        rewards: { 
          points: 1000, 
          multiplier: 1.3 
        },
        visual: { 
          icon: '🚀', 
          color: '#00BCD4', 
          animation: 'rocket' 
        },
        rarity: 'rare',
        isActive: true
      },
      {
        badgeId: 'completionist',
        name: 'Completionist',
        description: 'Achieve 100% completion in a course',
        category: 'special',
        difficulty: 'platinum',
        criteria: { 
          type: 'completion', 
          threshold: 100, 
          metric: 'course_completion_percentage' 
        },
        rewards: { 
          points: 1500, 
          multiplier: 1.4 
        },
        visual: { 
          icon: '📚', 
          color: '#8BC34A', 
          animation: 'complete' 
        },
        rarity: 'legendary',
        isActive: true
      },
      {
        badgeId: 'explorer',
        name: 'Explorer',
        description: 'Try courses from all available categories',
        category: 'special',
        difficulty: 'platinum',
        criteria: { 
          type: 'diversity', 
          threshold: 5, 
          metric: 'course_categories_tried' 
        },
        rewards: { 
          points: 2000, 
          multiplier: 1.5 
        },
        visual: { 
          icon: '🔬', 
          color: '#FF5722', 
          animation: 'explore' 
        },
        rarity: 'legendary',
        isActive: true
      }
    ];
  }

  /**
   * Check if user meets achievement criteria
   */
  meetsCriteria(criteria, userProgress, context = {}) {
    try {
      console.log(`Checking criteria for ${criteria.type}:`, criteria, userProgress);

      switch (criteria.type) {
        case 'completion':
          return (userProgress[criteria.metric] || 0) >= criteria.threshold;
        
        case 'streak':
          const streakValue = userProgress.streaks?.current?.[criteria.metric] || 0;
          return streakValue >= criteria.threshold;
        
        case 'points':
          return (userProgress.points?.total || 0) >= criteria.threshold;
        
        case 'social':
          return (userProgress.social?.[criteria.metric] || 0) >= criteria.threshold;
        
        case 'ranking':
          const rank = userProgress.rankings?.[criteria.metric] || Number.MAX_SAFE_INTEGER;
          return rank <= criteria.threshold;
        
        case 'performance':
          return (context[criteria.metric] || 0) >= criteria.threshold;
        
        case 'diversity':
          return (userProgress.diversity?.[criteria.metric] || 0) >= criteria.threshold;
        
        case 'special':
          return context[criteria.metric] === true;
        
        default:
          console.warn(`Unknown criteria type: ${criteria.type}`);
          return false;
      }
    } catch (error) {
      console.error('Error checking achievement criteria:', error);
      return false;
    }
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId, badgeId, context = {}) {
    try {
      console.log(`Awarding badge ${badgeId} to user ${userId}`);

      const badge = this.achievementDefinitions.find(b => b.badgeId === badgeId);
      if (!badge) {
        console.warn(`Badge definition not found: ${badgeId}`);
        return false;
      }

      const user = await User.findById(userId);
      if (!user) {
        console.warn(`User not found: ${userId}`);
        return false;
      }

      // Get user gamification profile
      let userGamification = await UserGamification.findOne({ userId });
      if (!userGamification) {
        // Create new gamification profile
        userGamification = new UserGamification({
          userId,
          totalPoints: 0,
          level: 1,
          badges: [],
          achievements: [],
          streaks: {
            current: { dailyLearning: 0 },
            longest: { dailyLearning: 0 }
          }
        });
      }

      // Check if already earned
      const alreadyEarned = userGamification.achievements
        .some(a => a.badgeId === badgeId);
      
      if (alreadyEarned) {
        console.log(`Badge ${badgeId} already earned by user ${userId}`);
        return false;
      }

      // Add achievement
      userGamification.achievements.push({
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description,
        unlockedAt: new Date(),
        category: badge.category,
        difficulty: badge.difficulty,
        shared: false,
        visual: badge.visual,
        rarity: badge.rarity
      });

      // Award points
      userGamification.totalPoints += badge.rewards.points;
      if (userGamification.pointsBreakdown) {
        userGamification.pointsBreakdown.bonus = 
          (userGamification.pointsBreakdown.bonus || 0) + badge.rewards.points;
      }

      // Update level if needed
      const newLevel = this.calculateLevel(userGamification.totalPoints);
      if (newLevel > userGamification.level) {
        userGamification.level = newLevel;
      }

      await userGamification.save();

      // Create achievement record
      const achievementRecord = new Achievement({
        userId,
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        difficulty: badge.difficulty,
        pointsAwarded: badge.rewards.points,
        unlockedAt: new Date(),
        context: context,
        visual: badge.visual
      });

      await achievementRecord.save();

      // Trigger real-time notification
      await this.notifyAchievementUnlocked(userId, badge);

      console.log(`Successfully awarded badge ${badgeId} to user ${userId}`);
      return {
        success: true,
        badge: badge,
        pointsAwarded: badge.rewards.points,
        newLevel: userGamification.level
      };

    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  /**
   * Check achievements for user activity
   */
  async checkAchievements(userId, activityType, context = {}) {
    try {
      console.log(`Checking achievements for user ${userId}, activity: ${activityType}`);

      // Get user progress data
      const userProgress = await this.getUserProgressData(userId);
      
      // Get eligible badges for this activity type
      const eligibleBadges = this.getEligibleBadges(activityType);
      
      const awardedBadges = [];

      for (const badge of eligibleBadges) {
        if (this.meetsCriteria(badge.criteria, userProgress, context)) {
          const result = await this.awardBadge(userId, badge.badgeId, context);
          if (result && result.success) {
            awardedBadges.push(result);
          }
        }
      }

      return awardedBadges;

    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Get eligible badges for activity type
   */
  getEligibleBadges(activityType) {
    const activityBadgeMap = {
      lesson_complete: ['first_steps', 'knowledge_seeker', 'learning_master', 'wisdom_keeper'],
      daily_login: ['streak_starter', 'consistent_learner', 'dedicated_student', 'learning_legend'],
      question_answered: ['helper', 'mentor'],
      discussion_participation: ['discussionist'],
      course_complete: ['completionist', 'speed_runner'],
      early_adoption: ['early_adopter'],
      category_exploration: ['explorer']
    };

    const eligibleBadgeIds = activityBadgeMap[activityType] || [];
    return this.achievementDefinitions.filter(badge => 
      eligibleBadgeIds.includes(badge.badgeId) && badge.isActive
    );
  }

  /**
   * Get user progress data for achievement checking
   */
  async getUserProgressData(userId) {
    try {
      const userGamification = await UserGamification.findOne({ userId });
      if (!userGamification) {
        return this.getDefaultProgressData();
      }

      // Calculate additional metrics needed for achievements
      const socialMetrics = await this.calculateSocialMetrics(userId);
      const diversityMetrics = await this.calculateDiversityMetrics(userId);

      return {
        lessons_completed: userGamification.statistics?.lessonsCompleted || 0,
        courses_completed: userGamification.statistics?.coursesCompleted || 0,
        points: {
          total: userGamification.totalPoints || 0
        },
        streaks: userGamification.streaks || {
          current: { daily_learning: 0 },
          longest: { daily_learning: 0 }
        },
        social: socialMetrics,
        diversity: diversityMetrics,
        rankings: userGamification.rankings || {}
      };

    } catch (error) {
      console.error('Error getting user progress data:', error);
      return this.getDefaultProgressData();
    }
  }

  /**
   * Calculate social metrics for achievements
   */
  async calculateSocialMetrics(userId) {
    // This would integrate with discussion forum and social learning data
    // For now, return placeholder data
    return {
      questions_answered: 0,
      discussions_participated: 0,
      students_helped: 0,
      community_rank: 999
    };
  }

  /**
   * Calculate diversity metrics for achievements
   */
  async calculateDiversityMetrics(userId) {
    // This would calculate course category diversity
    // For now, return placeholder data
    return {
      course_categories_tried: 0
    };
  }

  /**
   * Get default progress data
   */
  getDefaultProgressData() {
    return {
      lessons_completed: 0,
      courses_completed: 0,
      points: { total: 0 },
      streaks: {
        current: { daily_learning: 0 },
        longest: { daily_learning: 0 }
      },
      social: {
        questions_answered: 0,
        discussions_participated: 0,
        students_helped: 0,
        community_rank: 999
      },
      diversity: {
        course_categories_tried: 0
      },
      rankings: {}
    };
  }

  /**
   * Calculate level from total points
   */
  calculateLevel(totalPoints) {
    const levelThresholds = [
      0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 25000, 35000, 50000, 75000
    ];

    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (totalPoints >= levelThresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Notify achievement unlocked (integrates with real-time system)
   */
  async notifyAchievementUnlocked(userId, badge) {
    try {
      // This would integrate with the WebSocket service for real-time notifications
      console.log(`🏆 Achievement unlocked for user ${userId}: ${badge.name}`);
      
      // Placeholder for WebSocket notification
      const notificationData = {
        type: 'achievement_unlocked',
        userId: userId,
        badge: {
          id: badge.badgeId,
          name: badge.name,
          description: badge.description,
          icon: badge.visual.icon,
          color: badge.visual.color,
          animation: badge.visual.animation,
          points: badge.rewards.points
        },
        timestamp: new Date()
      };

      // TODO: Integrate with WebSocketService
      // await webSocketService.sendToUser(userId, 'achievement_unlocked', notificationData);

    } catch (error) {
      console.error('Error sending achievement notification:', error);
    }
  }

  /**
   * Get all available badges
   */
  getBadgeLibrary() {
    return this.achievementDefinitions.map(badge => ({
      badgeId: badge.badgeId,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      difficulty: badge.difficulty,
      visual: badge.visual,
      rarity: badge.rarity,
      criteria: badge.criteria,
      rewards: badge.rewards,
      isActive: badge.isActive
    }));
  }

  /**
   * Get achievements in progress for user
   */
  async getAchievementsInProgress(userId) {
    try {
      const userProgress = await this.getUserProgressData(userId);
      const userGamification = await UserGamification.findOne({ userId });
      const earnedBadgeIds = userGamification?.achievements?.map(a => a.badgeId) || [];

      return this.achievementDefinitions
        .filter(badge => badge.isActive && !earnedBadgeIds.includes(badge.badgeId))
        .map(badge => {
          const progress = this.calculateAchievementProgress(badge, userProgress);
          return {
            badgeId: badge.badgeId,
            name: badge.name,
            description: badge.description,
            category: badge.category,
            difficulty: badge.difficulty,
            visual: badge.visual,
            progress: progress,
            criteria: badge.criteria,
            rewards: badge.rewards
          };
        })
        .filter(badge => badge.progress > 0)
        .sort((a, b) => b.progress - a.progress);

    } catch (error) {
      console.error('Error getting achievements in progress:', error);
      return [];
    }
  }

  /**
   * Calculate achievement progress percentage
   */
  calculateAchievementProgress(badge, userProgress) {
    try {
      const criteria = badge.criteria;
      let currentValue = 0;

      switch (criteria.type) {
        case 'completion':
          currentValue = userProgress[criteria.metric] || 0;
          break;
        case 'streak':
          currentValue = userProgress.streaks?.current?.[criteria.metric] || 0;
          break;
        case 'points':
          currentValue = userProgress.points?.total || 0;
          break;
        case 'social':
          currentValue = userProgress.social?.[criteria.metric] || 0;
          break;
        case 'diversity':
          currentValue = userProgress.diversity?.[criteria.metric] || 0;
          break;
        default:
          return 0;
      }

      return Math.min(100, Math.round((currentValue / criteria.threshold) * 100));

    } catch (error) {
      console.error('Error calculating achievement progress:', error);
      return 0;
    }
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(timeframe = 'all') {
    try {
      const match = {};
      
      if (timeframe !== 'all') {
        const startDate = this.getTimeframeStartDate(timeframe);
        match.unlockedAt = { $gte: startDate };
      }

      const stats = await Achievement.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalUnlocked: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            categoryBreakdown: {
              $push: {
                category: '$category',
                difficulty: '$difficulty'
              }
            },
            pointsAwarded: { $sum: '$pointsAwarded' }
          }
        }
      ]);

      return {
        totalUnlocked: stats[0]?.totalUnlocked || 0,
        uniqueUsers: stats[0]?.uniqueUsers?.length || 0,
        pointsAwarded: stats[0]?.pointsAwarded || 0,
        categoryBreakdown: this.processCategoryBreakdown(stats[0]?.categoryBreakdown || [])
      };

    } catch (error) {
      console.error('Error getting achievement statistics:', error);
      return {
        totalUnlocked: 0,
        uniqueUsers: 0,
        pointsAwarded: 0,
        categoryBreakdown: {}
      };
    }
  }

  /**
   * Process category breakdown data
   */
  processCategoryBreakdown(categoryData) {
    const breakdown = {};
    
    categoryData.forEach(item => {
      if (!breakdown[item.category]) {
        breakdown[item.category] = {};
      }
      if (!breakdown[item.category][item.difficulty]) {
        breakdown[item.category][item.difficulty] = 0;
      }
      breakdown[item.category][item.difficulty]++;
    });

    return breakdown;
  }

  /**
   * Get timeframe start date
   */
  getTimeframeStartDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(0);
    }
  }

  /**
   * Test achievement service
   */
  test() {
    console.log('🧪 AchievementService v1 Test');
    console.log(`Loaded ${this.achievementDefinitions.length} achievement definitions`);
    console.log('Badge categories:', this.badgeCategories);
    return true;
  }
}

// Export singleton instance
const achievementService = new AchievementService();
export default achievementService;
