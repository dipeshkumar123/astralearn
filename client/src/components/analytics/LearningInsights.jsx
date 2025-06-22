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
  Clock,  Calendar,
  Zap,
  BookOpen,
  Users,
  Award,
  Filter,
  Download,
  Share
} from 'lucide-react';
import { useDataSync } from '../../contexts/DataSyncProvider';

const LearningInsights = () => {
  const { 
    analytics, 
    userProgress, 
    courses, 
    getLearningStats, 
    loading: dataLoading, 
    fetchAnalytics 
  } = useDataSync();
  
  const [insights, setInsights] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [processingInsights, setProcessingInsights] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [timeframe, setTimeframe] = useState(30);
  const [analysisType, setAnalysisType] = useState('detailed');

  // Generate insights from real data
  useEffect(() => {
    if (analytics && userProgress && courses.length > 0) {
      generateInsights();
    }
  }, [analytics, userProgress, courses, timeframe, analysisType]);

  const generateInsights = () => {
    setProcessingInsights(true);
    
    // Generate real insights from actual user data
    const learningStats = getLearningStats();
    
    const realInsights = {
      totalStudyTime: learningStats.totalTimeSpent,
      averageProgress: learningStats.averageProgress,
      coursesEnrolled: learningStats.totalCoursesEnrolled,
      lessonsCompleted: learningStats.totalLessonsCompleted,
      currentStreak: learningStats.currentStreak,
      
      // Calculate learning velocity
      learningVelocity: learningStats.totalLessonsCompleted > 0 
        ? (learningStats.totalTimeSpent / learningStats.totalLessonsCompleted) 
        : 0,
      
      // Engagement patterns
      engagementTrend: calculateEngagementTrend(),
      
      // Performance by course
      coursePerformance: calculateCoursePerformance(),
      
      // Learning recommendations
      recommendations: generateRecommendations(learningStats)
    };

    setInsights(realInsights);
    
    // Generate learning patterns from real data
    setPatterns(generateLearningPatterns());
    
    // Generate predictions
    setPredictions(generatePredictions(realInsights));
    
    setProcessingInsights(false);
  };

  const calculateEngagementTrend = () => {
    // Calculate engagement based on real progress data
    const courseProgress = Object.values(userProgress);
    if (courseProgress.length === 0) return 'stable';
    
    const avgProgress = courseProgress.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / courseProgress.length;
    
    if (avgProgress > 70) return 'increasing';
    if (avgProgress < 30) return 'decreasing';
    return 'stable';
  };

  const calculateCoursePerformance = () => {
    return courses.map(course => {
      const progress = userProgress[course._id || course.id];
      return {
        courseName: course.title,
        progress: progress?.overallProgress || 0,
        timeSpent: progress?.totalTimeSpent || 0,
        completion: progress?.completedLessons?.length || 0,
        rating: progress?.averageScore || 0
      };
    });
  };

  const generateRecommendations = (stats) => {
    const recommendations = [];
    
    if (stats.currentStreak === 0) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        title: 'Restart Your Learning Streak',
        description: 'Complete a lesson today to begin building a consistent learning habit.',
        action: 'Start a lesson'
      });
    }
    
    if (stats.averageProgress < 50) {
      recommendations.push({
        type: 'progress',
        priority: 'medium',
        title: 'Accelerate Your Progress',
        description: 'Focus on completing current courses before starting new ones.',
        action: 'Continue current course'
      });
    }
    
    if (stats.totalCoursesEnrolled > 3 && stats.averageProgress < 30) {
      recommendations.push({
        type: 'focus',
        priority: 'high',
        title: 'Reduce Course Load',
        description: 'Consider focusing on 1-2 courses to improve completion rates.',
        action: 'Review enrolled courses'
      });
    }
    
    return recommendations;
  };

  const generateLearningPatterns = () => {
    // Generate patterns based on real user behavior
    const enrolledCourses = courses.filter(course => userProgress[course._id || course.id]);
    
    return {
      preferredCategories: [...new Set(enrolledCourses.map(c => c.category))],
      averageSessionTime: getLearningStats().totalTimeSpent / Math.max(1, getLearningStats().totalLessonsCompleted),
      completionRate: enrolledCourses.length > 0 
        ? (Object.values(userProgress).reduce((sum, p) => sum + (p.overallProgress || 0), 0) / enrolledCourses.length) / 100
        : 0,
      strongSubjects: enrolledCourses
        .filter(course => (userProgress[course._id || course.id]?.overallProgress || 0) > 70)
        .map(course => course.category)
        .filter((category, index, array) => array.indexOf(category) === index)
    };
  };

  const generatePredictions = (insights) => {
    return {
      completionProbability: Math.min(95, Math.max(10, insights.averageProgress + insights.currentStreak * 5)),
      timeToComplete: insights.coursesEnrolled > 0 
        ? Math.ceil((100 - insights.averageProgress) / Math.max(1, insights.averageProgress / 30)) 
        : 0,
      recommendedPace: insights.averageProgress < 50 ? 'increase' : 'maintain',
      nextMilestone: getNextMilestone(insights)
    };
  };

  const getNextMilestone = (insights) => {
    if (insights.lessonsCompleted < 10) return { type: 'lessons', target: 10, current: insights.lessonsCompleted };
    if (insights.coursesEnrolled < 3) return { type: 'courses', target: 3, current: insights.coursesEnrolled };
    if (insights.currentStreak < 7) return { type: 'streak', target: 7, current: insights.currentStreak };
    return { type: 'mastery', target: 100, current: insights.averageProgress };
  };
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
        ]      });

  const [learningPatternData, setLearningPatternData] = useState([]);
  const [skillProgressData, setSkillProgressData] = useState([]);
  const [learningEfficiencyData, setLearningEfficiencyData] = useState([]);

  const loadLearningPatternData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/learning-patterns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPatternData(data.patterns || []);
      } else {
        setLearningPatternData([]);
      }
    } catch (error) {
      console.error('Failed to load learning pattern data:', error);
      setLearningPatternData([]);
    }
  };

  const loadSkillProgressData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/skill-progress', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSkillProgressData(data.skills || []);
      } else {
        setSkillProgressData([]);
      }
    } catch (error) {
      console.error('Failed to load skill progress data:', error);
      setSkillProgressData([]);
    }
  };

  const loadLearningEfficiencyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/learning-efficiency?timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLearningEfficiencyData(data.efficiency || []);
      } else {
        setLearningEfficiencyData([]);
      }
    } catch (error) {
      console.error('Failed to load learning efficiency data:', error);
      setLearningEfficiencyData([]);
    }
  };

  // Load chart data when component mounts or dependencies change
  useEffect(() => {
    if (!loading) {
      loadLearningPatternData();
      loadSkillProgressData();
      loadLearningEfficiencyData();
    }
  }, [timeframe, loading]);

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

  if (dataLoading.analytics || processingInsights) {
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
