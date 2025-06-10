import gamificationService from '../services/gamificationService.js';
import { UserGamification } from '../models/Gamification.js';

/**
 * Gamification Middleware
 * Automatically awards points and checks achievements when users complete activities
 */

/**
 * Award points for lesson completion
 */
export const awardLessonPoints = async (req, res, next) => {
  try {
    if (res.locals.activityCompleted && req.user) {
      const { lessonId, lessonTitle, timeSpent, score } = res.locals.activityData || {};
      
      await gamificationService.awardPoints(
        req.user._id,
        'lesson_complete',
        {
          lessonId,
          lessonTitle,
          timeSpent: timeSpent || 0,
          score: score || null
        }
      );

      // Update user statistics
      await updateUserStatistics(req.user._id, 'lesson_complete', { timeSpent });
    }
  } catch (error) {
    console.error('Error awarding lesson points:', error);
    // Don't block the main response, just log the error
  }
  next();
};

/**
 * Award points for assessment completion
 */
export const awardAssessmentPoints = async (req, res, next) => {
  try {
    if (res.locals.activityCompleted && req.user) {
      const { assessmentId, score, questionCount, timeSpent } = res.locals.activityData || {};
      
      // Base points for completion + bonus for high scores
      let bonusMultiplier = 1;
      if (score >= 90) bonusMultiplier = 1.5;
      else if (score >= 80) bonusMultiplier = 1.3;
      else if (score >= 70) bonusMultiplier = 1.1;

      await gamificationService.awardPoints(
        req.user._id,
        'assessment_complete',
        {
          assessmentId,
          score,
          questionCount,
          timeSpent: timeSpent || 0,
          multiplier: bonusMultiplier
        }
      );

      // Update user statistics
      await updateUserStatistics(req.user._id, 'assessment_complete', { score, timeSpent });
    }
  } catch (error) {
    console.error('Error awarding assessment points:', error);
  }
  next();
};

/**
 * Award points for daily login
 */
export const awardDailyLoginPoints = async (req, res, next) => {
  try {
    if (req.user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const profile = await gamificationService.getUserGamificationProfile(req.user._id);
      const lastLogin = profile.streaks.lastActivity.date;

      // Check if user already got daily login points today
      if (!lastLogin || lastLogin < today) {
        await gamificationService.awardPoints(
          req.user._id,
          'daily_login',
          {
            loginDate: today.toISOString()
          }
        );
      }
    }
  } catch (error) {
    console.error('Error awarding daily login points:', error);
  }
  next();
};

/**
 * Award points for collaboration activities
 */
export const awardCollaborationPoints = async (req, res, next) => {
  try {
    if (res.locals.activityCompleted && req.user) {
      const { collaborationType, targetUserId, groupId } = res.locals.activityData || {};
      
      await gamificationService.awardPoints(
        req.user._id,
        'collaboration',
        {
          collaborationType,
          targetUserId,
          groupId
        }
      );

      // Update user statistics
      await updateUserStatistics(req.user._id, 'collaboration');
    }
  } catch (error) {
    console.error('Error awarding collaboration points:', error);
  }
  next();
};

/**
 * Award points for helping peers
 */
export const awardHelpPoints = async (req, res, next) => {
  try {
    if (res.locals.activityCompleted && req.user) {
      const { helpType, helpeeId, questionId } = res.locals.activityData || {};
      
      await gamificationService.awardPoints(
        req.user._id,
        'help_peer',
        {
          helpType,
          helpeeId,
          questionId
        }
      );

      // Update user statistics
      await updateUserStatistics(req.user._id, 'help_peer');
    }
  } catch (error) {
    console.error('Error awarding help points:', error);
  }
  next();
};

/**
 * Update user statistics in gamification profile
 */
async function updateUserStatistics(userId, activityType, metadata = {}) {
  try {
    const profile = await UserGamification.findOne({ userId });
    if (!profile) return;

    switch (activityType) {
      case 'lesson_complete':
        profile.statistics.totalLessonsCompleted += 1;
        if (metadata.timeSpent) {
          profile.statistics.totalTimeSpent += metadata.timeSpent;
        }
        break;

      case 'assessment_complete':
        profile.statistics.totalAssessmentsCompleted += 1;
        if (metadata.score !== undefined) {
          // Update average score
          const currentTotal = profile.statistics.averageScore * (profile.statistics.totalAssessmentsCompleted - 1);
          profile.statistics.averageScore = (currentTotal + metadata.score) / profile.statistics.totalAssessmentsCompleted;
        }
        if (metadata.timeSpent) {
          profile.statistics.totalTimeSpent += metadata.timeSpent;
        }
        break;

      case 'collaboration':
        profile.statistics.collaborationsCount += 1;
        break;

      case 'help_peer':
        profile.statistics.helpfulAnswers += 1;
        break;
    }

    await profile.save();
  } catch (error) {
    console.error('Error updating user statistics:', error);
  }
}

/**
 * Middleware to set activity completion flag
 */
export const markActivityCompleted = (activityData = {}) => {
  return (req, res, next) => {
    res.locals.activityCompleted = true;
    res.locals.activityData = activityData;
    next();
  };
};

/**
 * Middleware to check for new achievements and badges
 */
export const checkAchievements = async (req, res, next) => {
  try {
    if (req.user) {
      // This runs after the main response, so it doesn't block the user
      setImmediate(async () => {
        try {
          const newAchievements = await gamificationService.checkAchievements(req.user._id);
          
          if (newAchievements.length > 0) {
            // Here you could emit a real-time notification to the user
            console.log(`User ${req.user._id} earned ${newAchievements.length} new achievements:`, 
              newAchievements.map(a => a.name).join(', '));
          }
        } catch (error) {
          console.error('Error checking achievements:', error);
        }
      });
    }
  } catch (error) {
    console.error('Error in achievement check middleware:', error);
  }
  next();
};

/**
 * Middleware to add gamification context to responses
 */
export const addGamificationContext = async (req, res, next) => {
  if (req.user) {
    try {
      const profile = await gamificationService.getUserGamificationProfile(req.user._id);
      req.gamificationProfile = {
        totalPoints: profile.totalPoints,
        level: profile.level,
        currentStreak: profile.streaks.current.dailyLearning,
        badges: profile.badges.length
      };
    } catch (error) {
      console.error('Error adding gamification context:', error);
      req.gamificationProfile = null;
    }
  }
  next();
};
