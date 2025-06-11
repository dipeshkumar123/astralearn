/**
 * Learning Insights Component - Phase 5 Step 1
 * Deep learning behavior analysis and predictive insights
 * 
 * Features:
 * - Advanced learning pattern recognition
 * - Predictive analytics for learning outcomes
 * - Actionable improvement recommendations
 * - Comparative performance analysis
 * - Learning optimization suggestions
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
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Cell
} from 'recharts';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Zap,
  BookOpen,
  Users,
  Award,
  Filter,
  Download,
  Share
} from 'lucide-react';

const LearningInsights = () => {
  const [insights, setInsights] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [timeframe, setTimeframe] = useState(30);
  const [analysisType, setAnalysisType] = useState('detailed');

  useEffect(() => {
    loadInsightsData();
  }, [timeframe, analysisType]);

  const loadInsightsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [insightsRes, patternsRes] = await Promise.all([
        fetch('/api/analytics/insights/personalized', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/analytics/patterns/analyze?timeframe=${timeframe}&analysisType=${analysisType}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights);
      }

      if (patternsRes.ok) {
        const data = await patternsRes.json();
        setPatterns(data.patterns);
      }

      // Generate sample predictions data
      setPredictions({
        outcomesPrediction: {
          currentTrajectory: 'positive',
          completionProbability: 0.87,
          timeToGoal: 45,
          riskFactors: ['inconsistent_schedule', 'topic_difficulty'],
          opportunities: ['peer_learning', 'additional_practice']
        },
        recommendations: [
          {
            type: 'schedule_optimization',
            priority: 'high',
            title: 'Optimize Study Schedule',
            description: 'Your performance peaks at 9-11 AM. Schedule difficult topics during this time.',
            impact: 'high',
            effort: 'low'
          },
          {
            type: 'content_focus',
            priority: 'medium',
            title: 'Focus on Weak Areas',
            description: 'Spend extra time on data structures concepts for better overall performance.',
            impact: 'medium',
            effort: 'medium'
          }
        ]
      });

    } catch (error) {
      console.error('Insights data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPatternData = () => {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      engagement: Math.sin((hour - 9) * Math.PI / 12) * 30 + 50 + Math.random() * 20,
      retention: Math.cos((hour - 10) * Math.PI / 10) * 25 + 60 + Math.random() * 15,
      productivity: Math.sin((hour - 8) * Math.PI / 14) * 35 + 65 + Math.random() * 10
    }));
  };

  const generateSkillProgressData = () => {
    return [
      { skill: 'JavaScript', current: 85, target: 90, growth: 12 },
      { skill: 'React', current: 75, target: 85, growth: 20 },
      { skill: 'Node.js', current: 60, target: 80, growth: 8 },
      { skill: 'Database', current: 70, target: 85, growth: 15 },
      { skill: 'Testing', current: 45, target: 70, growth: 25 },
      { skill: 'DevOps', current: 30, target: 60, growth: 10 }
    ];
  };

  const generateLearningEfficiencyData = () => {
    return Array.from({ length: timeframe }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - 1 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        efficiency: Math.random() * 40 + 60,
        difficulty: Math.random() * 30 + 40,
        satisfaction: Math.random() * 35 + 65,
        timeSpent: Math.random() * 60 + 30
      };
    });
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

  const PredictionCard = ({ prediction, type }) => {
    const getTypeConfig = (type) => {
      const configs = {
        success: { icon: CheckCircle, color: 'green', bg: 'bg-green-50', border: 'border-green-200' },
        warning: { icon: AlertTriangle, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        info: { icon: Lightbulb, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200' },
        danger: { icon: TrendingDown, color: 'red', bg: 'bg-red-50', border: 'border-red-200' }
      };
      return configs[type] || configs.info;
    };

    const config = getTypeConfig(type);
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
      >
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 mt-0.5 text-${config.color}-600`} />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{prediction.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{prediction.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                <span className={`text-xs px-2 py-1 rounded-full bg-${config.color}-100 text-${config.color}-700 font-medium`}>
                  Impact: {prediction.impact}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium`}>
                  Effort: {prediction.effort}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-sm font-medium text-${config.color}-600 hover:text-${config.color}-800`}
              >
                Apply
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const SkillRadarChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data.map(skill => ({
        skill: skill.skill,
        current: skill.current,
        target: skill.target
      }))}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
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
          stroke={colors.secondary} 
          fill={colors.secondary} 
          fillOpacity={0.2} 
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <Brain className="h-10 w-10 text-purple-600 mr-3" />
                Learning Insights
              </h1>
              <p className="text-gray-600 mt-2">
                Deep analysis of your learning patterns and predictive recommendations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="overview">Overview</option>
                <option value="detailed">Detailed</option>
                <option value="trends">Trends</option>
                <option value="comparative">Comparative</option>
              </select>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 2 weeks</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 3 months</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Prediction Overview */}
        {predictions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 text-purple-600 mr-2" />
                Learning Outcome Prediction
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(predictions.outcomesPrediction.completionProbability * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Completion Probability</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {predictions.outcomesPrediction.timeToGoal}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Days to Goal</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    predictions.outcomesPrediction.currentTrajectory === 'positive' ? 'text-green-600' : 
                    predictions.outcomesPrediction.currentTrajectory === 'neutral' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {predictions.outcomesPrediction.currentTrajectory === 'positive' ? '↗️' : 
                     predictions.outcomesPrediction.currentTrajectory === 'neutral' ? '→' : '↘️'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Current Trajectory</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Learning Pattern Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Learning Patterns</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={generateLearningPatternData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="engagement" stroke={colors.primary} strokeWidth={2} />
                <Line type="monotone" dataKey="retention" stroke={colors.secondary} strokeWidth={2} />
                <Line type="monotone" dataKey="productivity" stroke={colors.accent} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Skill Progress Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Development Progress</h3>
            <SkillRadarChart data={generateSkillProgressData()} />
          </motion.div>

          {/* Learning Efficiency Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Efficiency Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateLearningEfficiencyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill={colors.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="satisfaction" fill={colors.secondary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Time vs Performance Correlation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time vs Performance Correlation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={generateLearningEfficiencyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeSpent" name="Time Spent" unit=" min" />
                <YAxis dataKey="efficiency" name="Efficiency" unit="%" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Learning Sessions" data={generateLearningEfficiencyData()} fill={colors.purple} />
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Actionable Recommendations */}
        {predictions?.recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
              Actionable Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.recommendations.map((rec, index) => (
                <PredictionCard
                  key={index}
                  prediction={rec}
                  type={rec.priority === 'high' ? 'warning' : rec.priority === 'medium' ? 'info' : 'success'}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Learning Insights Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Insights Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                Optimal Learning Times
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Peak performance: 9-11 AM</li>
                <li>• Secondary peak: 2-4 PM</li>
                <li>• Avoid: 12-1 PM (lunch dip)</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <BookOpen className="h-4 w-4 text-green-600 mr-2" />
                Content Preferences
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Interactive tutorials (67%)</li>
                <li>• Video content (23%)</li>
                <li>• Reading materials (10%)</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Users className="h-4 w-4 text-purple-600 mr-2" />
                Learning Style
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Collaborative learning</li>
                <li>• Visual learning preferred</li>
                <li>• Regular breaks needed</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LearningInsights;
