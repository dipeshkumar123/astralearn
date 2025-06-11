import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Medal, 
  Target, 
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * Achievement Progress Component
 * Detailed view of user achievements, progress tracking, and unlockable badges
 * Learning Milestones category includes course completion tracking
 */
const AchievementProgress = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, in-progress
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAchievement, setExpandedAchievement] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, [filter, categoryFilter]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(filter === 'completed' && { completed: 'true' }),
        ...(filter === 'in-progress' && { completed: 'false' })
      });

      const response = await fetch(`/api/gamification/achievements?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      // Set mock data for development
      setAchievements([
        {
          achievementId: 'first_steps',
          name: 'First Steps',
          description: 'Complete your first lesson',
          category: 'milestone',
          difficulty: 'bronze',
          progress: { current: 1, target: 1 },
          completed: true,
          unlockedAt: new Date(),
          points: 25,
          badge: { icon: '🌟', color: 'yellow' }
        },
        {
          achievementId: 'knowledge_seeker',
          name: 'Knowledge Seeker',
          description: 'Complete 10 lessons',
          category: 'milestone',
          difficulty: 'silver',
          progress: { current: 7, target: 10 },
          completed: false,
          points: 100,
          badge: { icon: '📚', color: 'blue' }
        },
        {
          achievementId: 'consistent_learner',
          name: 'Consistent Learner',
          description: 'Maintain a 14-day learning streak',
          category: 'streak',
          difficulty: 'gold',
          progress: { current: 7, target: 14 },
          completed: false,
          points: 200,
          badge: { icon: '🔥', color: 'orange' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'bronze': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'silver': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'platinum': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'streak': return <TrendingUp className="h-4 w-4" />;
      case 'collaboration': return <Star className="h-4 w-4" />;
      case 'special': return <Award className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (achievement) => {
    return Math.round((achievement.progress.current / achievement.progress.target) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Achievement Progress
          </h1>
          <p className="text-gray-600">
            Track your learning milestones and unlock new achievements!
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Achievements</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Categories</option>
                <option value="milestone">Milestones</option>
                <option value="streak">Streaks</option>
                <option value="collaboration">Collaboration</option>
                <option value="special">Special</option>
              </select>
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.achievementId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all ${
                  achievement.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setExpandedAchievement(
                  expandedAchievement === achievement.achievementId ? null : achievement.achievementId
                )}
              >
                {/* Achievement Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      achievement.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {achievement.completed ? '🏆' : achievement.badge?.icon || '⭐'}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{achievement.name}</h3>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(achievement.category)}
                        <span className="text-xs text-gray-500 capitalize">{achievement.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(achievement.difficulty)}`}>
                      {achievement.difficulty}
                    </span>
                    {achievement.completed && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {achievement.progress.current} / {achievement.progress.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        achievement.completed ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage(achievement)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{getProgressPercentage(achievement)}% Complete</span>
                    <span>+{achievement.points} points</span>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedAchievement === achievement.achievementId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <p className="font-medium capitalize">{achievement.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Points:</span>
                          <p className="font-medium">+{achievement.points}</p>
                        </div>
                        {achievement.completed && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Completed:</span>
                            <p className="font-medium">
                              {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Achievement Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {achievements.filter(a => a.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {achievements.filter(a => !a.completed).length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {achievements.reduce((sum, a) => a.completed ? sum + a.points : sum, 0)}
              </div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  (achievements.filter(a => a.completed).length / achievements.length) * 100
                )}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AchievementProgress;
