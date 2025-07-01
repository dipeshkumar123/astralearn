/**
 * Instructor Dashboard - Phase 5 Step 2
 * Comprehensive instructor interface for class management and analytics
 * 
 * Features:
 * - Real-time class performance monitoring
 * - Engagement heatmaps and patterns
 * - Learning gap detection and alerts
 * - AI-powered intervention recommendations
 * - Class activity monitoring
 * - Student progress tracking
 * - Interactive analytics tools
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Award,
  Brain,
  MessageSquare,
  FileText,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Filter,
  Download,
  Bell,
  Settings,
  Activity,
  BarChart3,
  Zap,
  Search,
  Map,
  Lightbulb,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  MoreVertical,
  RefreshCw,
  Maximize,
  Minimize
} from 'lucide-react';

// Enhanced AI Assistant import
import EnhancedAIAssistant from '../ai/EnhancedAIAssistant';
import AIToggleButton from '../ai/AIToggleButton';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';

// Import specialized components
import ClassPerformanceMonitor from './ClassPerformanceMonitor';
import EngagementHeatmap from './EngagementHeatmap';
import LearningGapDetector from './LearningGapDetector';
import InterventionManagement from './InterventionManagement';

const InstructorDashboard = () => {
  // AI Assistant integration
  const { updateContext, setAssistantMode } = useAIAssistantStore();
  const location = useLocation();
  const { user } = useAuth();
  
  // Update AI context based on current page and user
  useEffect(() => {
    updateContext({
      page: 'teaching-assistant',
      userId: user?.id,
      userRole: 'instructor',
      sessionData: {
        path: location.pathname,
        timestamp: Date.now()
      }
    });
    setAssistantMode('teaching-assistant');
  }, [updateContext, setAssistantMode, location, user]);

  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeStudents, setActiveStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('24h');
  const [showAlerts, setShowAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedWidget, setExpandedWidget] = useState(null);

  // WebSocket and intervals
  const wsRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
    
    return () => {
      cleanup();
    };
  }, []);

  // Course selection effect
  useEffect(() => {
    if (selectedCourse) {
      loadCourseData();
      if (isMonitoring) {
        startRealTimeMonitoring();
      }
    }
  }, [selectedCourse]);

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh && selectedCourse) {
      refreshIntervalRef.current = setInterval(refreshDashboard, 30000); // 30 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, selectedCourse]);

  /**
   * Initialize Dashboard
   */
  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      // Load instructor's courses
      const coursesResponse = await fetch('/api/courses/instructor', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (coursesResponse.ok) {
        const courses = await coursesResponse.json();
        if (courses.length > 0) {
          setSelectedCourse(courses[0]._id);
        }
      }

      // Load initial dashboard data
      await loadDashboardOverview();
      
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      setError('Failed to initialize dashboard');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load Dashboard Overview Data
   */
  const loadDashboardOverview = async () => {
    try {
      const response = await fetch('/api/analytics/instructor/dashboard-overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Dashboard overview loading error:', error);
    }
  };

  /**
   * Load Course-Specific Data
   */
  const loadCourseData = async () => {
    if (!selectedCourse) return;

    try {
      setLoading(true);

      // Load class performance data
      const performanceResponse = await fetch(
        `/api/analytics/instructor/class-performance/${selectedCourse}?timeframe=${timeframe}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setDashboardData(prev => ({
          ...prev,
          classPerformance: performanceData.data
        }));
      }

      // Load alerts
      await loadAlerts();

    } catch (error) {
      console.error('Course data loading error:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load Alerts
   */
  const loadAlerts = async () => {
    try {
      const response = await fetch(
        `/api/analytics/instructor/alerts/${selectedCourse}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        const alertsData = await response.json();
        setAlerts(alertsData.alerts || []);
      }
    } catch (error) {
      console.error('Alerts loading error:', error);
    }
  };

  /**
   * Start Real-Time Monitoring
   */
  const startRealTimeMonitoring = useCallback(() => {
    if (!selectedCourse || isMonitoring) return;

    try {
      // Initialize WebSocket connection for instructor monitoring
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/instructor`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Instructor monitoring WebSocket connected');
        
        // Start class monitoring
        wsRef.current.send(JSON.stringify({
          type: 'start_class_monitoring',
          data: {
            courseId: selectedCourse,
            sessionId: Date.now().toString()
          }
        }));

        setIsMonitoring(true);
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };

      wsRef.current.onclose = () => {
        console.log('Instructor monitoring WebSocket disconnected');
        setIsMonitoring(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsMonitoring(false);
      };

    } catch (error) {
      console.error('Real-time monitoring start error:', error);
    }
  }, [selectedCourse, isMonitoring]);

  /**
   * Stop Real-Time Monitoring
   */
  const stopRealTimeMonitoring = useCallback(() => {
    if (wsRef.current && isMonitoring) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_class_monitoring',
        data: { courseId: selectedCourse }
      }));
      
      wsRef.current.close();
      wsRef.current = null;
      setIsMonitoring(false);
      setRealTimeData(null);
    }
  }, [selectedCourse, isMonitoring]);

  /**
   * Handle WebSocket Messages
   */
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'realtime_class_update':
        setRealTimeData(message.data);
        break;
      
      case 'learning_gap_alert':
        setAlerts(prev => [message.data, ...prev]);
        break;
      
      case 'engagement_update':
        setActiveStudents(message.data.engagementData.studentEngagement || []);
        break;
      
      case 'intervention_recommendation':
        // Handle intervention recommendations
        break;
      
      default:
        console.log('Unknown WebSocket message:', message);
    }
  };

  /**
   * Refresh Dashboard Data
   */
  const refreshDashboard = useCallback(async () => {
    if (selectedCourse) {
      await loadCourseData();
    }
  }, [selectedCourse]);

  /**
   * Cleanup Resources
   */
  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  };

  /**
   * Toggle Monitoring
   */
  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopRealTimeMonitoring();
    } else {
      startRealTimeMonitoring();
    }
  };

  // Render loading state
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Instructor Dashboard
          </h1>
          
          <div className="flex items-center space-x-3">
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-1 inline ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>

            {/* Real-time Monitoring Toggle */}
            <button
              onClick={toggleMonitoring}
              disabled={!selectedCourse}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                isMonitoring
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300'
              }`}
            >
              {isMonitoring ? (
                <>
                  <PauseCircle className="w-4 h-4 mr-1" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-1" />
                  Start Monitoring
                </>
              )}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={refreshDashboard}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Course Selector */}
        <div className="flex items-center space-x-4">
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a course...</option>
            {dashboardData?.courses?.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Real-time Status Bar */}
      {selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg ${
            isMonitoring ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
              }`} />
              <span className="font-medium">
                {isMonitoring ? 'Live Monitoring Active' : 'Real-time Monitoring Available'}
              </span>
              {realTimeData && (
                <span className="ml-4 text-sm text-gray-600">
                  Active Students: {realTimeData.metrics?.activeStudents || 0} | 
                  Avg Engagement: {realTimeData.metrics?.averageEngagement?.toFixed(1) || 0}%
                </span>
              )}
            </div>
            
            {alerts.length > 0 && (
              <div className="flex items-center">
                <Bell className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600">{alerts.length} active alerts</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'performance', label: 'Performance', icon: TrendingUp },
              { id: 'engagement', label: 'Engagement', icon: Activity },
              { id: 'gaps', label: 'Learning Gaps', icon: AlertTriangle },
              { id: 'interventions', label: 'Interventions', icon: Lightbulb }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <DashboardOverview 
              data={dashboardData}
              realTimeData={realTimeData}
              alerts={alerts}
              courseId={selectedCourse}
            />
          )}
          
          {activeTab === 'performance' && (
            <ClassPerformanceMonitor 
              courseId={selectedCourse}
              timeframe={timeframe}
              realTimeData={realTimeData}
            />
          )}
          
          {activeTab === 'engagement' && (
            <EngagementHeatmap 
              courseId={selectedCourse}
              timeframe={timeframe}
              realTimeData={realTimeData}
            />
          )}
          
          {activeTab === 'gaps' && (
            <LearningGapDetector 
              courseId={selectedCourse}
              alerts={alerts}
            />
          )}
          
          {activeTab === 'interventions' && (
            <InterventionManagement 
              courseId={selectedCourse}
              alerts={alerts}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * Dashboard Overview Component
 */
const DashboardOverview = ({ data, realTimeData, alerts, courseId }) => {
  if (!data) return null;

  const overviewStats = [
    {
      title: 'Total Students',
      value: data.classPerformance?.totalStudents || 0,
      change: '+5.2%',
      positive: true,
      icon: Users
    },
    {
      title: 'Average Performance',
      value: `${data.classPerformance?.averageScore?.toFixed(1) || 0}%`,
      change: '+2.1%',
      positive: true,
      icon: TrendingUp
    },
    {
      title: 'Engagement Rate',
      value: `${data.classPerformance?.engagementRate?.toFixed(1) || 0}%`,
      change: realTimeData ? '+1.2%' : '0%',
      positive: true,
      icon: Activity
    },
    {
      title: 'Active Alerts',
      value: alerts.length,
      change: '-2 from yesterday',
      positive: false,
      icon: AlertTriangle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm flex items-center mt-1 ${
                  stat.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.positive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Target className="w-6 h-6 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Run Gap Analysis</h4>
            <p className="text-sm text-gray-600">Detect learning gaps for all students</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Lightbulb className="w-6 h-6 text-yellow-500 mb-2" />
            <h4 className="font-medium text-gray-900">Generate Interventions</h4>
            <p className="text-sm text-gray-600">Get AI-powered teaching recommendations</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Download className="w-6 h-6 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">Export Report</h4>
            <p className="text-sm text-gray-600">Download comprehensive class report</p>
          </button>
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <div key={index} className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
                <span className="text-xs text-gray-500">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Enhanced AI Assistant - Modern, Responsive, Real-time */}
      <EnhancedAIAssistant />
      
      {/* Floating AI Toggle for Mobile */}
      <div className="md:hidden">
        <AIToggleButton 
          variant="floating" 
          position="bottom-right"
          size="medium"
          showLabel={false}
        />
      </div>
    </div>
  );
};

export default InstructorDashboard;
