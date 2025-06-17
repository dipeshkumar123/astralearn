/**
 * Instructor Dashboard - Comprehensive Teaching and Analytics Interface
 * Features: Course Management, Student Analytics, Engagement Monitoring, Content Creation
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  BarChart3,
  Eye,
  Edit3,
  Settings,
  Calendar,
  MessageSquare,
  Award,
  Clock,
  Target,
  Activity,
  FileText,
  Video,
  PieChart
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const InstructorDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      loadInstructorData();
    }
  }, [token]);

  const loadInstructorData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load instructor's courses with individual error handling
      try {
        const coursesResponse = await fetch('/api/courses/instructor', {
          headers: { Authorization: `Bearer ${token}` }
        });
          if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData || []);
        } else {
          console.warn('Failed to load courses:', coursesResponse.status);
          setCourses([]);
        }
      } catch (coursesError) {
        console.error('Courses loading error:', coursesError);
        setCourses([]);
      }

      // Load instructor analytics with individual error handling
      try {
        const analyticsResponse = await fetch('/api/analytics/instructor/dashboard-overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
          if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData.data);
        } else {
          console.warn('Failed to load analytics:', analyticsResponse.status);
          setAnalytics({
            totalStudents: 0,
            averagePerformance: 0,
            averageCompletionRate: 0,
            totalCourses: 0,
            activeStudents: 0
          });
        }
      } catch (analyticsError) {
        console.error('Analytics loading error:', analyticsError);
        setAnalytics({
          totalStudents: 0,
          averagePerformance: 0,
          averageCompletionRate: 0,
          totalCourses: 0,
          activeStudents: 0
        });
      }

      // Load alerts with individual error handling
      try {
        if (courses.length > 0) {
          const alertsResponse = await fetch(`/api/analytics/instructor/alerts/${courses[0]._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (alertsResponse.ok) {
            const alertsData = await alertsResponse.json();
            setAlerts(alertsData.alerts || []);
          } else {
            console.warn('Failed to load alerts:', alertsResponse.status);
            setAlerts([]);
          }
        }
      } catch (alertsError) {
        console.error('Alerts loading error:', alertsError);
        setAlerts([]);
      }

    } catch (error) {
      console.error('Instructor dashboard data loading error:', error);
      setError('Failed to load instructor dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, Professor {user.lastName}! 👨‍🏫
        </h1>
        <p className="text-green-100 mb-4">
          Manage your courses, track student progress, and create engaging content.
        </p>
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-green-100">Active Courses</div>
            <div className="text-xl font-bold">{courses.length}</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-green-100">Total Students</div>
            <div className="text-xl font-bold">{analytics?.totalStudents || 0}</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-green-100">Avg. Performance</div>
            <div className="text-xl font-bold">{analytics?.averagePerformance || 0}%</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Active Courses',
            value: courses.filter(c => c.isPublished).length,
            icon: BookOpen,
            color: 'blue',
            trend: `${courses.length} total`,
            action: 'Manage Courses'
          },
          {
            title: 'Total Enrollments',
            value: courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0),
            icon: Users,
            color: 'green',
            trend: '+12 this week',
            action: 'View Students'
          },
          {
            title: 'Avg. Completion Rate',
            value: `${analytics?.averageCompletionRate || 85}%`,
            icon: TrendingUp,
            color: 'orange',
            trend: '+3% from last month',
            action: 'View Analytics'
          },
          {
            title: 'Active Alerts',
            value: alerts.length,
            icon: AlertTriangle,
            color: alerts.length > 0 ? 'red' : 'gray',
            trend: alerts.length > 0 ? 'Needs attention' : 'All good',
            action: 'View Alerts'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
            <div className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
              {stat.action}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course Management */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.slice(0, 6).map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-1">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-gray-500">
                  {course.difficulty}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{course.enrollmentCount || 0} students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{course.estimatedDuration || 0}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{course.modules?.length || 0} modules</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-3 w-3" />
                  <span>85% avg.</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              {
                type: 'enrollment',
                message: '15 new students enrolled in JavaScript Fundamentals',
                time: '2 hours ago',
                icon: Users,
                color: 'green'
              },
              {
                type: 'completion',
                message: 'Sarah completed Module 3 in React Advanced',
                time: '4 hours ago',
                icon: Award,
                color: 'blue'
              },
              {
                type: 'question',
                message: '3 new questions posted in discussion forum',
                time: '6 hours ago',
                icon: MessageSquare,
                color: 'orange'
              },
              {
                type: 'assignment',
                message: '12 assignments submitted for review',
                time: '1 day ago',
                icon: FileText,
                color: 'purple'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                  <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Alerts & Notifications</h2>
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 bg-${alert.type === 'warning' ? 'yellow' : 'red'}-50 border-${alert.type === 'warning' ? 'yellow' : 'red'}-400`}>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className={`h-5 w-5 text-${alert.type === 'warning' ? 'yellow' : 'red'}-600 mt-0.5`} />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-700">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No active alerts</p>
              <p className="text-sm text-gray-500">All your courses are running smoothly!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCourseManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create New Course
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Import Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-900">{course.title}</h3>
              <div className="flex items-center space-x-1">
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {course.description}
            </p>
            
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.isPublished 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {course.difficulty}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount || 0} students</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.estimatedDuration || 0}h duration</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{course.modules?.length || 0} modules</span>
              </div>
              <div className="flex items-center space-x-1">
                <Video className="h-4 w-4" />
                <span>{course.lessons?.length || 0} lessons</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Analytics
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                Manage
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading instructor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Instructor Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 mb-6">
            Some features may not be available, but you can still access basic functionality.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setError(null);
                loadInstructorData();
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setError(null)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Continue with Limited Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Dashboard', icon: Activity },
              { id: 'courses', label: 'My Courses', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'content', label: 'Content', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'courses' && renderCourseManagement()}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">Track student performance, engagement, and learning outcomes.</p>
          </div>
        )}
        {activeTab === 'students' && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Management</h3>
            <p className="text-gray-600">Monitor student progress and provide personalized support.</p>
          </div>
        )}
        {activeTab === 'content' && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Creation</h3>
            <p className="text-gray-600">Create and manage course materials, videos, and assessments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
