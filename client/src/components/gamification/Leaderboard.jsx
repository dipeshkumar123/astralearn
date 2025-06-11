import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown,
  TrendingUp,
  Users,
  Filter,
  Calendar,
  Award,
  Zap,
  Target
} from 'lucide-react';

/**
 * Leaderboard Component
 * Displays competitive rankings and user standings across different categories
 * Supports multiple leaderboard types: global, course, weekly, monthly
 */
const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('global'); // global, course, weekly, monthly
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
    fetchUserRank();
  }, [activeType, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        type: activeType,
        limit: 50,
        ...(timeframe !== 'all' && { timeframe })
      });

      const response = await fetch(`/api/gamification/leaderboard?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Set mock data for development
      setLeaderboard([
        {
          rank: 1,
          userId: '1',
          user: { name: 'Alice Johnson', username: 'alice_learns' },
          totalPoints: 2850,
          level: 12,
          badges: 24,
          recentActivity: 'Completed Advanced React Module'
        },
        {
          rank: 2,
          userId: '2',
          user: { name: 'Bob Smith', username: 'bob_codes' },
          totalPoints: 2720,
          level: 11,
          badges: 22,
          recentActivity: 'Achieved 30-day streak'
        },
        {
          rank: 3,
          userId: '3',
          user: { name: 'Carol Davis', username: 'carol_dev' },
          totalPoints: 2690,
          level: 11,
          badges: 20,
          recentActivity: 'Mentored 5 students'
        },
        {
          rank: 4,
          userId: '4',
          user: { name: 'David Wilson', username: 'david_learns' },
          totalPoints: 2580,
          level: 10,
          badges: 19,
          recentActivity: 'Completed JavaScript Fundamentals'
        },
        {
          rank: 5,
          userId: '5',
          user: { name: 'Eve Brown', username: 'eve_studies' },
          totalPoints: 2450,
          level: 10,
          badges: 18,
          recentActivity: 'Led study group session'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        type: activeType
      });

      const response = await fetch(`/api/gamification/leaderboard/rank?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRank(data);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
      // Set mock data
      setUserRank({
        rank: 23,
        totalParticipants: 150,
        percentile: 85,
        entry: {
          totalPoints: 1250,
          level: 5,
          badges: 8
        }
      });
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-orange-500" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    if (rank <= 10) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-600';
  };

  const leaderboardTypes = [
    { id: 'global', label: 'Global', icon: Trophy },
    { id: 'weekly', label: 'Weekly', icon: Calendar },
    { id: 'monthly', label: 'Monthly', icon: TrendingUp },
    { id: 'course', label: 'Course', icon: Target }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600">
            See how you rank against other learners and compete for the top spots!
          </p>
        </motion.div>

        {/* User Rank Card */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Current Rank</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold">#{userRank.rank}</span>
                  <div className="text-sm opacity-90">
                    <p>Top {userRank.percentile}% of learners</p>
                    <p>{userRank.totalParticipants} total participants</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{userRank.entry?.totalPoints.toLocaleString()}</div>
                <div className="text-sm opacity-90">points</div>
                <div className="text-sm opacity-90">Level {userRank.entry?.level}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Type Selector */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              {leaderboardTypes.map(type => (
                <motion.button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeType === type.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <type.icon className="h-4 w-4 mr-2" />
                  {type.label}
                </motion.button>
              ))}
            </div>

            {/* Timeframe Filter */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          <AnimatePresence>
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl p-6 shadow-sm border-l-4 transition-all hover:shadow-md ${
                  entry.rank <= 3 
                    ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                      {entry.rank <= 3 ? getRankIcon(entry.rank) : <span className="font-bold">#{entry.rank}</span>}
                    </div>

                    {/* User Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{entry.user.name}</h3>
                      <p className="text-sm text-gray-500">@{entry.user.username}</p>
                      <p className="text-xs text-gray-400 mt-1">{entry.recentActivity}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {entry.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                    <div className="flex items-center justify-end space-x-4 mt-2 text-xs text-gray-400">
                      <div className="flex items-center">
                        <Crown className="h-3 w-3 mr-1" />
                        Level {entry.level}
                      </div>
                      <div className="flex items-center">
                        <Medal className="h-3 w-3 mr-1" />
                        {entry.badges} badges
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 3 Special Effects */}
                {entry.rank <= 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 pt-4 border-t border-yellow-200"
                  >
                    <div className="flex items-center justify-center">
                      <div className="flex items-center text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 mr-1" />
                        {entry.rank === 1 ? 'Champion' : entry.rank === 2 ? 'Runner-up' : 'Bronze Medal'}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {leaderboard.length}
              </div>
              <div className="text-sm text-gray-600">Active Competitors</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {leaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(leaderboard.reduce((sum, entry) => sum + entry.level, 0) / leaderboard.length)}
              </div>
              <div className="text-sm text-gray-600">Average Level</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {leaderboard.reduce((sum, entry) => sum + entry.badges, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Badges</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
