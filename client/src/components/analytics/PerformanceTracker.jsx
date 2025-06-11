/**
 * Performance Tracker Component - Phase 5 Step 1
 * Detailed performance metrics and tracking interface
 * 
 * Features:
 * - Comprehensive performance metrics tracking
 * - Comparative analysis with benchmarks
 * - Skill gap analysis and development plans
 * - Goal setting and progress monitoring
 * - Performance trend visualization
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Calendar, 
  Clock,
  Zap,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Star,
  Trophy,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Edit,
  Filter
} from 'lucide-react';

const PerformanceTracker = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [timeframe, setTimeframe] = useState(30);
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    loadPerformanceData();
  }, [timeframe, selectedMetric]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [metricsRes, compareRes] = await Promise.all([
        fetch(`/api/analytics/metrics/performance?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/analytics/compare/performance?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setPerformanceData(data.metrics);
      }

      if (compareRes.ok) {
        const data = await compareRes.json();
        setBenchmarks(data.comparison);
      }

      // Generate sample goals and skill gaps data
      setGoals([
        {
          id: 1,
          title: 'Complete React Advanced Course',
          description: 'Master advanced React patterns and optimization techniques',
          target: 100,
          current: 75,
          deadline: '2024-12-31',
          status: 'active',
          priority: 'high'
        },
        {
          id: 2,
          title: 'Build Portfolio Project',
          description: 'Create a full-stack application showcasing learned skills',
          target: 100,
          current: 45,
          deadline: '2024-11-30',
          status: 'active',
          priority: 'medium'
        },
        {
          id: 3,
          title: 'Improve Algorithm Skills',
          description: 'Solve 100 algorithm problems on coding platforms',
          target: 100,
          current: 32,
          deadline: '2024-12-15',
          status: 'active',
          priority: 'high'
        }
      ]);

      setSkillGaps([
        { skill: 'Advanced React Patterns', gap: 25, priority: 'high', effort: 'medium' },
        { skill: 'Database Optimization', gap: 40, priority: 'medium', effort: 'high' },
        { skill: 'Testing Strategies', gap: 55, priority: 'high', effort: 'low' },
        { skill: 'DevOps Practices', gap: 70, priority: 'low', effort: 'high' },
        { skill: 'System Design', gap: 60, priority: 'medium', effort: 'medium' }
      ]);

    } catch (error) {
      console.error('Performance data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceTrendData = () => {
    return Array.from({ length: timeframe }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - 1 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        performance: Math.random() * 20 + 70 + (i / timeframe) * 10,
        target: 80,
        efficiency: Math.random() * 15 + 75,
        consistency: Math.random() * 25 + 65
      };
    });
  };

  const generateSkillRadarData = () => {
    return [
      { skill: 'Frontend', current: 85, target: 90 },
      { skill: 'Backend', current: 70, target: 85 },
      { skill: 'Database', current: 60, target: 80 },
      { skill: 'Testing', current: 45, target: 75 },
      { skill: 'DevOps', current: 30, target: 65 },
      { skill: 'System Design', current: 40, target: 70 }
    ];
  };

  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    orange: '#F97316'
  };

  const MetricCard = ({ title, value, change, target, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-end space-x-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {target && <span className="text-sm text-gray-500">/ {target}</span>}
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
            <span className="text-xs text-gray-500 ml-1">vs last period</span>
          </div>
        )}
        
        {target && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(value / target) * 100}%` }}
              transition={{ duration: 1 }}
              className={`bg-${color}-600 h-2 rounded-full`}
            />
          </div>
        )}
      </div>
    </motion.div>
  );

  const GoalCard = ({ goal }) => {
    const progressPercent = (goal.current / goal.target) * 100;
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    const priorityColors = {
      high: 'border-red-200 bg-red-50',
      medium: 'border-yellow-200 bg-yellow-50',
      low: 'border-green-200 bg-green-50'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border ${priorityColors[goal.priority]} transition-all hover:shadow-md`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{goal.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              goal.priority === 'high' ? 'bg-red-100 text-red-700' :
              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {goal.priority}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{goal.current}/{goal.target}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1 }}
              className="bg-blue-600 h-2 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progressPercent)}% complete</span>
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const SkillGapCard = ({ skillGap }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100"
    >
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{skillGap.skill}</h4>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Gap:</span>
            <span className={`text-sm font-medium ${
              skillGap.gap > 50 ? 'text-red-600' :
              skillGap.gap > 25 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {skillGap.gap}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Priority:</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              skillGap.priority === 'high' ? 'bg-red-100 text-red-700' :
              skillGap.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {skillGap.priority}
            </span>
          </div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        Address
      </motion.button>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <Target className="h-10 w-10 text-green-600 mr-3" />
                Performance Tracker
              </h1>
              <p className="text-gray-600 mt-2">
                Track your progress, set goals, and identify areas for improvement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="overall">Overall Performance</option>
                <option value="efficiency">Learning Efficiency</option>
                <option value="consistency">Consistency</option>
                <option value="engagement">Engagement</option>
              </select>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 2 weeks</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 3 months</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGoalModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Goal</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="Overall Score"
            value="85"
            change={12}
            target={100}
            icon={Trophy}
            color="yellow"
          />
          <MetricCard
            title="Learning Velocity"
            value="78%"
            change={8}
            icon={Zap}
            color="orange"
          />
          <MetricCard
            title="Consistency Rating"
            value="92%"
            change={-3}
            icon={Calendar}
            color="green"
          />
          <MetricCard
            title="Goal Progress"
            value="3/5"
            change={15}
            icon={Flag}
            color="blue"
          />
        </motion.div>

        {/* Performance Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={generatePerformanceTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="performance" stackId="1" stroke={colors.primary} fill={colors.primary} fillOpacity={0.3} />
              <Line type="monotone" dataKey="target" stroke={colors.danger} strokeDasharray="5 5" strokeWidth={2} />
              <Bar dataKey="efficiency" fill={colors.secondary} radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Goals and Skill Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Goals Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Flag className="h-5 w-5 text-blue-600 mr-2" />
                Active Goals
              </h2>
              <span className="text-sm text-gray-500">{goals.length} goals</span>
            </div>
            <div className="space-y-4">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </motion.div>

          {/* Skill Gaps Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                Skill Gaps
              </h2>
              <span className="text-sm text-gray-500">{skillGaps.length} areas identified</span>
            </div>
            <div className="space-y-3">
              {skillGaps.map((skillGap, index) => (
                <SkillGapCard key={index} skillGap={skillGap} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Comparison */}
        {benchmarks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {benchmarks.userPerformance.percentile}th
                </div>
                <p className="text-sm text-gray-600 mt-1">Percentile</p>
                <p className="text-xs text-gray-500">Among peers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {benchmarks.userPerformance.score}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Your Score</p>
                <p className="text-xs text-gray-500">Current performance</p>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  benchmarks.userPerformance.trend === 'up' ? 'text-green-600' : 
                  benchmarks.userPerformance.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {benchmarks.userPerformance.trend === 'up' ? '↗️' : 
                   benchmarks.userPerformance.trend === 'down' ? '↘️' : '→'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Trend</p>
                <p className="text-xs text-gray-500">30-day direction</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTracker;
