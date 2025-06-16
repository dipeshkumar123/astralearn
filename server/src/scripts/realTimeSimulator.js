/**
 * Real-time Activity Simulator for AstraLearn
 * 
 * This script simulates realistic user activity to test real-time features:
 * - User logins and learning sessions
 * - Progress updates and course interactions
 * - Social interactions (messages, discussions, study groups)
 * - Gamification events (badge earnings, achievements)
 * - WebSocket events and notifications
 * - Live dashboard updates
 */

import mongoose from 'mongoose';
import { config } from '../config/environment.js';
import webSocketService from '../services/webSocketService.js';

// Import models
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { UserProgress } from '../models/UserProgress.js';
import { StudyGroup, DiscussionPost } from '../models/SocialLearning.js';
import { UserGamification } from '../models/Gamification.js';

class RealTimeActivitySimulator {
  constructor() {
    this.isRunning = false;
    this.intervals = [];
    this.users = [];
    this.courses = [];
    this.studyGroups = [];
    this.activeUsers = new Set();
    
    this.simulationConfig = {
      maxActiveUsers: 15,        // Maximum concurrent active users
      learningSessionInterval: 30000,    // 30 seconds between learning activities
      socialActivityInterval: 45000,     // 45 seconds between social activities
      progressUpdateInterval: 60000,     // 1 minute between progress updates
      gamificationInterval: 120000,      // 2 minutes between gamification events
      userLoginInterval: 20000           // 20 seconds between user logins/logouts
    };
  }

  /**
   * Initialize the simulator
   */
  async initialize() {
    console.log('🎬 Initializing Real-time Activity Simulator...');
    
    try {
      await mongoose.connect(config.database.mongoUri);
      console.log('✅ Connected to database');

      // Load data
      await this.loadData();
      
      console.log('✅ Simulator initialized successfully');
      console.log(`📊 Loaded: ${this.users.length} users, ${this.courses.length} courses, ${this.studyGroups.length} study groups`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize simulator:', error);
      return false;
    }
  }

  /**
   * Load required data for simulation
   */
  async loadData() {
    console.log('📚 Loading simulation data...');
    
    this.users = await User.find({ role: 'student' }).limit(25);
    this.courses = await Course.find({ isPublished: true }).limit(15);
    this.studyGroups = await StudyGroup.find({ status: 'active' }).limit(10);
    
    console.log(`   👥 ${this.users.length} users loaded`);
    console.log(`   📚 ${this.courses.length} courses loaded`);
    console.log(`   🤝 ${this.studyGroups.length} study groups loaded`);
  }

  /**
   * Start the real-time simulation
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Simulator is already running');
      return;
    }

    console.log('🚀 Starting Real-time Activity Simulation...');
    console.log('=' .repeat(60));
    
    this.isRunning = true;

    // Start different types of activities
    this.startLearningActivities();
    this.startSocialActivities();
    this.startProgressUpdates();
    this.startGamificationEvents();
    this.startUserSessions();

    console.log('✅ All simulation activities started');
    console.log('📊 Real-time data generation in progress...');
    console.log('   Use Ctrl+C to stop the simulation');
  }

  /**
   * Stop the simulation
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Simulator is not running');
      return;
    }

    console.log('🛑 Stopping Real-time Activity Simulation...');
    
    this.isRunning = false;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    console.log('✅ Simulation stopped');
  }

  /**
   * Simulate learning activities
   */
  startLearningActivities() {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.simulateLearningSession();
      } catch (error) {
        console.error('❌ Error in learning activity simulation:', error.message);
      }
    }, this.simulationConfig.learningSessionInterval);

    this.intervals.push(interval);
    console.log('📖 Learning activities simulation started');
  }

  async simulateLearningSession() {
    const user = this.getRandomUser();
    const course = this.getRandomCourse();
    
    // Simulate lesson completion
    const progress = await UserProgress.findOne({ 
      userId: user._id, 
      courseId: course._id 
    });

    if (progress && progress.completedLessons < progress.totalLessons) {
      progress.completedLessons += 1;
      progress.progress = Math.round((progress.completedLessons / progress.totalLessons) * 100);
      progress.lastAccessed = new Date();
      progress.timeSpent += Math.floor(Math.random() * 1800) + 600; // 10-40 minutes
      
      await progress.save();
      
      this.logActivity('📖', `${user.firstName} completed a lesson in "${course.title}" (${progress.progress}% complete)`);
      
      // Emit WebSocket event
      this.emitProgressUpdate(user._id, course._id, progress.progress);
    }
  }

  /**
   * Simulate social activities
   */
  startSocialActivities() {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.simulateSocialActivity();
      } catch (error) {
        console.error('❌ Error in social activity simulation:', error.message);
      }
    }, this.simulationConfig.socialActivityInterval);

    this.intervals.push(interval);
    console.log('🤝 Social activities simulation started');
  }

  async simulateSocialActivity() {
    const activities = [
      'joinStudyGroup',
      'postMessage',
      'likePost',
      'shareResource'
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    switch (activity) {
      case 'joinStudyGroup':
        await this.simulateStudyGroupJoin();
        break;
      case 'postMessage':
        await this.simulateDiscussionPost();
        break;
      case 'likePost':
        await this.simulatePostInteraction();
        break;
      case 'shareResource':
        await this.simulateResourceSharing();
        break;
    }
  }

  async simulateStudyGroupJoin() {
    const user = this.getRandomUser();
    const studyGroup = this.getRandomStudyGroup();
    
    if (studyGroup && studyGroup.members.length < studyGroup.maxMembers) {
      const isAlreadyMember = studyGroup.members.some(
        member => member.userId.toString() === user._id.toString()
      );
      
      if (!isAlreadyMember) {
        studyGroup.members.push({
          userId: user._id,
          role: 'member',
          joinedAt: new Date(),
          isActive: true,
          permissions: {
            canInvite: false,
            canModerate: false,
            canSchedule: false
          }
        });
        
        await studyGroup.save();
        
        this.logActivity('🤝', `${user.firstName} joined study group "${studyGroup.name}"`);
        this.emitSocialUpdate('study_group_join', { userId: user._id, groupId: studyGroup._id });
      }
    }
  }

  async simulateDiscussionPost() {
    const user = this.getRandomUser();
    const course = this.getRandomCourse();
    
    const postTitles = [
      'Need help with assignment',
      'Great resource to share',
      'Question about concepts',
      'Study group meetup',
      'Tips for exam preparation'
    ];
    
    const title = postTitles[Math.floor(Math.random() * postTitles.length)];
    
    try {
      const post = new DiscussionPost({
        postId: `discussion_${Date.now()}_${user._id}`,
        title: `${title} - ${course.title}`,
        content: 'This is a simulated discussion post to test real-time social features.',
        type: 'discussion',
        authorId: user._id,
        courseId: course._id,
        tags: course.tags.slice(0, 2),
        status: 'published',
        visibility: 'public',
        engagement: {
          views: Math.floor(Math.random() * 10) + 1,
          likes: 0,
          replies: 0,
          shares: 0
        }
      });
      
      await post.save();
      
      this.logActivity('💬', `${user.firstName} posted in ${course.title} discussion forum`);
      this.emitSocialUpdate('new_discussion_post', { 
        userId: user._id, 
        courseId: course._id,
        postId: post.postId 
      });
    } catch (error) {
      // Handle potential duplicate postId
      console.log('   ⚠️  Skipped duplicate discussion post');
    }
  }

  async simulatePostInteraction() {
    const user = this.getRandomUser();
    const posts = await DiscussionPost.find().limit(5);
    
    if (posts.length > 0) {
      const post = posts[Math.floor(Math.random() * posts.length)];
      post.engagement.likes += 1;
      post.engagement.views += 1;
      
      await post.save();
      
      this.logActivity('👍', `${user.firstName} liked a discussion post`);
      this.emitSocialUpdate('post_interaction', { 
        userId: user._id, 
        postId: post.postId,
        action: 'like'
      });
    }
  }

  async simulateResourceSharing() {
    const user = this.getRandomUser();
    const course = this.getRandomCourse();
    
    this.logActivity('📚', `${user.firstName} shared a resource for ${course.title}`);
    this.emitSocialUpdate('resource_shared', { 
      userId: user._id, 
      courseId: course._id,
      resourceType: 'link'
    });
  }

  /**
   * Simulate progress updates
   */
  startProgressUpdates() {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.simulateProgressUpdate();
      } catch (error) {
        console.error('❌ Error in progress update simulation:', error.message);
      }
    }, this.simulationConfig.progressUpdateInterval);

    this.intervals.push(interval);
    console.log('📈 Progress updates simulation started');
  }

  async simulateProgressUpdate() {
    const user = this.getRandomUser();
    const progressRecords = await UserProgress.find({ userId: user._id }).limit(3);
    
    if (progressRecords.length > 0) {
      const progress = progressRecords[Math.floor(Math.random() * progressRecords.length)];
      
      // Simulate time spent increase
      progress.timeSpent += Math.floor(Math.random() * 600) + 300; // 5-15 minutes
      progress.lastAccessed = new Date();
      
      // Maybe complete another lesson
      if (Math.random() > 0.7 && progress.completedLessons < progress.totalLessons) {
        progress.completedLessons += 1;
        progress.progress = Math.round((progress.completedLessons / progress.totalLessons) * 100);
        
        const course = await Course.findById(progress.courseId);
        this.logActivity('📊', `${user.firstName} made progress in "${course?.title}" (${progress.progress}%)`);
      }
      
      await progress.save();
      
      this.emitProgressUpdate(user._id, progress.courseId, progress.progress);
    }
  }

  /**
   * Simulate gamification events
   */
  startGamificationEvents() {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.simulateGamificationEvent();
      } catch (error) {
        console.error('❌ Error in gamification simulation:', error.message);
      }
    }, this.simulationConfig.gamificationInterval);

    this.intervals.push(interval);
    console.log('🏆 Gamification events simulation started');
  }

  async simulateGamificationEvent() {
    const user = this.getRandomUser();
    const gamification = await UserGamification.findOne({ userId: user._id });
    
    if (gamification) {
      // Award random points
      const pointsEarned = Math.floor(Math.random() * 50) + 10; // 10-60 points
      gamification.totalPoints += pointsEarned;
      gamification.experiencePoints += pointsEarned * 1.2;
      
      // Check for level up
      const newLevel = Math.floor(gamification.totalPoints / 100) + 1;
      if (newLevel > gamification.level) {
        gamification.level = newLevel;
        this.logActivity('🎊', `${user.firstName} leveled up to Level ${newLevel}!`);
        this.emitGamificationUpdate(user._id, 'level_up', { newLevel });
      } else {
        this.logActivity('💰', `${user.firstName} earned ${pointsEarned} points`);
        this.emitGamificationUpdate(user._id, 'points_earned', { points: pointsEarned });
      }
      
      await gamification.save();
    }
  }

  /**
   * Simulate user sessions (login/logout)
   */
  startUserSessions() {
    const interval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.simulateUserSession();
      } catch (error) {
        console.error('❌ Error in user session simulation:', error.message);
      }
    }, this.simulationConfig.userLoginInterval);

    this.intervals.push(interval);
    console.log('👤 User sessions simulation started');
  }

  async simulateUserSession() {
    if (this.activeUsers.size < this.simulationConfig.maxActiveUsers && Math.random() > 0.3) {
      // User login
      const availableUsers = this.users.filter(u => !this.activeUsers.has(u._id.toString()));
      if (availableUsers.length > 0) {
        const user = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        this.activeUsers.add(user._id.toString());
        
        // Update last active
        user.lastActiveAt = new Date();
        await user.save();
        
        this.logActivity('🟢', `${user.firstName} came online`);
        this.emitUserStatusUpdate(user._id, 'online');
      }
    } else if (this.activeUsers.size > 0 && Math.random() > 0.6) {
      // User logout
      const activeUserIds = Array.from(this.activeUsers);
      const userIdToLogout = activeUserIds[Math.floor(Math.random() * activeUserIds.length)];
      const user = this.users.find(u => u._id.toString() === userIdToLogout);
      
      if (user) {
        this.activeUsers.delete(userIdToLogout);
        this.logActivity('🔴', `${user.firstName} went offline`);
        this.emitUserStatusUpdate(user._id, 'offline');
      }
    }
  }

  /**
   * WebSocket event emitters
   */
  emitProgressUpdate(userId, courseId, progress) {
    if (webSocketService.io) {
      webSocketService.io.emit('progress_update', {
        userId,
        courseId,
        progress,
        timestamp: new Date().toISOString()
      });
    }
  }

  emitSocialUpdate(type, data) {
    if (webSocketService.io) {
      webSocketService.io.emit('social_activity', {
        type,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  emitGamificationUpdate(userId, type, data) {
    if (webSocketService.io) {
      webSocketService.io.emit('gamification_update', {
        userId,
        type,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  emitUserStatusUpdate(userId, status) {
    if (webSocketService.io) {
      webSocketService.io.emit('user_status_change', {
        userId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Utility functions
   */
  getRandomUser() {
    return this.users[Math.floor(Math.random() * this.users.length)];
  }

  getRandomCourse() {
    return this.courses[Math.floor(Math.random() * this.courses.length)];
  }

  getRandomStudyGroup() {
    return this.studyGroups[Math.floor(Math.random() * this.studyGroups.length)];
  }

  logActivity(icon, message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${timestamp} ${icon} ${message}`);
  }

  /**
   * Get simulation statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      activeUsers: this.activeUsers.size,
      totalUsers: this.users.length,
      totalCourses: this.courses.length,
      totalStudyGroups: this.studyGroups.length,
      intervalsRunning: this.intervals.length
    };
  }

  /**
   * Display status
   */
  displayStatus() {
    const stats = this.getStats();
    console.log('📊 SIMULATION STATUS:');
    console.log(`   Status: ${stats.isRunning ? '🟢 Running' : '🔴 Stopped'}`);
    console.log(`   Active Users: ${stats.activeUsers}/${this.simulationConfig.maxActiveUsers}`);
    console.log(`   Total Users: ${stats.totalUsers}`);
    console.log(`   Total Courses: ${stats.totalCourses}`);
    console.log(`   Study Groups: ${stats.totalStudyGroups}`);
    console.log(`   Active Intervals: ${stats.intervalsRunning}`);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const simulator = new RealTimeActivitySimulator();
  
  async function main() {
    const initialized = await simulator.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize simulator');
      process.exit(1);
    }

    simulator.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received interrupt signal...');
      simulator.stop();
      process.exit(0);
    });

    // Display status every 30 seconds
    setInterval(() => {
      simulator.displayStatus();
    }, 30000);
  }

  main().catch(console.error);
}

export default RealTimeActivitySimulator;
