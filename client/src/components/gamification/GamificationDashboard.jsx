import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Medal, 
  Flame, 
  Target, 
  TrendingUp,
  Award,
  Users,
  Crown,
  Zap,
  ChevronRight,
  Calendar,
  Clock,
  // Added social learning icons
  MessageCircle,
  UserPlus,
  Heart,
  BookOpen,
  Video,
  Share2,
  // Added new component navigation icons
  Timer,
  Gift,
  ArrowRight
} from 'lucide-react';

// Import new components
import AchievementProgress from './AchievementProgress';
import Leaderboard from './Leaderboard';
import StreakTracker from './StreakTracker';
import ChallengeSystem from './ChallengeSystem';

/**
 * Enhanced Gamification Dashboard Component with Social Features
 * Displays user's points, badges, achievements, streaks, leaderboard position, and social stats
 * Now includes navigation to specialized gamification components
 */
const GamificationDashboard = ({ onBackToMain }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [socialData, setSocialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentView, setCurrentView] = useState('dashboard'); // New state for view management

  useEffect(() => {
    fetchDashboardData();
    fetchSocialData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch enhanced dashboard data with social features
      const dashboardResponse = await fetch('/api/gamification/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const dashboardResult = await dashboardResponse.json();

      // Fetch leaderboard
      const leaderboardResponse = await fetch('/api/gamification/leaderboard?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const leaderboardResult = await leaderboardResponse.json();

      // Fetch user's rank
      const rankResponse = await fetch('/api/gamification/leaderboard/rank', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const rankResult = await rankResponse.json();      setDashboardData(dashboardResult);
      setLeaderboard(leaderboardResult);
      setUserRank(rankResult);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      // Set fallback data for development
      setDashboardData({
        success: true,
        profile: {
          totalPoints: 1250,
          level: 5,
          currentStreak: 7,
          longestStreak: 15,
          globalRank: 'N/A',
          socialRank: 'N/A',
          levelProgress: 65,
          pointsToNextLevel: 350,
          badges: 8,
          achievements: 12,
          collaborationScore: 85,
          mentorshipLevel: 'Intermediate'
        },
        badges: [
          { badgeId: 'first_steps', name: 'First Steps', rarity: 'common', earnedAt: new Date() },
          { badgeId: 'consistent_learner', name: 'Consistent Learner', rarity: 'uncommon', earnedAt: new Date() }
        ],
        achievements: [
          { 
            achievementId: 'knowledge_seeker', 
            name: 'Knowledge Seeker', 
            description: 'Complete 10 lessons',
            difficulty: 'bronze',
            progress: { current: 7, target: 10 }
          },
          { 
            achievementId: 'streak_starter', 
            name: 'Streak Starter', 
            description: 'Maintain a 7-day learning streak',
            difficulty: 'silver',
            progress: { current: 7, target: 7 }
          }
        ],
        recentActivities: [
          {
            id: 1,
            type: 'lesson_completion',
            description: 'Completed lesson: React Hooks',
            points: 25,
            timestamp: new Date(),
            isSocial: false
          },
          {
            id: 2,
            type: 'study_group_activity',
            description: 'Joined study group discussion',
            points: 15,
            timestamp: new Date(),
            isSocial: true
          }
        ],
        levelProgress: { percentage: 65, pointsToNext: 350 },
        availableBadges: [
          { badgeId: 'helper', name: 'Helper', rarity: 'common' },
          { badgeId: 'mentor', name: 'Mentor', rarity: 'rare' }
        ],
        achievementProgress: [
          { 
            achievementId: 'learning_master', 
            name: 'Learning Master', 
            description: 'Complete 50 lessons',
            difficulty: 'gold',
            progress: { current: 23, target: 50 }
          }
        ],
        socialStats: {
          studyGroupsJoined: 3,
          studyBuddyCount: 5,
          helpfulAnswers: 12,
          mentoringSessions: 2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Added social data fetch function
  const fetchSocialData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch social recommendations
      const socialResponse = await fetch('/api/gamification/recommendations/social', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const socialResult = await socialResponse.json();

      setSocialData(socialResult.recommendations || {});
    } catch (error) {
      console.error('Error fetching social data:', error);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-700 border-gray-300',
      uncommon: 'bg-green-100 text-green-700 border-green-300',
      rare: 'bg-blue-100 text-blue-700 border-blue-300',
      epic: 'bg-purple-100 text-purple-700 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300'
    };
    return colors[rarity] || colors.common;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-orange-600',
      expert: 'text-red-600'
    };
    return colors[difficulty] || colors.medium;
  };

  // Handle navigation between components
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Render component based on current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'achievements':
        return <AchievementProgress onBackToMain={() => setCurrentView('dashboard')} />;
      case 'leaderboard':
        return <Leaderboard onBackToMain={() => setCurrentView('dashboard')} />;
      case 'streaks':
        return <StreakTracker onBackToMain={() => setCurrentView('dashboard')} />;
      case 'challenges':
        return <ChallengeSystem onBackToMain={() => setCurrentView('dashboard')} />;
      default:
        return renderDashboard();
    }
  };

  // Original dashboard render function
  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (!dashboardData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gamification Dashboard</h2>
            <p className="text-gray-600">Unable to load gamification data</p>
          </div>
        </div>
      );
    }

    // Extract data from the response structure
    const profile = dashboardData.profile || {};
    const levelProgress = dashboardData.levelProgress || { percentage: 0, pointsToNext: 100 };
    const recentActivities = dashboardData.recentActivities || [];
    const availableBadges = dashboardData.badges || [];
    const achievementProgress = dashboardData.achievements || [];
    const socialStats = dashboardData.socialStats || {};

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Back to Main Dashboard
              </button>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎮 Gamification Dashboard
            </h1>
            <p className="text-gray-600">
              Track your learning achievements, compete with peers, and unlock rewards!
            </p>
          </motion.div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleViewChange('achievements')}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Achievements</h3>
              <p className="text-gray-600 text-sm">Track progress on all achievements and unlock badges</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleViewChange('leaderboard')}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Leaderboard</h3>
              <p className="text-gray-600 text-sm">Compete with peers and see your ranking</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleViewChange('streaks')}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Streak Tracker</h3>
              <p className="text-gray-600 text-sm">Maintain learning streaks and earn multipliers</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleViewChange('challenges')}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenges</h3>
              <p className="text-gray-600 text-sm">Take on challenges and earn exclusive rewards</p>
            </motion.div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Points */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-3xl font-bold text-purple-600">{profile.totalPoints.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Rank #{userRank?.rank || 'N/A'}</span>
              </div>
            </motion.div>

            {/* Current Level */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Level</p>
                  <p className="text-3xl font-bold text-blue-600">{profile.level}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Crown className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress to Level {profile.level + 1}</span>
                  <span>{levelProgress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Badges Earned */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                  <p className="text-3xl font-bold text-yellow-600">{profile.badges}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Medal className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Award className="h-4 w-4 mr-1" />
                <span>{achievementProgress.length} in progress</span>
              </div>
            </motion.div>

            {/* Current Streak */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Streak</p>
                  <p className="text-3xl font-bold text-orange-600">{profile.streaks.current.dailyLearning}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Zap className="h-4 w-4 mr-1" />
                <span>Best: {profile.streaks.longest.dailyLearning} days</span>
              </div>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: Trophy },
              { id: 'achievements', label: 'Achievements', icon: Target },
              { id: 'leaderboard', label: 'Leaderboard', icon: Users },
              { id: 'activity', label: 'Activity', icon: Clock },
              // Added social tab
              { id: 'social', label: 'Social', icon: Users }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Available Badges</h3>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {availableBadges.slice(0, 6).map((badge, index) => (
                        <motion.div
                          key={badge.badgeId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg border-2 ${getRarityColor(badge.rarity)} text-center`}
                        >
                          <div className="text-2xl mb-1">🏆</div>
                          <p className="text-xs font-medium">{badge.name}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Achievement Progress */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Achievements in Progress</h3>
                      <Target className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                      {achievementProgress.slice(0, 4).map((achievement, index) => (
                        <motion.div
                          key={achievement.achievementId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-l-4 border-purple-200 pl-4"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{achievement.name}</h4>
                            <span className={`text-xs ${getDifficultyColor(achievement.difficulty)}`}>
                              {achievement.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress.current} / {achievement.progress.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <motion.div
                              className="bg-purple-600 h-1.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === 'leaderboard' && leaderboard && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Global Leaderboard</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Your Rank: #{userRank?.rank || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {leaderboard.leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-400 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-400 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {entry.rank}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{entry.user.name}</p>
                            <p className="text-xs text-gray-500">@{entry.user.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{entry.totalPoints.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Level {entry.level}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 border-l-4 border-purple-200 bg-purple-50 rounded-r-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-purple-600">+{activity.points}</p>
                          {activity.metadata.streakBonus && (
                            <p className="text-xs text-orange-600">Streak Bonus!</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}            {activeTab === 'social' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Social Stats Overview */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Social Learning Stats
                    </h3>                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {socialStats?.studyGroupsJoined || 0}
                        </div>
                        <div className="text-sm text-gray-600">Study Groups</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {socialStats?.studyBuddyCount || 0}
                        </div>
                        <div className="text-sm text-gray-600">Study Buddies</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {socialStats?.helpfulAnswers || 0}
                        </div>
                        <div className="text-sm text-gray-600">Helpful Answers</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {socialStats?.mentoringSessions || 0}
                        </div>
                        <div className="text-sm text-gray-600">Mentoring Sessions</div>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Showcase */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                      Recent Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievementProgress.slice(0, 4).map((achievement, index) => (
                        <motion.div
                          key={achievement.achievementId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{achievement.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              achievement.difficulty === 'bronze' ? 'bg-orange-100 text-orange-700' :
                              achievement.difficulty === 'silver' ? 'bg-gray-100 text-gray-700' :
                              achievement.difficulty === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {achievement.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">{achievement.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{achievement.progress?.current || 0} / {achievement.progress?.target || 1}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((achievement.progress?.current || 0) / (achievement.progress?.target || 1)) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Study Buddy Recommendations */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserPlus className="h-5 w-5 mr-2 text-purple-600" />
                      Recommended Study Buddies
                    </h3>
                    <div className="space-y-3">
                      {socialData?.studyBuddies?.slice(0, 3).map((user, index) => (
                        <motion.div
                          key={user.userId || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <UserPlus className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.name || 'Study Buddy'}</p>
                              <p className="text-xs text-gray-500">
                                {user.subjects?.join(', ') || 'Mathematics, Physics'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              {user.compatibilityScore || 92}% match
                            </span>
                            <button className="px-3 py-1 text-sm font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              Connect
                            </button>
                          </div>
                        </motion.div>
                      )) || (
                        <div className="text-center py-4 text-gray-500">
                          <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No recommendations available yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Study Group Recommendations */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                      Recommended Study Groups
                    </h3>
                    <div className="space-y-3">
                      {socialData?.studyGroups?.slice(0, 3).map((group, index) => (
                        <motion.div
                          key={group.groupId || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{group.name || 'Study Group'}</p>
                              <p className="text-xs text-gray-500">{group.subject || 'General'} • {group.memberCount || 5} members</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {group.matchScore || 85}% match
                            </span>
                            <button className="px-3 py-1 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors">
                              Join
                            </button>
                          </div>
                        </motion.div>
                      )) || (
                        <div className="text-center py-4 text-gray-500">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No recommendations available yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Social Activities */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Social Activities
                    </h3>
                    <div className="space-y-3">
                      {dashboardData?.recentActivities?.filter(activity => activity.isSocial)?.slice(0, 5).map((activity, index) => (
                        <motion.div
                          key={activity.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 border-l-4 border-blue-200 bg-blue-50 rounded-r-lg"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              {activity.type === 'study_group_activity' && <Users className="h-4 w-4 text-blue-600" />}
                              {activity.type === 'peer_help' && <Heart className="h-4 w-4 text-blue-600" />}
                              {activity.type === 'forum_contribution' && <MessageCircle className="h-4 w-4 text-blue-600" />}
                              {activity.type === 'social_interaction' && <Share2 className="h-4 w-4 text-blue-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">+{activity.points}</p>
                            <div className="flex items-center text-xs text-blue-500">
                              <Star className="h-3 w-3 mr-1" />
                              <span>Social Points</span>
                            </div>
                          </div>
                        </motion.div>
                      )) || (
                        <div className="text-center py-4 text-gray-500">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No recent social activities</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  return renderCurrentView();
};

export default GamificationDashboard;
