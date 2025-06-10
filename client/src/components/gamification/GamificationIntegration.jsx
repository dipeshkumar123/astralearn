import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Medal, 
  Flame, 
  X,
  ChevronUp,
  ChevronDown,
  Zap
} from 'lucide-react';

/**
 * Gamification Integration Component
 * Shows floating gamification widgets and notifications
 */
const GamificationIntegration = () => {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    fetchGamificationProfile();
    // Set up polling for real-time updates
    const interval = setInterval(fetchGamificationProfile, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchGamificationProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/gamification/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfile(data.profile);
          setShowWidget(true);
        }
      }
    } catch (error) {
      console.error('Error fetching gamification profile:', error);
    }
  };

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Mock function to simulate earning points/badges (this would be called from other components)
  const simulatePointsEarned = (points, activity) => {
    addNotification({
      type: 'points',
      title: 'Points Earned!',
      message: `+${points} points for ${activity}`,
      points
    });
  };

  const simulateBadgeEarned = (badge) => {
    addNotification({
      type: 'badge',
      title: 'Badge Earned!',
      message: `You earned the "${badge.name}" badge!`,
      badge
    });
  };

  const simulateLevelUp = (newLevel) => {
    addNotification({
      type: 'levelup',
      title: 'Level Up!',
      message: `Congratulations! You reached Level ${newLevel}!`,
      level: newLevel
    });
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!showWidget || !profile) {
    return null;
  }

  return (
    <>
      {/* Floating Widget */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-20 right-6 z-40"
      >
        <motion.div
          layout
          className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Widget Header */}
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Level {profile.level}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2">{profile.totalPoints.toLocaleString()}</span>
                {isMinimized ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>

          {/* Widget Content */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-3"
              >
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-gray-600">{profile.totalPoints.toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center">
                    <Medal className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-gray-600">{profile.badges.length} badges</span>
                  </div>
                  <div className="flex items-center">
                    <Flame className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-gray-600">{profile.streaks.current.dailyLearning} day streak</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-gray-600">Level {profile.level}</span>
                  </div>
                </div>

                {/* Level Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Level Progress</span>
                    <span>{Math.round((profile.experiencePoints % 1000) / 10)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(profile.experiencePoints % 1000) / 10}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => simulatePointsEarned(25, 'completing lesson')}
                    className="flex-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                  >
                    Test Points
                  </button>
                  <button
                    onClick={() => simulateBadgeEarned({ name: 'Quick Learner' })}
                    className="flex-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                  >
                    Test Badge
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Notifications */}
      <div className="fixed top-6 right-6 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className="bg-white rounded-lg shadow-lg border-l-4 border-purple-500 p-4 max-w-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {notification.type === 'points' && (
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  {notification.type === 'badge' && (
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <Medal className="h-4 w-4 text-yellow-600" />
                    </div>
                  )}
                  {notification.type === 'levelup' && (
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Zap className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    {notification.type === 'points' && (
                      <div className="mt-2">
                        <span className="text-lg font-bold text-purple-600">
                          +{notification.points}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">points</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Level Up Celebration */}
      <AnimatePresence>
        {notifications.some(n => n.type === 'levelup') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-xl p-8 text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Level Up!
              </h2>
              <p className="text-gray-600 mb-4">
                Congratulations! You've reached Level {profile.level}!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNotifications(prev => prev.filter(n => n.type !== 'levelup'))}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Export functions to trigger notifications from other components
export const triggerPointsNotification = (points, activity) => {
  window.dispatchEvent(new CustomEvent('gamification:points', {
    detail: { points, activity }
  }));
};

export const triggerBadgeNotification = (badge) => {
  window.dispatchEvent(new CustomEvent('gamification:badge', {
    detail: { badge }
  }));
};

export const triggerLevelUpNotification = (level) => {
  window.dispatchEvent(new CustomEvent('gamification:levelup', {
    detail: { level }
  }));
};

export default GamificationIntegration;
