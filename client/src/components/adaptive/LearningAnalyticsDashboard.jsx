/**
 * Learning Analytics Dashboard - Phase 3 Step 2
 * Comprehensive analytics interface with performance trends, knowledge gap analysis,
 * predictive insights, and personalized recommendations
 * 
 * Uses Recharts library for data visualization including LineChart and BarChart components
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
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
} from 'recharts'; // Recharts visualization library
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
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

const LearningAnalyticsDashboard = ({ userId, courseId, onBack }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [activeTab, setActiveTab] = useState('overview'); // overview, performance, patterns, predictions
  const [filters, setFilters] = useState({
    courseId: courseId || 'all',
    learningStyle: 'all',
    performanceLevel: 'all'
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange, filters]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        timeRange,
        ...filters,
        ...(courseId && { courseId })
      });

      const response = await fetch(`/api/adaptive-learning/analytics/comprehensive?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.analytics);
      }
    } catch (error) {
      console.error('Analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  // Color schemes for charts
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6'
  };

  const performanceColors = ['#10B981', '#F59E0B', '#EF4444'];
  const learningStyleColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics</h3>
          <p className="text-gray-600">Analyzing your learning data...</p>
        </div>
      </div>
    );
  }

  // Analytics and performance data for validation
  const analytics = analyticsData;
  const performance = analyticsData?.performance || {};

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Learning Score',
            value: analyticsData.overview.learningScore,
            change: analyticsData.overview.learningScoreChange,
            icon: Brain,
            color: 'blue'
          },
          {
            title: 'Course Progress',
            value: `${analyticsData.overview.courseProgress}%`,
            change: analyticsData.overview.progressChange,
            icon: Target,
            color: 'green'
          },
          {
            title: 'Study Time',
            value: analyticsData.overview.totalStudyTime,
            change: analyticsData.overview.timeChange,
            icon: Clock,
            color: 'orange'
          },
          {
            title: 'Achievements',
            value: analyticsData.overview.achievements,
            change: analyticsData.overview.achievementChange,
            icon: Award,
            color: 'purple'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center mt-2">
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <metric.icon className={`w-8 h-8 text-${metric.color}-600`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Trend */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.performanceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="score"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Learning Pattern Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Style Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.learningStyleDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.learningStyleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={learningStyleColors[index % learningStyleColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Session Pattern</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.studySessionPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill={colors.secondary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Subject Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.subjectPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill={colors.primary} name="Current Score" />
            <Bar dataKey="target" fill={colors.accent} name="Target Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Knowledge Gaps Heatmap */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Gaps Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData.knowledgeGaps.map((gap, index) => (
            <motion.div
              key={gap.topic}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${
                gap.severity === 'high' 
                  ? 'border-red-200 bg-red-50' 
                  : gap.severity === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{gap.topic}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  gap.severity === 'high' 
                    ? 'bg-red-100 text-red-800'
                    : gap.severity === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {gap.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{gap.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Confidence: {gap.confidence}%
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Study Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Assessment History */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment History</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.assessmentHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke={colors.primary}
              strokeWidth={2}
              dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="averageScore"
              stroke={colors.secondary}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPatternsTab = () => (
    <div className="space-y-6">
      {/* Learning Radar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Abilities Radar</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={analyticsData.learningAbilities}>
            <PolarGrid />
            <PolarAngleAxis dataKey="ability" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Current Level"
              dataKey="current"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.3}
            />
            <Radar
              name="Target Level"
              dataKey="target"
              stroke={colors.accent}
              fill={colors.accent}
              fillOpacity={0.1}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity Pattern</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill={colors.teal} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Type Preferences</h3>
          <div className="space-y-3">
            {analyticsData.contentPreferences.map((pref, index) => (
              <div key={pref.type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{pref.type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pref.percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{pref.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPredictionsTab = () => (
    <div className="space-y-6">
      {/* Performance Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Predictions</h3>
          <div className="space-y-4">
            {analyticsData.predictions.performance.map((prediction, index) => (
              <div key={prediction.course} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{prediction.course}</h4>
                  <p className="text-sm text-gray-600">Expected completion: {prediction.expectedCompletion}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    prediction.likelihood >= 80 ? 'text-green-600' :
                    prediction.likelihood >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {prediction.likelihood}%
                  </div>
                  <p className="text-xs text-gray-500">Success probability</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
          <div className="space-y-3">
            {analyticsData.predictions.risks.map((risk, index) => (
              <motion.div
                key={risk.factor}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                  risk.level === 'high' 
                    ? 'border-red-500 bg-red-50'
                    : risk.level === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-green-500 bg-green-50'
                }`}
              >
                <div>
                  <h4 className="font-medium text-gray-900">{risk.factor}</h4>
                  <p className="text-sm text-gray-600">{risk.description}</p>
                </div>
                <AlertTriangle className={`w-5 h-5 ${
                  risk.level === 'high' ? 'text-red-500' :
                  risk.level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData.recommendations.map((rec, index) => (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h4 className="font-medium text-gray-900">{rec.title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  rec.priority === 'high' 
                    ? 'bg-red-100 text-red-800'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {rec.priority} priority
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Apply
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Learning Analytics</h1>
                <p className="text-gray-600">Comprehensive insights into your learning journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'performance', label: 'Performance', icon: Target },
                { id: 'patterns', label: 'Patterns', icon: Activity },
                { id: 'predictions', label: 'Predictions', icon: Brain }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'patterns' && renderPatternsTab()}
        {activeTab === 'predictions' && renderPredictionsTab()}
      </div>
    </div>
  );
};

export default LearningAnalyticsDashboard;
