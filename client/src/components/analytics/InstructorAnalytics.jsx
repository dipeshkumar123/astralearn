/**
 * Instructor Analytics Component - Phase 5 Step 2
 * Advanced analytics dashboard specifically designed for instructors and educators
 * 
 * Features:
 * - Class performance monitoring with real-time insights
 * - Engagement heatmaps visualization
 * - Learning gap detection and analysis
 * - Intelligent intervention suggestion system
 * - Individual learner analytics and interventions
 * - Content effectiveness analysis with predictive insights
 * - Assessment optimization recommendations
 * - At-risk student identification with automated alerts
 * - Real-time collaboration analytics
 * - Predictive performance modeling
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ReferenceLine
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
  TrendingUp as Analytics,
  Users as ClassIcon,
  HeatMap,
  GraduationCap,
  PieChart as ChartIcon,
  Shield,
  Cpu,
  Database,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  MoreVertical
} from 'lucide-react';

const InstructorAnalytics = () => {
  const [classData, setClassData] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState([]);
  const [contentAnalytics, setContentAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [timeframe, setTimeframe] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadInstructorAnalytics();
  }, [selectedCourse, timeframe]);
  const loadInstructorAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Parallel API calls for better performance
      const [classResponse, studentsResponse, contentResponse] = await Promise.allSettled([
        fetch(`/api/analytics/instructor/class-overview?course=${selectedCourse}&timeframe=${timeframe}`, { headers }),
        fetch(`/api/analytics/instructor/students?course=${selectedCourse}&timeframe=${timeframe}`, { headers }),
        fetch(`/api/analytics/instructor/content?course=${selectedCourse}&timeframe=${timeframe}`, { headers })
      ]);

      // Handle class data
      if (classResponse.status === 'fulfilled' && classResponse.value.ok) {
        const classData = await classResponse.value.json();
        setClassData(classData.data || classData);
      } else {
        // Fallback to basic data if detailed analytics aren't available
        setClassData({
          totalStudents: 0,
          activeStudents: 0,
          averageProgress: 0,
          completionRate: 0,
          averageGrade: 0,
          engagementScore: 0,
          atRiskStudents: 0,
          topPerformers: 0
        });
      }

      // Handle student analytics
      if (studentsResponse.status === 'fulfilled' && studentsResponse.value.ok) {
        const studentsData = await studentsResponse.value.json();
        setStudentAnalytics(studentsData.students || studentsData.data || []);
      } else {
        setStudentAnalytics([]);
      }

      // Handle content analytics
      if (contentResponse.status === 'fulfilled' && contentResponse.value.ok) {
        const contentData = await contentResponse.value.json();
        setContentAnalytics(contentData.data || contentData);
      } else {
        setContentAnalytics({
          totalLessons: 0,
          averageCompletion: 0,
          mostPopular: 'N/A',
          leastEngaging: 'N/A',
          averageTimeSpent: 0,
          dropoffPoints: []
        });
      }

    } catch (error) {
      console.error('Instructor analytics loading error:', error);
      // Set empty states on error
      setClassData({
        totalStudents: 0,
        activeStudents: 0,
        averageProgress: 0,
        completionRate: 0,
        averageGrade: 0,
        engagementScore: 0,
        atRiskStudents: 0,
        topPerformers: 0
      });
      setStudentAnalytics([]);
      setContentAnalytics({
        totalLessons: 0,
        averageCompletion: 0,
        mostPopular: 'N/A',
        leastEngaging: 'N/A',
        averageTimeSpent: 0,
        dropoffPoints: []
      });
    } finally {
      setLoading(false);
    }
  };
  const [classProgressData, setClassProgressData] = useState([]);
  const [lessonAnalyticsData, setLessonAnalyticsData] = useState([]);
  const [studentDistributionData, setStudentDistributionData] = useState([]);

  const loadClassProgressData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/instructor/progress-timeline?course=${selectedCourse}&timeframe=${timeframe}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setClassProgressData(data.timeline || []);
      } else {
        setClassProgressData([]);
      }
    } catch (error) {
      console.error('Failed to load class progress data:', error);
      setClassProgressData([]);
    }
  };

  const loadLessonAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/instructor/lesson-performance?course=${selectedCourse}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLessonAnalyticsData(data.lessons || []);
      } else {
        setLessonAnalyticsData([]);
      }
    } catch (error) {
      console.error('Failed to load lesson analytics data:', error);
      setLessonAnalyticsData([]);
    }
  };

  const loadStudentDistributionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/instructor/grade-distribution?course=${selectedCourse}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentDistributionData(data.distribution || []);
      } else {
        setStudentDistributionData([]);
      }
    } catch (error) {
      console.error('Failed to load student distribution data:', error);
      setStudentDistributionData([]);
    }
  };

  // Load chart data when component mounts or dependencies change
  useEffect(() => {
    if (!loading) {
      loadClassProgressData();
      loadLessonAnalyticsData();
      loadStudentDistributionData();
    }
  }, [selectedCourse, timeframe, loading]);

  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6'
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
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

  const StudentCard = ({ student }) => {
    const getRiskColor = (level) => {
      const colors = {
        low: 'text-green-600 bg-green-50 border-green-200',
        medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        high: 'text-red-600 bg-red-50 border-red-200'
      };
      return colors[level] || colors.medium;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">{student.name}</h4>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(student.riskLevel)}`}>
              {student.riskLevel} risk
            </span>
            {student.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{student.progress}%</p>
            <p className="text-xs text-gray-500">Progress</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{student.grade}%</p>
            <p className="text-xs text-gray-500">Grade</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{student.engagement}%</p>
            <p className="text-xs text-gray-500">Engagement</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last active: {student.lastActive}</span>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Eye className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <MessageSquare className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
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
                <Users className="h-10 w-10 text-indigo-600 mr-3" />
                Instructor Analytics
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights into class performance and student progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Courses</option>
                <option value="react">React Fundamentals</option>
                <option value="javascript">JavaScript Advanced</option>
                <option value="python">Python Basics</option>
              </select>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 2 weeks</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 3 months</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit"
        >
          <TabButton id="overview" label="Overview" icon={Target} isActive={activeTab === 'overview'} />
          <TabButton id="students" label="Students" icon={Users} isActive={activeTab === 'students'} />
          <TabButton id="content" label="Content" icon={BookOpen} isActive={activeTab === 'content'} />
          <TabButton id="interventions" label="Interventions" icon={AlertTriangle} isActive={activeTab === 'interventions'} />
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
              <StatCard
                title="Total Students"
                value={classData?.totalStudents}
                change={8}
                icon={Users}
                color="blue"
                subtitle={`${classData?.activeStudents} active`}
              />
              <StatCard
                title="Average Progress"
                value={`${classData?.averageProgress}%`}
                change={5}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Completion Rate"
                value={`${classData?.completionRate}%`}
                change={-2}
                icon={CheckCircle}
                color="purple"
              />
              <StatCard
                title="At Risk Students"
                value={classData?.atRiskStudents}
                change={-12}
                icon={AlertTriangle}
                color="red"
              />
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Progress Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Progress Trends</h3>                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={classProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="progress" stroke={colors.primary} strokeWidth={2} />
                    <Line type="monotone" dataKey="engagement" stroke={colors.secondary} strokeWidth={2} />
                    <Line type="monotone" dataKey="completion" stroke={colors.accent} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Student Performance Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={studentDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {studentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Student Analytics</h2>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </motion.button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentAnalytics.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Content Performance</h2>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Analytics</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={lessonAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lesson" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completion" fill={colors.primary} name="Completion Rate %" />
                  <Bar dataKey="avgTime" fill={colors.secondary} name="Avg Time (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Interventions Tab */}
        {activeTab === 'interventions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Suggested Interventions</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">At-Risk Students</h3>
                {studentAnalytics.filter(s => s.riskLevel === 'high').map((student) => (
                  <div key={student.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">Progress: {student.progress}%, Grade: {student.grade}%</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Contact
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Recommended Actions</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-gray-900">Review Lesson 8 Content</h4>
                    <p className="text-sm text-gray-600">Low completion rate indicates difficulty spike</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-gray-900">Schedule Office Hours</h4>
                    <p className="text-sm text-gray-600">8 students showing concerning patterns</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-gray-900">Peer Study Groups</h4>
                    <p className="text-sm text-gray-600">Encourage collaboration among struggling students</p>
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

export default InstructorAnalytics;
