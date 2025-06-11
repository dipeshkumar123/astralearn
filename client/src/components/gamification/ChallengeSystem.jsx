import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Users, 
  Clock, 
  Trophy, 
  Star, 
  Award,
  Zap,
  Calendar,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Plus,
  Crown,
  Medal,
  Flame,
  BookOpen,
  Brain,
  Timer
} from 'lucide-react';

/**
 * Challenge System Component
 * Manages daily, weekly, and special time-limited challenges
 * Challenge Categories: Daily, Weekly, Special, Milestone
 */
const ChallengeSystem = ({ onBackToMain }) => {
  const [challenges, setChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
    fetchActiveChallenges();
    fetchCompletedChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gamification/challenges', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      // Set mock available challenges
      setAvailableChallenges([
        {
          id: 'speed_learner',
          title: 'Speed Learner',
          description: 'Complete 3 lessons in under 2 hours',
          type: 'daily',
          difficulty: 'easy',
          duration: '2 hours',
          rewards: [
            { type: 'points', amount: 100 },
            { type: 'badge', name: 'Speed Demon' }
          ],
          requirements: ['Complete 3 lessons', 'Under 2 hours'],
          participants: 234,
          successRate: 65,
          category: 'learning'
        },
        {
          id: 'social_butterfly',
          title: 'Social Butterfly',
          description: 'Help 5 peers with their questions',
          type: 'weekly',
          difficulty: 'medium',
          duration: '7 days',
          rewards: [
            { type: 'points', amount: 250 },
            { type: 'badge', name: 'Helper' },
            { type: 'multiplier', value: '1.5x social points for next week' }
          ],
          requirements: ['Answer 5 questions', 'Get 3+ helpful votes each'],
          participants: 156,
          successRate: 42,
          category: 'social'
        },
        {
          id: 'knowledge_marathon',
          title: 'Knowledge Marathon',
          description: 'Study for 6 hours in a single day',
          type: 'special',
          difficulty: 'hard',
          duration: '24 hours',
          rewards: [
            { type: 'points', amount: 500 },
            { type: 'badge', name: 'Marathon Runner' },
            { type: 'xp', amount: 1000 }
          ],
          requirements: ['6 hours of study time', 'Track all activities'],
          participants: 89,
          successRate: 28,
          category: 'endurance'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gamification/challenges/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching active challenges:', error);
      // Set mock active challenges
      setActiveChallenges([
        {
          id: 'daily_streak',
          title: 'Daily Learning Streak',
          description: 'Complete daily goals for 7 consecutive days',
          type: 'weekly',
          difficulty: 'medium',
          progress: {
            current: 4,
            target: 7,
            percentage: 57
          },
          timeRemaining: '3 days 12 hours',
          startedAt: '2025-06-08T09:00:00Z',
          rewards: [
            { type: 'points', amount: 300 },
            { type: 'badge', name: 'Consistent Learner' }
          ],
          milestones: [
            { day: 3, completed: true, reward: '50 bonus points' },
            { day: 5, completed: false, reward: '100 bonus points' },
            { day: 7, completed: false, reward: 'Badge + 300 points' }
          ]
        },
        {
          id: 'quiz_master',
          title: 'Quiz Master Challenge',
          description: 'Score 90%+ on 5 different quizzes',
          type: 'weekly',
          difficulty: 'hard',
          progress: {
            current: 2,
            target: 5,
            percentage: 40
          },
          timeRemaining: '5 days 8 hours',
          startedAt: '2025-06-09T14:30:00Z',
          rewards: [
            { type: 'points', amount: 400 },
            { type: 'badge', name: 'Quiz Master' },
            { type: 'multiplier', value: '2x quiz points for next week' }
          ],
          details: [
            { quiz: 'React Fundamentals', score: 95, completed: true },
            { quiz: 'JavaScript Advanced', score: 92, completed: true },
            { quiz: 'CSS Grid & Flexbox', score: 0, completed: false },
            { quiz: 'Node.js Basics', score: 0, completed: false },
            { quiz: 'Database Design', score: 0, completed: false }
          ]
        }
      ]);
    }
  };

  const fetchCompletedChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gamification/challenges/completed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompletedChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching completed challenges:', error);
      // Set mock completed challenges
      setCompletedChallenges([
        {
          id: 'first_lesson',
          title: 'First Steps',
          description: 'Complete your first lesson',
          type: 'milestone',
          difficulty: 'easy',
          completedAt: '2025-06-07T10:15:00Z',
          rewards: [
            { type: 'points', amount: 50 },
            { type: 'badge', name: 'Beginner' }
          ],
          score: 100
        },
        {
          id: 'early_bird',
          title: 'Early Bird',
          description: 'Study before 8 AM for 3 consecutive days',
          type: 'daily',
          difficulty: 'medium',
          completedAt: '2025-06-05T07:45:00Z',
          rewards: [
            { type: 'points', amount: 150 },
            { type: 'badge', name: 'Early Bird' }
          ],
          score: 100
        }
      ]);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gamification/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Refresh challenges
        await fetchChallenges();
        await fetchActiveChallenges();
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
      expert: 'bg-purple-100 text-purple-800'
    };
    return colors[difficulty] || colors.easy;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      learning: BookOpen,
      social: Users,
      endurance: Timer,
      skill: Brain,
      milestone: Trophy
    };
    return icons[category] || Target;
  };

  const getTypeIcon = (type) => {
    const icons = {
      daily: Calendar,
      weekly: Clock,
      special: Star,
      milestone: Trophy
    };
    return icons[type] || Target;
  };

  const filteredChallenges = availableChallenges.filter(challenge => 
    filterType === 'all' || challenge.type === filterType
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
              ← Back to Gamification Dashboard
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <Target className="w-10 h-10 mr-3 text-purple-600" />
            Challenge Center
          </h1>
          <p className="text-gray-600">
            Take on challenges, compete with peers, and unlock exclusive rewards!
          </p>
        </motion.div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Challenges</p>
                <p className="text-3xl font-bold text-purple-600">{activeChallenges.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedChallenges.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
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
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-blue-600">{availableChallenges.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
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
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-orange-600">76%</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Flame className="h-6 w-6 mr-2 text-orange-600" />
              Active Challenges
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{challenge.title}</h3>
                      <p className="text-purple-100">{challenge.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-200">Time Left</div>
                      <div className="font-bold">{challenge.timeRemaining}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{challenge.progress.current} / {challenge.progress.target}</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                      <motion.div
                        className="bg-white h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progress.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {challenge.milestones && (
                    <div>
                      <h4 className="font-semibold mb-2">Milestones:</h4>
                      <div className="flex space-x-2">
                        {challenge.milestones.map((milestone, idx) => (
                          <div
                            key={idx}
                            className={`px-2 py-1 rounded text-xs ${
                              milestone.completed
                                ? 'bg-green-500 text-white'
                                : 'bg-white bg-opacity-20 text-purple-100'
                            }`}
                          >
                            Day {milestone.day}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {challenge.details && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Quiz Progress:</h4>
                      <div className="space-y-1">
                        {challenge.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{detail.quiz}</span>
                            <span className={detail.completed ? 'text-green-200' : 'text-purple-200'}>
                              {detail.completed ? `${detail.score}%` : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Challenges Filter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Plus className="h-6 w-6 mr-2 text-blue-600" />
            Available Challenges
          </h2>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Challenges</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="special">Special</option>
            </select>
          </div>
        </div>

        {/* Available Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredChallenges.map((challenge, index) => {
            const CategoryIcon = getCategoryIcon(challenge.category);
            const TypeIcon = getTypeIcon(challenge.type);
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <CategoryIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <TypeIcon className="h-4 w-4 mr-1" />
                    <span>{challenge.type}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{challenge.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Participants:</span>
                    <span className="font-medium">{challenge.participants}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="font-medium">{challenge.successRate}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {challenge.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Rewards:</h4>
                  <div className="flex flex-wrap gap-1">
                    {challenge.rewards.map((reward, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        {reward.type === 'points' && `+${reward.amount} pts`}
                        {reward.type === 'badge' && `🏆 ${reward.name}`}
                        {reward.type === 'multiplier' && `⚡ ${reward.value}`}
                        {reward.type === 'xp' && `+${reward.amount} XP`}
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => joinChallenge(challenge.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Join Challenge
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-green-600" />
              Completed Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-green-50 border-2 border-green-200 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                    <div className="flex items-center">
                      <Crown className="h-5 w-5 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">{challenge.score}%</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                  <div className="text-xs text-gray-500">
                    Completed on {new Date(challenge.completedAt).toLocaleDateString()}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {challenge.rewards.map((reward, idx) => (
                      <div
                        key={idx}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                      >
                        {reward.type === 'points' && `+${reward.amount} pts`}
                        {reward.type === 'badge' && `🏆 ${reward.name}`}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChallengeSystem;
