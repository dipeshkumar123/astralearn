/**
 * Adaptive Learning Dashboard - Phase 3 Step 2
 * Enhanced main interface for personalized learning paths, interactive assessments,
 * comprehensive analytics, and AI-powered recommendations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Award, 
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  BarChart3,
  Users,  Lightbulb,
  Calendar,
  Settings,
  RefreshCw,
  Eye,
  PlusCircle,
  ArrowRight,
  Zap,
  Compass,
  Activity
} from 'lucide-react';

// Import enhanced components
import InteractiveAssessment from './InteractiveAssessment';
import LearningAnalyticsDashboard from './LearningAnalyticsDashboard';

const AdaptiveLearningDashboard = ({ userId, onBackToMain }) => {  const [dashboardData, setDashboardData] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);const [activeView, setActiveView] = useState('dashboard'); // dashboard, assessment, analytics, learning-path
  const [activeTab, setActiveTab] = useState('overview'); // Add missing activeTab state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all dashboard data in parallel  
      const token = localStorage.getItem('token') || 'demo-token';
      const [dashboardResponse, recommendationsResponse, pathResponse] = await Promise.all([
        fetch(`/api/adaptive-learning/analytics/dashboard?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/adaptive-learning/recommendations?userId=${userId}&limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/adaptive-learning/learning-path/current?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        setDashboardData(dashboardResult.dashboard);
      } else {
        throw new Error(`Dashboard API error: ${dashboardResponse.status}`);
      }

      if (recommendationsResponse.ok) {
        const recommendationsResult = await recommendationsResponse.json();
        setRecommendations(recommendationsResult.recommendations || []);
      } else {
        console.warn('Failed to load recommendations:', recommendationsResponse.status);
        // Non-critical, don't throw error
      }      if (pathResponse.ok) {
        const pathResult = await pathResponse.json();
        setLearningPath(pathResult.learningPath);
      } else {
        console.warn('Failed to load learning path:', pathResponse.status);
        // Non-critical, don't throw error
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
      setError(error.message || 'Failed to load dashboard data');
      // Set mock data for development
      setDashboardData({
        overview: {
          learningScore: 85,
          courseProgress: 67,
          studyTime: '24h 15m',
          achievements: 12,
          streak: 7
        },
        recentActivity: [
          { type: 'lesson', title: 'React Hooks Advanced', completed: true, time: '2h ago' },
          { type: 'assessment', title: 'JavaScript Quiz', score: 92, time: '1 day ago' },
          { type: 'achievement', title: 'Problem Solver Badge', time: '2 days ago' }
        ],
        upcomingMilestones: [
          { title: 'Complete Redux Module', progress: 80, deadline: '3 days' },
          { title: 'Final Project Submission', progress: 45, deadline: '1 week' }
        ]
      });
      
      setRecommendations([
        {
          type: 'lesson',
          title: 'Advanced State Management',
          description: 'Based on your progress in React, this lesson will help you master complex state patterns.',
          priority: 'high',
          estimatedTime: '45 min'
        },
        {
          type: 'practice',
          title: 'Interactive Coding Challenge',
          description: 'Practice your JavaScript skills with real-world scenarios.',
          priority: 'medium',
          estimatedTime: '30 min'
        }
      ]);      setLearningPath({
        currentPhase: 'Intermediate JavaScript',
        progress: 67,
        nextMilestone: 'React Mastery',
        estimatedCompletion: '2 weeks',
        adaptiveRecommendations: true
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getFallbackDashboardData = () => ({
    quickStats: {
      totalLessonsCompleted: 0,
      currentStreak: 0,
      averageScore: 0,
      timeSpentToday: 0
    },
    performanceTrends: {
      averageScore: 0,
      totalCompleted: 0
    },
    goalsProgress: [],
    upcomingItems: [],
    alerts: []
  });

  const renderQuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Lessons Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData?.quickStats?.totalLessonsCompleted || 0}
            </p>
          </div>
          <BookOpen className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Learning Streak</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData?.quickStats?.currentStreak || 0} days
            </p>
          </div>
          <Award className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Average Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData?.quickStats?.averageScore || 0}%
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Time Today</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((dashboardData?.quickStats?.timeSpentToday || 0) / 60)} min
            </p>
          </div>
          <Clock className="w-8 h-8 text-orange-500" />
        </div>
      </div>
    </div>
  );

  const renderLearningPath = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-blue-600" />
          Your Adaptive Learning Path
        </h2>
        <button
          onClick={() => setActiveTab('learning-path')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Full Path →
        </button>
      </div>

      {learningPath ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <PlayCircle className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Next Recommended</p>
                <p className="text-sm text-gray-600">{learningPath.nextRecommendation?.title || 'No recommendations available'}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Start Learning
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <p className="text-2xl font-bold text-blue-600">{learningPath.totalLessons || 0}</p>
              <p className="text-sm text-gray-600">Total Lessons</p>
            </div>
            <div className="text-center p-4">
              <p className="text-2xl font-bold text-green-600">
                {learningPath.estimatedDuration?.estimatedWeeks || 0}
              </p>
              <p className="text-sm text-gray-600">Estimated Weeks</p>
            </div>
            <div className="text-center p-4">
              <p className="text-2xl font-bold text-purple-600">
                {learningPath.strategy?.type || 'Standard'}
              </p>
              <p className="text-sm text-gray-600">Strategy</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized learning path...</p>
        </div>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Lightbulb className="w-6 h-6 mr-2 text-yellow-600" />
          Smart Recommendations
        </h2>
        <button
          onClick={() => setActiveTab('recommendations')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All →
        </button>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{rec.content?.title || 'Recommended Content'}</p>
                  <p className="text-sm text-gray-600">{rec.reasoning}</p>
                  <p className="text-xs text-gray-500 capitalize">{rec.type?.replace('_', ' ')}</p>
                </div>
              </div>
              <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recommendations available at this time.</p>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => {
    const alerts = dashboardData?.alerts || [];
    
    if (alerts.length === 0) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
          Learning Alerts
        </h2>

        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
              alert.type === 'danger' ? 'bg-red-50 border-red-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
                {alert.action && (
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {alert.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div>
      {renderQuickStats()}
      {renderLearningPath()}
      {renderRecommendations()}
      {renderAlerts()}
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your adaptive learning dashboard...</p>
      </div>
    </div>
  );
  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Adaptive Learning Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadDashboardData();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={onBackToMain}
                className="text-blue-600 hover:text-blue-700 mb-4"
              >
                ← Back to Main Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-blue-600" />
                Adaptive Learning Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Personalized learning experience powered by AI
              </p>
            </div>
              <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'learning-path', label: 'Learning Path', icon: Target },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="mb-8">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'learning-path' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Detailed Learning Path</h2>
              <p className="text-gray-600">Detailed learning path view coming soon...</p>
            </div>
          )}
          {activeTab === 'recommendations' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">All Recommendations</h2>
              <p className="text-gray-600">Comprehensive recommendations view coming soon...</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Learning Analytics</h2>
              <p className="text-gray-600">Advanced analytics view coming soon...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Adaptive Learning Settings</h2>
              <p className="text-gray-600">Personalization settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveLearningDashboard;
