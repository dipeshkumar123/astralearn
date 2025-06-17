import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageCircle,
  UserPlus,
  Heart,
  Share2,
  Calendar,
  Star,
  Trophy,
  Target,
  Clock,
  BookOpen,
  Video,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Bell,
  Search,
  Filter,
  Plus
} from 'lucide-react';

// Import real-time integration service
import realTimeIntegrationService from '../../services/realTimeIntegrationService';

/**
 * Social Dashboard Component
 * Enhanced social learning interface with comprehensive social features
 */
const SocialDashboard = ({ userRole = 'student', onBackToMain }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [socialData, setSocialData] = useState(null);
  const [studyGroups, setStudyGroups] = useState([]);
  const [studyBuddies, setStudyBuddies] = useState([]);
  const [socialRecommendations, setSocialRecommendations] = useState({});  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimeNotifications, setRealTimeNotifications] = useState([]);

  useEffect(() => {
    fetchSocialData();
    initializeRealTimeFeatures();
    
    return () => {
      cleanupRealTimeFeatures();
    };
  }, []);  const fetchSocialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Fetch social dashboard data with individual error handling
      try {
        const dashboardResponse = await fetch('/api/social-learning/dashboard/social', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setSocialData(dashboardData.dashboard || {});
          setActivityFeed(dashboardData.dashboard?.recentActivities?.filter(a => a.isSocial) || []);
        } else {
          console.warn('Failed to load social dashboard:', dashboardResponse.status);
          // Set fallback social data
          setSocialData({
            socialScore: 750,
            studyBuddiesCount: 5,
            studyGroupsCount: 2,
            socialAchievements: 8,
            weeklyGoal: 1000,
            weeklyProgress: 75
          });
          setActivityFeed([
            { id: 1, type: 'achievement', user: 'You', content: 'Earned Social Learner badge', timestamp: '2h ago', isSocial: true },
            { id: 2, type: 'group', user: 'Study Group', content: 'New discussion started in JavaScript Fundamentals', timestamp: '4h ago', isSocial: true }
          ]);
        }
      } catch (dashboardError) {
        console.error('Social dashboard loading error:', dashboardError);
        setSocialData({});
        setActivityFeed([]);
      }

      // Fetch study groups with individual error handling
      try {
        const groupsResponse = await fetch('/api/social-learning/study-groups/my-groups', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          setStudyGroups(groupsData.studyGroups || []);
        } else {
          console.warn('Failed to load study groups:', groupsResponse.status);
          // Set fallback study groups
          setStudyGroups([
            {
              id: 'group-1',
              name: 'JavaScript Fundamentals',
              members: 12,
              type: 'study',
              nextSession: 'Tomorrow 3:00 PM'
            },
            {
              id: 'group-2', 
              name: 'React Advanced Concepts',
              members: 8,
              type: 'discussion',
              nextSession: 'Friday 2:00 PM'
            }
          ]);
        }
      } catch (groupsError) {
        console.error('Study groups loading error:', groupsError);
        setStudyGroups([]);
      }

      // Fetch study buddies with individual error handling
      try {
        const buddiesResponse = await fetch('/api/social-learning/study-buddies/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (buddiesResponse.ok) {
          const buddiesData = await buddiesResponse.json();
          setStudyBuddies(buddiesData.studyBuddies || []);
        } else {
          console.warn('Failed to load study buddies:', buddiesResponse.status);
          // Set fallback study buddies
          setStudyBuddies([
            {
              id: 'buddy-1',
              name: 'Alex Chen',
              status: 'online',
              avatar: null,
              studyTopic: 'React Hooks',
              compatibility: 92
            },
            {
              id: 'buddy-2',
              name: 'Sarah Johnson', 
              status: 'studying',
              avatar: null,
              studyTopic: 'JavaScript ES6',
              compatibility: 88
            }
          ]);
        }
      } catch (buddiesError) {
        console.error('Study buddies loading error:', buddiesError);
        setStudyBuddies([]);
      }

      // Fetch social recommendations with individual error handling
      try {
        const recommendationsResponse = await fetch('/api/gamification/recommendations/social', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          setSocialRecommendations(recommendationsData.recommendations || {});
        } else {
          console.warn('Failed to load social recommendations:', recommendationsResponse.status);
          // Set fallback recommendations
          setSocialRecommendations({
            studyGroups: [
              { name: 'Advanced React Patterns', members: 15, match: 95 },
              { name: 'Backend Development', members: 22, match: 87 }
            ],
            studyBuddies: [
              { name: 'Emma Davis', compatibility: 94, sharedCourses: 3 },
              { name: 'Michael Brown', compatibility: 89, sharedCourses: 2 }
            ]
          });
        }
      } catch (recommendationsError) {
        console.error('Social recommendations loading error:', recommendationsError);
        setSocialRecommendations({});
      }

    } catch (error) {
      console.error('Error fetching social data:', error);
      setError('Failed to load some social data. You can still access available features.');
    } finally {
      setLoading(false);
    }
  };

  // ========== Real-time Social Interaction Methods ==========

  const sendStudyBuddyRequest = async (targetUserId, message) => {
    try {
      const token = localStorage.getItem('token');
      
      // Send via real-time service
      realTimeIntegrationService.sendStudyBuddyRequest(targetUserId, message);
      
      // Also send via REST API for persistence
      await fetch('/api/social-learning/study-buddies/send-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId, message })
      });

      setRealTimeNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        title: 'Study Buddy Request Sent',
        message: 'Your study buddy request has been sent!',
        timestamp: new Date().toISOString()
      }, ...prev]);

    } catch (error) {
      console.error('Error sending study buddy request:', error);
    }
  };

  const updateStudyBuddyStatus = async (status, studyTopic = null) => {
    try {
      // Update via real-time service
      realTimeIntegrationService.updateStudyBuddyStatus(status, studyTopic);
      
      // Update local state immediately
      setSocialData(prev => prev ? {
        ...prev,
        currentStatus: status,
        currentStudyTopic: studyTopic
      } : null);

      console.log(`📱 Study buddy status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating study buddy status:', error);
    }
  };

  const broadcastSocialActivity = (activityType, content, targetUsers = null) => {
    try {
      realTimeIntegrationService.broadcastSocialActivity({
        type: activityType,
        content,
        targetUsers,
        author: {
          id: 'current-user-id',
          name: 'Current User',
          avatar: null
        }
      });

      console.log(`📡 Social activity broadcasted: ${activityType}`);
    } catch (error) {
      console.error('Error broadcasting social activity:', error);
    }
  };

  const dismissNotification = (notificationId) => {
    setRealTimeNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const initializeRealTimeFeatures = () => {
    // Subscribe to social activity feed
    realTimeIntegrationService.subscribeSocialActivityFeed('current-user-id');

    // Setup real-time event listeners
    realTimeIntegrationService.on('socialActivityUpdate', (data) => {
      setActivityFeed(prev => [data, ...prev].slice(0, 20)); // Keep latest 20 activities
      console.log('📡 New social activity:', data);
    });

    realTimeIntegrationService.on('studyBuddyStatusChange', (data) => {
      setStudyBuddies(prev => prev.map(buddy => 
        buddy.id === data.user.id 
          ? { ...buddy, status: data.status, studyTopic: data.studyTopic }
          : buddy
      ));
      console.log('👤 Study buddy status changed:', data);
    });

    realTimeIntegrationService.on('socialAchievementUnlocked', (data) => {
      setRealTimeNotifications(prev => [{
        id: Date.now(),
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: data.achievement.name,
        timestamp: new Date().toISOString()
      }, ...prev]);
      console.log('🏆 Social achievement unlocked:', data);
    });

    realTimeIntegrationService.on('helpfulnessUpdate', (data) => {
      setSocialData(prev => prev ? {
        ...prev,
        helpfulnessRating: data.newRating
      } : null);
      console.log('⭐ Helpfulness rating updated:', data);
    });

    realTimeIntegrationService.on('realTimeNotification', (data) => {
      setRealTimeNotifications(prev => [data, ...prev].slice(0, 10));
      console.log('🔔 Real-time notification:', data);
    });

    console.log('🔄 Social dashboard real-time features initialized');
  };

  const cleanupRealTimeFeatures = () => {
    // Remove event listeners
    realTimeIntegrationService.off('socialActivityUpdate');
    realTimeIntegrationService.off('studyBuddyStatusChange');
    realTimeIntegrationService.off('socialAchievementUnlocked');
    realTimeIntegrationService.off('helpfulnessUpdate');
    realTimeIntegrationService.off('realTimeNotification');
    
    console.log('🧹 Social dashboard real-time features cleaned up');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'feed', label: 'Activity Feed', icon: MessageCircle },
    { id: 'groups', label: 'Study Groups', icon: Users },
    { id: 'buddies', label: 'Study Buddies', icon: UserPlus },
    { id: 'recommendations', label: 'Recommendations', icon: Star }  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading social dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Learning Hub</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchSocialData();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤝 Social Learning Hub
          </h1>
          <p className="text-gray-600">
            Connect, collaborate, and learn together with your peers
          </p>
        </motion.div>

        {/* Real-time Notifications */}
        <AnimatePresence>
          {realTimeNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-500" />
                    Real-time Updates
                  </h3>
                  <span className="text-sm text-gray-500">
                    {realTimeNotifications.length} notification{realTimeNotifications.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {realTimeNotifications.slice(0, 3).map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-3 ${
                          notification.type === 'achievement' ? 'bg-yellow-500' :
                          notification.type === 'success' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
                {realTimeNotifications.length > 3 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    +{realTimeNotifications.length - 3} more notifications
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Groups</p>
                <p className="text-3xl font-bold text-blue-600">{studyGroups.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>2 active this week</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Buddies</p>
                <p className="text-3xl font-bold text-green-600">{studyBuddies.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Heart className="h-4 w-4 mr-1" />
              <span>95% compatibility avg</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Social Points</p>
                <p className="text-3xl font-bold text-purple-600">
                  {socialData.socialStats?.totalSocialInteractions * 5 || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Award className="h-4 w-4 mr-1" />
              <span>Top 15% contributors</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Helpfulness</p>
                <p className="text-3xl font-bold text-orange-600">
                  {socialData.socialStats?.helpfulAnswers || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <Trophy className="h-4 w-4 mr-1" />
              <span>4.8/5 rating</span>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
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
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Activity Feed */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Social Activity Feed</h3>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Filter className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Bell className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {activityFeed.length > 0 ? activityFeed.map((activity, index) => (
                      <motion.div
                        key={activity.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-l-4 border-blue-200 pl-4 py-3 bg-blue-50 rounded-r-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-blue-600">
                            <Star className="h-4 w-4 mr-1" />
                            <span>+{activity.points}</span>
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No social activities yet. Start by joining a study group!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">                    <button 
                      onClick={() => setActiveTab('groups')}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <Plus className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-sm font-medium text-blue-900">Create Study Group</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-blue-600" />
                    </button>
                      <button 
                      onClick={() => setActiveTab('community')}
                      className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <Search className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-sm font-medium text-green-900">Find Study Buddy</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-green-600" />
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('live-sessions')}
                      className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <Video className="h-5 w-5 text-purple-600 mr-3" />
                        <span className="text-sm font-medium text-purple-900">Start Live Session</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-purple-600" />
                    </button>
                  </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Math Study Group</p>
                        <p className="text-xs text-gray-500">Today, 3:00 PM</p>
                      </div>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Physics Review</p>
                        <p className="text-xs text-gray-500">Tomorrow, 2:00 PM</p>
                      </div>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <StudyGroupsSection studyGroups={studyGroups} />
            </motion.div>
          )}

          {activeTab === 'buddies' && (
            <motion.div
              key="buddies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <StudyBuddiesSection studyBuddies={studyBuddies} />
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <RecommendationsSection recommendations={socialRecommendations} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Study Groups Section Component
const StudyGroupsSection = ({ studyGroups }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Study Groups</h3>
        <button className="flex items-center text-blue-600 hover:text-blue-700">
          <Plus className="h-4 w-4 mr-1" />
          <span className="text-sm">Create New</span>
        </button>
      </div>
      
      {studyGroups.length > 0 ? (
        <div className="space-y-4">
          {studyGroups.map((group, index) => (
            <motion.div
              key={group.groupId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{group.members?.length || 0} members</span>
                <span>{group.subject}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">You haven't joined any study groups yet</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Find Study Groups
          </button>
        </div>
      )}
    </div>

    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Discover Groups</h3>
      <div className="space-y-4">
        {[
          { name: 'Advanced Calculus', members: 15, subject: 'Mathematics' },
          { name: 'React Development', members: 8, subject: 'Programming' },
          { name: 'Physics Lab Prep', members: 12, subject: 'Physics' }
        ].map((group, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{group.name}</h4>
              <button className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                Join
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{group.members} members</span>
              <span>{group.subject}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Study Buddies Section Component
const StudyBuddiesSection = ({ studyBuddies }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">My Study Buddies</h3>
        <button className="flex items-center text-green-600 hover:text-green-700">
          <Search className="h-4 w-4 mr-1" />
          <span className="text-sm">Find More</span>
        </button>
      </div>
      
      {studyBuddies.length > 0 ? (
        <div className="space-y-4">
          {studyBuddies.map((buddy, index) => (
            <motion.div
              key={buddy.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <UserPlus className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">{buddy.name}</h4>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {buddy.compatibilityScore || 95}% match
                </span>
              </div>
              <p className="text-sm text-gray-600">{buddy.subjects?.join(', ') || 'Mathematics, Physics'}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">No study buddies yet</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Find Study Buddies
          </button>
        </div>
      )}
    </div>

    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recommended Matches</h3>
      <div className="space-y-4">
        {[
          { name: 'Alex Chen', compatibility: 92, subjects: ['Calculus', 'Physics'] },
          { name: 'Sarah Johnson', compatibility: 88, subjects: ['Chemistry', 'Biology'] },
          { name: 'Mike Rodriguez', compatibility: 85, subjects: ['Programming', 'Math'] }
        ].map((match, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <UserPlus className="h-4 w-4 text-gray-600" />
                </div>
                <h4 className="font-medium text-gray-900">{match.name}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {match.compatibility}% match
                </span>
                <button className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                  Connect
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">{match.subjects.join(', ')}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Recommendations Section Component
const RecommendationsSection = ({ recommendations }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Study Group Recommendations</h3>
      <div className="space-y-4">
        {recommendations.studyGroups?.length > 0 ? recommendations.studyGroups.map((group, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{group.name}</h4>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {group.matchScore}% match
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{group.reason}</p>
            <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors">
              Join Group
            </button>
          </motion.div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations available yet</p>
          </div>
        )}
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Mentorship Opportunities</h3>
      <div className="space-y-4">
        {recommendations.mentorshipOpportunities?.length > 0 ? recommendations.mentorshipOpportunities.map((opportunity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {opportunity.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
            <button className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition-colors">
              Apply
            </button>
          </motion.div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No mentorship opportunities available</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default SocialDashboard;
