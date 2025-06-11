import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target, 
  Award,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Trophy,
  Gift
} from 'lucide-react';

/**
 * Enhanced Streak Tracking Component
 * Displays daily streaks, weekly challenges, and streak multipliers
 */
const StreakTracker = ({ onBackToMain }) => {
  const [streakData, setStreakData] = useState(null);
  const [streakHistory, setStreakHistory] = useState([]);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
    fetchStreakHistory();
    fetchDailyGoals();
    fetchWeeklyChallenge();
  }, []);

  const fetchStreakData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gamification/streaks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStreakData(data.streaks);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
      // Set mock data for development
      setStreakData({
        current: {
          dailyLearning: 7,
          weeklyGoals: 2,
          monthlyActive: 1
        },
        longest: {
          dailyLearning: 15,
          weeklyGoals: 4,
          monthlyActive: 2
        },
        multipliers: {
          pointsMultiplier: 1.4,
          xpMultiplier: 1.2,
          badgeProgressMultiplier: 1.1
        },
        milestones: [
          { days: 3, reward: 'Bronze Streak Badge', achieved: true },
          { days: 7, reward: 'Silver Streak Badge', achieved: true },
          { days: 14, reward: 'Gold Streak Badge', achieved: false },
          { days: 30, reward: 'Platinum Streak Badge', achieved: false }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStreakHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gamification/streaks/history?days=30', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStreakHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching streak history:', error);
      // Generate mock history for last 30 days
      const history = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        history.push({
          date: date.toISOString().split('T')[0],
          completed: Math.random() > 0.3, // 70% completion rate
          activities: Math.floor(Math.random() * 5) + 1,
          points: Math.floor(Math.random() * 100) + 20
        });
      }
      setStreakHistory(history);
    }
  };

  const fetchDailyGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gamification/goals/daily', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDailyGoals(data.goals);
      }
    } catch (error) {
      console.error('Error fetching daily goals:', error);
      // Set mock daily goals
      setDailyGoals([
        {
          id: 'learn_30min',
          title: 'Learn for 30 minutes',
          description: 'Spend at least 30 minutes learning today',
          progress: 25,
          target: 30,
          unit: 'minutes',
          completed: false,
          points: 50,
          type: 'time'
        },
        {
          id: 'complete_lesson',
          title: 'Complete 1 lesson',
          description: 'Finish at least one lesson today',
          progress: 1,
          target: 1,
          unit: 'lessons',
          completed: true,
          points: 25,
          type: 'count'
        },
        {
          id: 'answer_quiz',
          title: 'Answer 5 quiz questions',
          description: 'Answer at least 5 quiz questions correctly',
          progress: 3,
          target: 5,
          unit: 'questions',
          completed: false,
          points: 30,
          type: 'count'
        }
      ]);
    }
  };

  const fetchWeeklyChallenge = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gamification/challenges/weekly', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWeeklyChallenge(data.challenge);
      }
    } catch (error) {
      console.error('Error fetching weekly challenge:', error);
      // Set mock weekly challenge
      setWeeklyChallenge({
        id: 'weekly_warrior',
        title: 'Weekly Learning Warrior',
        description: 'Complete daily goals for 7 consecutive days',
        progress: 5,
        target: 7,
        unit: 'days',
        rewards: [
          { type: 'points', amount: 500 },
          { type: 'badge', name: 'Weekly Warrior' },
          { type: 'multiplier', value: '2x XP for next week' }
        ],
        timeRemaining: '2 days',
        difficulty: 'medium'
      });
    }
  };

  const renderStreakHeatmap = () => {
    const weeks = [];
    let currentWeek = [];
    
    streakHistory.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      currentWeek.push(day);
      
      if (index === streakHistory.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center">{day}</div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const date = new Date(day.date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <motion.div
                  key={day.date}
                  whileHover={{ scale: 1.2 }}
                  className={`
                    w-4 h-4 rounded-sm border cursor-pointer relative
                    ${day.completed 
                      ? 'bg-green-500 border-green-600' 
                      : 'bg-gray-200 border-gray-300'
                    }
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                  title={`${day.date}: ${day.completed ? 'Completed' : 'Missed'} (${day.points} points)`}
                >
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <div className="max-w-4xl mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
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
            <Flame className="w-10 h-10 mr-3 text-orange-600" />
            Streak Tracker
          </h1>
          <p className="text-gray-600">
            Maintain your learning momentum and unlock streak rewards!
          </p>
        </motion.div>

        {/* Current Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Learning Streak</p>
                <p className="text-3xl font-bold text-orange-600">
                  {streakData?.current?.dailyLearning || 0} days
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Trophy className="h-4 w-4 mr-1" />
              <span>Best: {streakData?.longest?.dailyLearning || 0} days</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Points Multiplier</p>
                <p className="text-3xl font-bold text-green-600">
                  {streakData?.multipliers?.pointsMultiplier || 1.0}x
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Earning bonus rewards!</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Milestone</p>
                <p className="text-3xl font-bold text-purple-600">14 days</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="h-4 w-4 mr-1" />
              <span>Gold Streak Badge</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Streak Heatmap */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-600" />
              30-Day Activity Heatmap
            </h3>
            {renderStreakHeatmap()}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
              <span>Less</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </motion.div>

          {/* Daily Goals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Today's Goals
            </h3>
            <div className="space-y-4">
              {dailyGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    goal.completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {goal.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-2"></div>
                      )}
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    </div>
                    <div className="flex items-center text-sm text-blue-600">
                      <Star className="h-4 w-4 mr-1" />
                      <span>+{goal.points}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Progress</span>
                      <span>{goal.progress} / {goal.target} {goal.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${
                          goal.completed ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Weekly Challenge */}
        {weeklyChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center">
                  <Award className="h-6 w-6 mr-2" />
                  {weeklyChallenge.title}
                </h3>
                <p className="text-purple-100 mt-1">{weeklyChallenge.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-200">Time Remaining</div>
                <div className="text-lg font-bold">{weeklyChallenge.timeRemaining}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Challenge Progress</span>
                <span>{weeklyChallenge.progress} / {weeklyChallenge.target} {weeklyChallenge.unit}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                <motion.div
                  className="bg-white h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Rewards:</h4>
              <div className="flex flex-wrap gap-2">
                {weeklyChallenge.rewards.map((reward, index) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm"
                  >
                    {reward.type === 'points' && `+${reward.amount} Points`}
                    {reward.type === 'badge' && `🏆 ${reward.name}`}
                    {reward.type === 'multiplier' && `⚡ ${reward.value}`}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Streak Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Streak Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {streakData?.milestones?.map((milestone, index) => (
              <motion.div
                key={milestone.days}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 text-center ${
                  milestone.achieved
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  milestone.achieved ? 'bg-yellow-500' : 'bg-gray-300'
                }`}>
                  <Trophy className={`h-6 w-6 ${
                    milestone.achieved ? 'text-white' : 'text-gray-500'
                  }`} />
                </div>
                <div className="text-lg font-bold text-gray-900">{milestone.days} Days</div>
                <div className="text-sm text-gray-600">{milestone.reward}</div>
                {milestone.achieved && (
                  <div className="mt-2 text-xs text-yellow-700 font-medium">✓ Unlocked</div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StreakTracker;
