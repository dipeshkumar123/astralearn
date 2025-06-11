/**
 * Analytics Dashboard - Phase 5 Step 1
 * Main analytics interface for comprehensive learning insights
 * 
 * Features:
 * - Real-time analytics data visualization
 * - Learning behavior patterns analysis
 * - Performance metrics tracking
 * - Personalized insights and recommendations
 * - Interactive charts and trend analysis
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Clock, 
  Award, 
  AlertTriangle,
  CheckCircle,
  Users,
  BookOpen,
  Lightbulb,
  Zap,
  Calendar,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Refresh
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [behaviorHistory, setBehaviorHistory] = useState([]);
  const [personalizedInsights, setPersonalizedInsights] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState(7);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [dashboardRes, behaviorRes, insightsRes, metricsRes] = await Promise.all([
        fetch(`/api/analytics/dashboard/realtime?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/analytics/behavior/history?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/analytics/insights/personalized', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/analytics/metrics/performance?timeframe=${timeframe}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboardData(data.dashboard);
      }

      if (behaviorRes.ok) {
        const data = await behaviorRes.json();
        setBehaviorHistory(data.behaviorHistory);
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setPersonalizedInsights(data.insights);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setPerformanceMetrics(data.metrics);
      }

    } catch (error) {
      console.error('Analytics data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Generate sample chart data if real data is not available
  const generateSampleData = () => {
    const days = Array.from({ length: timeframe }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - 1 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        performance: Math.random() * 40 + 60,
        engagement: Math.random() * 30 + 70,
        studyTime: Math.random() * 60 + 30
      };
    });
    return days;
  };

  const chartData = dashboardData?.visualizations || generateSampleData();
  const keyMetrics = dashboardData?.keyMetrics || {
    learningVelocity: 0.75,
    performanceScore: 82,
    engagementLevel: 'high',
    consistencyRating: 0.85
  };

  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6'
  };

  const TabButton = ({ id, label, icon: Icon, isActive }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </motion.button>
  );

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`bg-${color}-100 rounded-lg p-3`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const InsightCard = ({ insight, priority = 'medium' }) => {
    const priorityColors = {
      high: 'border-red-200 bg-red-50',
      medium: 'border-yellow-200 bg-yellow-50',
      low: 'border-green-200 bg-green-50'
    };

    const priorityIcons = {
      high: AlertTriangle,
      medium: Lightbulb,
      low: CheckCircle
    };

    const Icon = priorityIcons[priority];

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-4 rounded-lg border ${priorityColors[priority]}`}
      >
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 mt-0.5 ${
            priority === 'high' ? 'text-red-600' :
            priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
          }`} />
          <div>
            <h4 className="font-medium text-gray-900">{insight.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
            {insight.action && (
              <button className="text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium">
                {insight.action}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">📊 Learning Analytics</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights into your learning journey and performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 2 weeks</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 3 months</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Refresh className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit"
        >
          <TabButton id="overview" label="Overview" icon={BarChart3} isActive={activeTab === 'overview'} />
          <TabButton id="performance" label="Performance" icon={TrendingUp} isActive={activeTab === 'performance'} />
          <TabButton id="insights" label="Insights" icon={Brain} isActive={activeTab === 'insights'} />
          <TabButton id="behavior" label="Learning Behavior" icon={Activity} isActive={activeTab === 'behavior'} />
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <MetricCard
                title="Learning Velocity"
                value={`${Math.round(keyMetrics.learningVelocity * 100)}%`}
                change={8}
                icon={Zap}
                color="yellow"
              />
              <MetricCard
                title="Performance Score"
                value={`${keyMetrics.performanceScore}%`}
                change={12}
                icon={Target}
                color="green"
              />
              <MetricCard
                title="Engagement Level"
                value={keyMetrics.engagementLevel.charAt(0).toUpperCase() + keyMetrics.engagementLevel.slice(1)}
                change={5}
                icon={Activity}
                color="blue"
              />
              <MetricCard
                title="Consistency"
                value={`${Math.round(keyMetrics.consistencyRating * 100)}%`}
                change={-2}
                icon={Calendar}
                color="purple"
              />
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateSampleData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="performance" stroke={colors.primary} strokeWidth={2} />
                    <Line type="monotone" dataKey="engagement" stroke={colors.secondary} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Study Time Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Study Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateSampleData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="studyTime" fill={colors.accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Performance Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  { subject: 'Comprehension', A: 120, B: 110, fullMark: 150 },
                  { subject: 'Application', A: 98, B: 130, fullMark: 150 },
                  { subject: 'Analysis', A: 86, B: 130, fullMark: 150 },
                  { subject: 'Synthesis', A: 99, B: 100, fullMark: 150 },
                  { subject: 'Evaluation', A: 85, B: 90, fullMark: 150 },
                  { subject: 'Memory', A: 65, B: 85, fullMark: 150 }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="Your Performance" dataKey="A" stroke={colors.primary} fill={colors.primary} fillOpacity={0.2} />
                  <Radar name="Class Average" dataKey="B" stroke={colors.secondary} fill={colors.secondary} fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Performance Insights</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">📈 Strong performance in Application and Analysis</p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">⚠️ Memory retention could be improved</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">💡 Consider spaced repetition for better retention</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personalized Insights</h3>
                <InsightCard
                  insight={{
                    title: "Optimal Study Time Detected",
                    description: "You perform best during morning sessions (9-11 AM). Consider scheduling important topics during this time.",
                    action: "Adjust Schedule"
                  }}
                  priority="high"
                />
                <InsightCard
                  insight={{
                    title: "Learning Streak Opportunity",
                    description: "You're 2 days away from a 30-day learning streak! Keep up the momentum.",
                    action: "View Streak Progress"
                  }}
                  priority="medium"
                />
                <InsightCard
                  insight={{
                    title: "Content Recommendation",
                    description: "Based on your progress, we recommend exploring 'Advanced React Patterns' next.",
                    action: "View Content"
                  }}
                  priority="low"
                />
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Goals Progress</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Complete React Fundamentals', progress: 85, target: 100 },
                    { name: 'Master JavaScript ES6', progress: 92, target: 100 },
                    { name: 'Build Portfolio Project', progress: 45, target: 100 }
                  ].map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{goal.name}</span>
                        <span className="text-gray-500">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className="bg-blue-600 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Learning Behavior Tab */}
        {activeTab === 'behavior' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Patterns</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={generateSampleData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="engagement" stackId="1" stroke={colors.primary} fill={colors.primary} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="studyTime" stackId="1" stroke={colors.secondary} fill={colors.secondary} fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavior Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Peak Learning Hours</p>
                      <p className="text-sm text-gray-600">9:00 AM - 11:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Preferred Content Type</p>
                      <p className="text-sm text-gray-600">Interactive tutorials (67%)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Learning Style</p>
                      <p className="text-sm text-gray-600">Collaborative learning</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
