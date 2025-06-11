// Advanced Challenge Service for AstraLearn - Phase 4 Step 2
console.log('=== Loading ChallengeService - Advanced Gamification ===');

import { Challenge, ChallengeActivity, ChallengeTeam } from '../models/Challenge.js';
import { UserGamification, PointsActivity } from '../models/Gamification.js';
import { User } from '../models/User.js';
import gamificationService from './gamificationService.js';

class ChallengeService {
  constructor() {
    console.log('=== Constructing ChallengeService ===');
    
    this.challengeTypes = {
      individual: 'Individual Challenge',
      group: 'Group Challenge', 
      course: 'Course-Specific Challenge',
      global: 'Global Platform Challenge'
    };
    
    this.challengeCategories = {
      learning: 'Learning Progress',
      consistency: 'Consistency & Streaks',
      collaboration: 'Collaboration & Social',
      performance: 'Performance Excellence',
      social: 'Social Engagement'
    };
    
    this.objectiveTypes = {
      points: 'Points Accumulation',
      lessons: 'Lesson Completions',
      assessments: 'Assessment Completions', 
      streak: 'Learning Streaks',
      collaboration: 'Collaboration Activities',
      custom: 'Custom Objective'
    };
  }

  /**
   * Create a new challenge
   */
  async createChallenge(challengeData, creatorId) {
    try {
      console.log('Creating new challenge:', challengeData.title);
      
      const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const challenge = new Challenge({
        challengeId,
        ...challengeData,
        createdBy: creatorId,
        status: 'draft'
      });
      
      await challenge.save();
      
      console.log('Challenge created successfully:', challengeId);
      return {
        success: true,
        challenge: challenge.toJSON(),
        challengeId
      };
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Get active challenges for a user
   */
  async getActiveChallenges(userId, options = {}) {
    try {
      console.log('Getting active challenges for user:', userId);
      
      const {
        type = null,
        category = null,
        difficulty = null,
        limit = 20,
        includeJoined = true,
        includeAvailable = true
      } = options;
      
      const now = new Date();
      let query = {
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
      
      if (type) query.type = type;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      
      const challenges = await Challenge.find(query)
        .sort({ startDate: -1 })
        .limit(limit)
        .populate('createdBy', 'firstName lastName username')
        .lean();
      
      // Get user's gamification profile for eligibility checking
      const userGamification = await UserGamification.findOne({ userId });
      const user = await User.findById(userId);
      
      const enrichedChallenges = await Promise.all(challenges.map(async (challenge) => {
        const isParticipant = challenge.participants.some(p => p.userId.toString() === userId.toString());
        const canJoin = !isParticipant && this.checkEligibility(challenge, user, userGamification);
        
        let userProgress = null;
        if (isParticipant) {
          userProgress = await this.getUserChallengeProgress(challenge.challengeId, userId);
        }
        
        return {
          ...challenge,
          isParticipant,
          canJoin,
          userProgress,
          participantCount: challenge.participants.length,
          timeRemaining: this.calculateTimeRemaining(challenge.endDate)
        };
      }));
      
      // Filter based on user preferences
      let filteredChallenges = enrichedChallenges;
      if (!includeJoined) {
        filteredChallenges = filteredChallenges.filter(c => !c.isParticipant);
      }
      if (!includeAvailable) {
        filteredChallenges = filteredChallenges.filter(c => c.isParticipant);
      }
      
      return {
        success: true,
        challenges: filteredChallenges,
        total: filteredChallenges.length
      };
    } catch (error) {
      console.error('Error getting active challenges:', error);
      throw error;
    }
  }

  /**
   * Get upcoming challenges
   */
  async getUpcomingChallenges(userId, options = {}) {
    try {
      const { limit = 10, category = null, type = null } = options;
      
      const now = new Date();
      let query = {
        status: 'upcoming',
        startDate: { $gt: now }
      };
      
      if (category) query.category = category;
      if (type) query.type = type;
      
      const challenges = await Challenge.find(query)
        .sort({ startDate: 1 })
        .limit(limit)
        .populate('createdBy', 'firstName lastName username')
        .lean();
      
      const userGamification = await UserGamification.findOne({ userId });
      const user = await User.findById(userId);
      
      const enrichedChallenges = challenges.map(challenge => ({
        ...challenge,
        canJoin: this.checkEligibility(challenge, user, userGamification),
        participantCount: challenge.participants.length,
        timeUntilStart: this.calculateTimeUntilStart(challenge.startDate)
      }));
      
      return {
        success: true,
        challenges: enrichedChallenges,
        total: enrichedChallenges.length
      };
    } catch (error) {
      console.error('Error getting upcoming challenges:', error);
      throw error;
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId, userId) {
    try {
      console.log('User joining challenge:', userId, challengeId);
      
      const challenge = await Challenge.findOne({ challengeId });
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      const user = await User.findById(userId);
      const userGamification = await UserGamification.findOne({ userId });
      
      // Check if user can join
      if (!this.checkEligibility(challenge, user, userGamification)) {
        throw new Error('User is not eligible to join this challenge');
      }
      
      // Check if user already joined
      const alreadyJoined = challenge.participants.some(p => p.userId.toString() === userId.toString());
      if (alreadyJoined) {
        throw new Error('User already joined this challenge');
      }
      
      // Initialize user progress
      const initialProgress = {
        currentScore: 0,
        objectives: challenge.objectives.map((objective, index) => ({
          objectiveIndex: index,
          currentValue: 0,
          completed: false
        })),
        rank: challenge.participants.length + 1,
        lastActivity: new Date()
      };
      
      // Add user to participants
      challenge.participants.push({
        userId,
        joinedAt: new Date(),
        progress: initialProgress,
        status: 'active'
      });
      
      await challenge.save();
      
      // Record activity
      await this.recordChallengeActivity(challengeId, userId, 'join', {
        metadata: { challengeTitle: challenge.title }
      });
      
      // Award participation points if configured
      if (challenge.rewards.participation.points > 0) {
        await gamificationService.awardPoints(userId, 'challenge_complete', {
          challengeId,
          points: challenge.rewards.participation.points,
          description: `Joined challenge: ${challenge.title}`
        });
      }
      
      console.log('User successfully joined challenge');
      return {
        success: true,
        message: 'Successfully joined challenge',
        userProgress: initialProgress
      };
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  /**
   * Leave/withdraw from a challenge
   */
  async leaveChallenge(challengeId, userId) {
    try {
      console.log('User leaving challenge:', userId, challengeId);
      
      const challenge = await Challenge.findOne({ challengeId });
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      const participantIndex = challenge.participants.findIndex(p => p.userId.toString() === userId.toString());
      if (participantIndex === -1) {
        throw new Error('User is not a participant in this challenge');
      }
      
      // Update participant status instead of removing
      challenge.participants[participantIndex].status = 'withdrawn';
      
      await challenge.save();
      
      // Record activity
      await this.recordChallengeActivity(challengeId, userId, 'withdraw', {
        metadata: { challengeTitle: challenge.title }
      });
      
      return {
        success: true,
        message: 'Successfully left challenge'
      };
    } catch (error) {
      console.error('Error leaving challenge:', error);
      throw error;
    }
  }

  /**
   * Update user progress in a challenge
   */
  async updateChallengeProgress(challengeId, userId, activityType, activityData = {}) {
    try {
      console.log('Updating challenge progress:', challengeId, userId, activityType);
      
      const challenge = await Challenge.findOne({ challengeId });
      if (!challenge || challenge.status !== 'active') {
        return { success: false, message: 'Challenge not active' };
      }
      
      const participantIndex = challenge.participants.findIndex(p => 
        p.userId.toString() === userId.toString() && p.status === 'active'
      );
      
      if (participantIndex === -1) {
        return { success: false, message: 'User not an active participant' };
      }
      
      const participant = challenge.participants[participantIndex];
      let progressUpdated = false;
      let pointsEarned = 0;
      
      // Update progress based on activity type and challenge objectives
      for (let i = 0; i < challenge.objectives.length; i++) {
        const objective = challenge.objectives[i];
        const objectiveProgress = participant.progress.objectives[i];
        
        if (objectiveProgress.completed) continue;
        
        let incrementValue = 0;
        
        switch (objective.type) {
          case 'points':
            if (activityType === 'points_earned') {
              incrementValue = activityData.points || 0;
            }
            break;
          case 'lessons':
            if (activityType === 'lesson_complete') {
              incrementValue = 1;
            }
            break;
          case 'assessments':
            if (activityType === 'assessment_complete') {
              incrementValue = 1;
            }
            break;
          case 'streak':
            if (activityType === 'streak_update') {
              incrementValue = activityData.streakDays || 0;
              objectiveProgress.currentValue = incrementValue; // Streaks are absolute values
              incrementValue = 0; // Don't add, just set
            }
            break;
          case 'collaboration':
            if (activityType === 'collaboration' || activityType === 'help_peer') {
              incrementValue = 1;
            }
            break;
        }
        
        if (incrementValue > 0 || objective.type === 'streak') {
          const previousValue = objectiveProgress.currentValue;
          objectiveProgress.currentValue = Math.min(
            objective.type === 'streak' ? objectiveProgress.currentValue : previousValue + incrementValue,
            objective.target
          );
          
          // Check if objective completed
          if (!objectiveProgress.completed && objectiveProgress.currentValue >= objective.target) {
            objectiveProgress.completed = true;
            objectiveProgress.completedAt = new Date();
            
            // Award points for completing objective
            const objectivePoints = Math.round(objective.weight * 50);
            pointsEarned += objectivePoints;
            progressUpdated = true;
            
            console.log(`Objective ${i} completed for user ${userId} in challenge ${challengeId}`);
          } else if (incrementValue > 0) {
            progressUpdated = true;
          }
          
          // Record progress activity
          if (progressUpdated) {
            await this.recordChallengeActivity(challengeId, userId, 'progress', {
              objectiveIndex: i,
              previousValue,
              newValue: objectiveProgress.currentValue,
              pointsEarned: objectivePoints || 0,
              metadata: activityData
            });
          }
        }
      }
      
      if (progressUpdated) {
        // Recalculate total score
        participant.progress.currentScore = this.calculateTotalScore(challenge, participant.progress);
        participant.progress.lastActivity = new Date();
        
        // Check if all objectives completed
        const allCompleted = participant.progress.objectives.every(obj => obj.completed);
        if (allCompleted) {
          await this.recordChallengeActivity(challengeId, userId, 'complete_challenge', {
            finalScore: participant.progress.currentScore,
            pointsEarned
          });
          
          // Award completion rewards
          if (challenge.rewards.winner.points > 0) {
            pointsEarned += challenge.rewards.winner.points;
          }
        }
        
        // Update leaderboard positions
        await this.updateChallengeLeaderboard(challenge);
        
        await challenge.save();
        
        // Award points to user
        if (pointsEarned > 0) {
          await gamificationService.awardPoints(userId, 'challenge_complete', {
            challengeId,
            points: pointsEarned,
            description: `Progress in challenge: ${challenge.title}`
          });
        }
      }
      
      return {
        success: true,
        progressUpdated,
        pointsEarned,
        userProgress: participant.progress
      };
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  }

  /**
   * Get user's progress in a specific challenge
   */
  async getUserChallengeProgress(challengeId, userId) {
    try {
      const challenge = await Challenge.findOne({ challengeId });
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      const participant = challenge.participants.find(p => p.userId.toString() === userId.toString());
      if (!participant) {
        return null;
      }
      
      // Get recent activities for this challenge
      const activities = await ChallengeActivity.find({
        challengeId,
        userId
      }).sort({ timestamp: -1 }).limit(10);
      
      return {
        ...participant.progress,
        objectives: challenge.objectives.map((objective, index) => ({
          ...objective,
          progress: participant.progress.objectives[index]
        })),
        recentActivities: activities,
        completionPercentage: this.calculateCompletionPercentage(challenge, participant.progress)
      };
    } catch (error) {
      console.error('Error getting user challenge progress:', error);
      throw error;
    }
  }

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(challengeId, options = {}) {
    try {
      const { limit = 50 } = options;
      
      const challenge = await Challenge.findOne({ challengeId })
        .populate('participants.userId', 'firstName lastName username');
      
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      // Sort participants by score
      const sortedParticipants = challenge.participants
        .filter(p => p.status === 'active')
        .sort((a, b) => b.progress.currentScore - a.progress.currentScore)
        .slice(0, limit);
      
      const leaderboard = sortedParticipants.map((participant, index) => ({
        rank: index + 1,
        userId: participant.userId._id,
        username: participant.userId.username,
        name: `${participant.userId.firstName} ${participant.userId.lastName}`,
        score: participant.progress.currentScore,
        objectives: participant.progress.objectives,
        joinedAt: participant.joinedAt,
        lastActivity: participant.progress.lastActivity,
        completionPercentage: this.calculateCompletionPercentage(challenge, participant.progress)
      }));
      
      return {
        success: true,
        challengeTitle: challenge.title,
        challengeId,
        leaderboard,
        totalParticipants: challenge.participants.filter(p => p.status === 'active').length,
        challenge: {
          endDate: challenge.endDate,
          timeRemaining: this.calculateTimeRemaining(challenge.endDate),
          objectives: challenge.objectives
        }
      };
    } catch (error) {
      console.error('Error getting challenge leaderboard:', error);
      throw error;
    }
  }

  /**
   * Create a team challenge
   */
  async createTeamChallenge(challengeId, teamName, leaderId, memberIds = []) {
    try {
      console.log('Creating team for challenge:', challengeId, teamName);
      
      const challenge = await Challenge.findOne({ challengeId });
      if (!challenge || !challenge.social.allowTeams) {
        throw new Error('Challenge does not support teams');
      }
      
      const teamId = `team_${challengeId}_${Date.now()}`;
      
      const team = new ChallengeTeam({
        challengeId,
        teamName,
        teamId,
        members: [
          {
            userId: leaderId,
            role: 'leader',
            joinedAt: new Date(),
            contribution: { points: 0, objectives: [] }
          },
          ...memberIds.map(userId => ({
            userId,
            role: 'member',
            joinedAt: new Date(),
            contribution: { points: 0, objectives: [] }
          }))
        ],
        progress: {
          totalScore: 0,
          objectives: challenge.objectives.map((_, index) => ({
            objectiveIndex: index,
            currentValue: 0,
            completed: false
          })),
          rank: null,
          lastActivity: new Date()
        }
      });
      
      await team.save();
      
      return {
        success: true,
        team: team.toJSON(),
        teamId
      };
    } catch (error) {
      console.error('Error creating team challenge:', error);
      throw error;
    }
  }

  /**
   * Get user's team challenges
   */
  async getUserTeamChallenges(userId) {
    try {
      const teams = await ChallengeTeam.find({
        'members.userId': userId,
        status: 'active'
      }).populate('challengeId');
      
      return {
        success: true,
        teams: teams.map(team => team.toJSON())
      };
    } catch (error) {
      console.error('Error getting user team challenges:', error);
      throw error;
    }
  }

  // Helper methods
  checkEligibility(challenge, user, userGamification) {
    if (!user || !userGamification) return false;
    
    const eligibility = challenge.participation.eligibility;
    
    if (eligibility.minLevel && userGamification.level < eligibility.minLevel) return false;
    if (eligibility.maxLevel && userGamification.level > eligibility.maxLevel) return false;
    
    if (eligibility.requiredBadges.length > 0) {
      const userBadges = userGamification.badges.map(b => b.badgeId);
      const hasAllBadges = eligibility.requiredBadges.every(badge => userBadges.includes(badge));
      if (!hasAllBadges) return false;
    }
    
    return true;
  }
  
  calculateTimeRemaining(endDate) {
    const now = new Date();
    const remaining = endDate.getTime() - now.getTime();
    
    if (remaining <= 0) return { expired: true };
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, totalMs: remaining };
  }
  
  calculateTimeUntilStart(startDate) {
    const now = new Date();
    const until = startDate.getTime() - now.getTime();
    
    if (until <= 0) return { started: true };
    
    const days = Math.floor(until / (1000 * 60 * 60 * 24));
    const hours = Math.floor((until % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours, totalMs: until };
  }
  
  calculateTotalScore(challenge, progress) {
    return challenge.objectives.reduce((total, objective, index) => {
      const objectiveProgress = progress.objectives[index];
      const completionRatio = Math.min(objectiveProgress.currentValue / objective.target, 1);
      return total + (completionRatio * objective.weight * 100);
    }, 0);
  }
  
  calculateCompletionPercentage(challenge, progress) {
    const completedObjectives = progress.objectives.filter(obj => obj.completed).length;
    return challenge.objectives.length > 0 ? (completedObjectives / challenge.objectives.length) * 100 : 0;
  }
  
  async updateChallengeLeaderboard(challenge) {
    // Sort participants by score and update ranks
    const activeParticipants = challenge.participants
      .filter(p => p.status === 'active')
      .sort((a, b) => b.progress.currentScore - a.progress.currentScore);
    
    activeParticipants.forEach((participant, index) => {
      participant.progress.rank = index + 1;
    });
  }
  
  async recordChallengeActivity(challengeId, userId, activityType, data = {}) {
    try {
      const activity = new ChallengeActivity({
        challengeId,
        userId,
        activityType,
        data,
        timestamp: new Date()
      });
      
      await activity.save();
      return activity;
    } catch (error) {
      console.error('Error recording challenge activity:', error);
      throw error;
    }
  }

  /**
   * Get challenge analytics for admin/instructor
   */
  async getChallengeAnalytics(challengeId) {
    try {
      const challenge = await Challenge.findOne({ challengeId });
      if (!challenge) {
        throw new Error('Challenge not found');
      }
      
      const activities = await ChallengeActivity.find({ challengeId });
      
      const analytics = {
        overview: {
          totalParticipants: challenge.participants.length,
          activeParticipants: challenge.participants.filter(p => p.status === 'active').length,
          completionRate: challenge.analytics.completionRate,
          averageScore: challenge.analytics.averageScore
        },
        engagement: {
          dailyActivities: this.groupActivitiesByDay(activities),
          objectiveProgress: this.analyzeObjectiveProgress(challenge),
          retentionRate: this.calculateRetentionRate(challenge, activities)
        },
        leaderboard: challenge.participants
          .filter(p => p.status === 'active')
          .sort((a, b) => b.progress.currentScore - a.progress.currentScore)
          .slice(0, 10)
      };
      
      return {
        success: true,
        analytics
      };
    } catch (error) {
      console.error('Error getting challenge analytics:', error);
      throw error;
    }
  }
  
  groupActivitiesByDay(activities) {
    const grouped = {};
    activities.forEach(activity => {
      const day = activity.timestamp.toISOString().split('T')[0];
      if (!grouped[day]) grouped[day] = 0;
      grouped[day]++;
    });
    return grouped;
  }
  
  analyzeObjectiveProgress(challenge) {
    return challenge.objectives.map((objective, index) => {
      const participants = challenge.participants.filter(p => p.status === 'active');
      const completedCount = participants.filter(p => 
        p.progress.objectives[index] && p.progress.objectives[index].completed
      ).length;
      
      return {
        objectiveIndex: index,
        objectiveType: objective.type,
        target: objective.target,
        completionRate: participants.length > 0 ? (completedCount / participants.length) * 100 : 0,
        averageProgress: participants.length > 0 ? 
          participants.reduce((sum, p) => 
            sum + (p.progress.objectives[index]?.currentValue || 0), 0) / participants.length : 0
      };
    });
  }
  
  calculateRetentionRate(challenge, activities) {
    const joinActivities = activities.filter(a => a.activityType === 'join');
    const recentActivities = activities.filter(a => 
      a.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    );
    
    const uniqueRecentUsers = new Set(recentActivities.map(a => a.userId.toString()));
    
    return joinActivities.length > 0 ? 
      (uniqueRecentUsers.size / joinActivities.length) * 100 : 0;
  }
}

const challengeService = new ChallengeService();
export default challengeService;
