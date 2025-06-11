/**
 * Instructor Analytics Component - Phase 5 Step 1
 * Analytics dashboard specifically designed for instructors and educators
 * 
 * Features:
 * - Class performance overview and insights
 * - Individual learner analytics and interventions
 * - Content effectiveness analysis
 * - Assessment optimization recommendations
 * - At-risk student identification
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
  Radar
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
  Settings
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
      
      // In a real implementation, these would be separate API calls
      // For now, we'll generate comprehensive sample data
      
      // Sample class data
      setClassData({
        totalStudents: 125,
        activeStudents: 98,
        averageProgress: 68,
        completionRate: 82,
        averageGrade: 84.5,
        engagementScore: 76,
        atRiskStudents: 8,
        topPerformers: 15
      });

      // Sample student analytics
      setStudentAnalytics([
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          progress: 95,
          grade: 92,
          engagement: 88,
          lastActive: '2 hours ago',
          riskLevel: 'low',
          trend: 'up'
        },
        {
          id: 2,
          name: 'Bob Smith',
          email: 'bob@example.com',
          progress: 45,
          grade: 58,
          engagement: 42,
          lastActive: '3 days ago',
          riskLevel: 'high',
          trend: 'down'
        },
        {
          id: 3,
          name: 'Carol Brown',
          email: 'carol@example.com',
          progress: 78,
          grade: 81,
          engagement: 75,
          lastActive: '1 hour ago',
          riskLevel: 'low',
          trend: 'up'
        },
        {
          id: 4,
          name: 'David Wilson',
          email: 'david@example.com',
          progress: 32,
          grade: 45,
          engagement: 35,
          lastActive: '5 days ago',
          riskLevel: 'high',
          trend: 'down'
        },
        {
          id: 5,
          name: 'Emma Davis',
          email: 'emma@example.com',
          progress: 87,
          grade: 89,
          engagement: 92,
          lastActive: '30 minutes ago',
          riskLevel: 'low',
          trend: 'up'
        }
      ]);

      // Sample content analytics
      setContentAnalytics({
        totalLessons: 24,
        averageCompletion: 75,
        mostPopular: 'Introduction to React Hooks',
        leastEngaging: 'Advanced State Management',
        averageTimeSpent: 45,
        dropoffPoints: ['Lesson 8', 'Lesson 15', 'Lesson 20']
      });

    } catch (error) {
      console.error('Instructor analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateClassProgressData = () => {
    return Array.from({ length: timeframe }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - 1 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        progress: Math.random() * 20 + 60 + (i / timeframe) * 15,
        engagement: Math.random() * 30 + 65,
        completion: Math.random() * 25 + 70,
        newStudents: Math.floor(Math.random() * 5)
      };
    });
  };

  const generateLessonAnalyticsData = () => {
    return [
      { lesson: 'Lesson 1', completion: 95, avgTime: 35, difficulty: 2 },
      { lesson: 'Lesson 2', completion: 89, avgTime: 42, difficulty: 3 },
      { lesson: 'Lesson 3', completion: 87, avgTime: 38, difficulty: 3 },
      { lesson: 'Lesson 4', completion: 82, avgTime: 55, difficulty: 4 },
      { lesson: 'Lesson 5', completion: 78, avgTime: 48, difficulty: 4 },
      { lesson: 'Lesson 6', completion: 75, avgTime: 52, difficulty: 5 },
      { lesson: 'Lesson 7', completion: 73, avgTime: 58, difficulty: 5 },
      { lesson: 'Lesson 8', completion: 65, avgTime: 45, difficulty: 4 }
    ];
  };

  const generateStudentDistributionData = () => {
    return [
      { name: 'Excellent (90-100%)', value: 15, color: '#10B981' },
      { name: 'Good (80-89%)', value: 35, color: '#3B82F6' },
      { name: 'Average (70-79%)', value: 28, color: '#F59E0B' },
      { name: 'Below Average (60-69%)', value: 15, color: '#F97316' },
      { name: 'At Risk (<60%)', value: 7, color: '#EF4444' }
    ];
  };

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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Progress Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateClassProgressData()}>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={generateStudentDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {generateStudentDistributionData().map((entry, index) => (
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
                <BarChart data={generateLessonAnalyticsData()}>
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
