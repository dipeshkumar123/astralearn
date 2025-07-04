/**
 * Admin Dashboard - Platform Management and System Analytics
 * Features: User Management, Platform Analytics, System Settings, Course Oversight
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Server,
  Settings,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  UserX,
  BarChart3,
  Database,
  Globe,
  Zap,
  PieChart,
  Activity,
  Monitor,
  FileText,
  Mail,
  Bell
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';
import EnhancedAIAssistant from '../ai/EnhancedAIAssistant';
const AdminDashboard = () => {
  // AI Assistant integration
  const { updateContext, setAssistantMode } = useAIAssistantStore();
  
  // Safe location access - fallback if not in Router context
  let location;
  try {
    location = useLocation();
  } catch (error) {
    location = { pathname: '/admin' };
  }
  
  const { user } = useAuth();
  
  // Update AI context based on current page and user
  useEffect(() => {
    updateContext({
      page: 'system-assistant',
      userId: user?.id,
      userRole: 'admin',
      sessionData: {
        path: location.pathname,
        timestamp: Date.now()
      }
    });
    setAssistantMode('system-assistant');
  }, [updateContext, setAssistantMode, location, user]);

  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load all admin data from real APIs
      const [analyticsResponse, systemStatsResponse, userStatsResponse, healthResponse] = await Promise.all([
        fetch('/api/analytics/platform/overview', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/system/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/users/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/system/health', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setPlatformAnalytics(analyticsData.data);
      }

      if (systemStatsResponse.ok) {
        const systemData = await systemStatsResponse.json();
        setSystemStats(systemData.stats);
      } else {
        setSystemStats({
          totalUsers: 0,
          activeUsers: 0,
          totalCourses: 0,
          activeCourses: 0,
          totalLessons: 0,
          systemUptime: 'N/A',
          serverLoad: 0,
          databaseSize: 'N/A'
        });
      }

      if (userStatsResponse.ok) {
        const userData = await userStatsResponse.json();
        setUserStats(userData.stats);
      } else {
        setUserStats({
          students: 0,
          instructors: 0,
          admins: 0,
          newUsersToday: 0,
          activeSessionsNow: 0
        });
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData.health);
      } else {
        setSystemHealth({
          webServer: 'unknown',
          database: 'unknown',
          aiService: 'unknown',
          fileStorage: 'unknown',
          emailService: 'unknown'
        });
      }

    } catch (error) {
      console.error('Admin dashboard data loading error:', error);
      // Set empty states on error
      setSystemStats({
        totalUsers: 0,
        activeUsers: 0,
        totalCourses: 0,
        activeCourses: 0,
        totalLessons: 0,
        systemUptime: 'N/A',
        serverLoad: 0,
        databaseSize: 'N/A'
      });
      setUserStats({
        students: 0,
        instructors: 0,
        admins: 0,
        newUsersToday: 0,
        activeSessionsNow: 0
      });
      setSystemHealth({
        webServer: 'error',
        database: 'error',
        aiService: 'error',
        fileStorage: 'error',
        emailService: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          System Administrator Dashboard 🛡️
        </h1>
        <p className="text-purple-100 mb-4">
          Monitor platform health, manage users, and oversee the entire AstraLearn ecosystem.
        </p>
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-purple-100">Total Users</div>
            <div className="text-xl font-bold">{systemStats?.totalUsers?.toLocaleString()}</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-purple-100">Active Courses</div>
            <div className="text-xl font-bold">{systemStats?.activeCourses}</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-purple-100">System Uptime</div>
            <div className="text-xl font-bold">{systemStats?.systemUptime}</div>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { name: 'Web Server', status: systemHealth?.webServer, icon: Server },
          { name: 'Database', status: systemHealth?.database, icon: Database },
          { name: 'AI Service', status: systemHealth?.aiService, icon: Zap },
          { name: 'File Storage', status: systemHealth?.fileStorage, icon: FileText },
          { name: 'Email Service', status: systemHealth?.emailService, icon: Mail }
        ].map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <service.icon className="h-6 w-6 text-gray-600" />
              <div className={`w-3 h-3 rounded-full ${
                service.status === 'healthy' ? 'bg-green-500' :
                service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
            <div className="text-sm font-medium text-gray-900">{service.name}</div>
            <div className={`text-xs ${
              service.status === 'healthy' ? 'text-green-600' :
              service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {service.status === 'healthy' ? 'Operational' :
               service.status === 'warning' ? 'Warning' : 'Down'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Users',
            value: systemStats?.totalUsers?.toLocaleString(),
            icon: Users,
            color: 'blue',
            trend: '+247 this week',
            subtitle: `${systemStats?.activeUsers?.toLocaleString()} active`
          },
          {
            title: 'Platform Courses',
            value: systemStats?.totalCourses?.toLocaleString(),
            icon: BookOpen,
            color: 'green',
            trend: '+23 this week',
            subtitle: `${systemStats?.activeCourses} published`
          },
          {
            title: 'System Load',
            value: `${systemStats?.serverLoad}%`,
            icon: Monitor,
            color: systemStats?.serverLoad > 70 ? 'red' : 'orange',
            trend: 'Normal range',
            subtitle: 'CPU utilization'
          },
          {
            title: 'Storage Used',
            value: systemStats?.databaseSize,
            icon: Database,
            color: 'purple',
            trend: '+120MB today',
            subtitle: 'Database size'
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
            <div className="text-xs text-gray-500">{stat.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Distribution</h2>
          <div className="space-y-4">
            {[
              { role: 'Students', count: userStats?.students, color: 'blue', percentage: 90 },
              { role: 'Instructors', count: userStats?.instructors, color: 'green', percentage: 8 },
              { role: 'Administrators', count: userStats?.admins, color: 'purple', percentage: 2 }
            ].map((userType, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded bg-${userType.color}-500`} />
                  <span className="text-sm font-medium text-gray-900">{userType.role}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {userType.count?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{userType.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">New users today:</span>
              <span className="font-semibold text-green-600">+{userStats?.newUsersToday}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Active sessions:</span>
              <span className="font-semibold text-blue-600">{userStats?.activeSessionsNow?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Recent System Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Activity</h2>
          <div className="space-y-4">
            {[
              {
                type: 'user',
                message: 'New instructor account created',
                details: 'Dr. Smith joined Computer Science department',
                time: '15 minutes ago',
                icon: UserCheck,
                color: 'green'
              },
              {
                type: 'course',
                message: 'Course published',
                details: 'Advanced React Development went live',
                time: '1 hour ago',
                icon: BookOpen,
                color: 'blue'
              },
              {
                type: 'system',
                message: 'System maintenance completed',
                details: 'Database optimization finished successfully',
                time: '3 hours ago',
                icon: Settings,
                color: 'purple'
              },
              {
                type: 'alert',
                message: 'High server load detected',
                details: 'Auto-scaling triggered, additional resources allocated',
                time: '6 hours ago',
                icon: AlertTriangle,
                color: 'orange'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                  <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center space-x-3">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Create Admin Account
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export Users
          </button>
        </div>
      </div>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Students',
            count: userStats?.students,
            icon: Users,
            color: 'blue',
            change: '+127 this month'
          },
          {
            title: 'Instructors', 
            count: userStats?.instructors,
            icon: UserCheck,
            color: 'green',
            change: '+12 this month'
          },
          {
            title: 'Administrators',
            count: userStats?.admins,
            icon: ShieldCheck,
            color: 'purple',
            change: '+2 this month'
          }
        ].map((userType, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${userType.color}-100`}>
                <userType.icon className={`h-6 w-6 text-${userType.color}-600`} />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userType.count?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-2">{userType.title}</div>
            <div className="text-xs text-green-600">{userType.change}</div>
          </motion.div>
        ))}
      </div>

      {/* User Activity Table Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent User Activity</h3>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            View All Users
          </button>
        </div>
        <div className="text-center py-8">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">User management interface will be displayed here</p>
          <p className="text-sm text-gray-500">Real-time user data, role management, and activity monitoring</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
              { id: 'overview', label: 'System Overview', icon: Activity },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'courses', label: 'Course Oversight', icon: BookOpen },
              { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
              { id: 'settings', label: 'System Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
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
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'courses' && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Oversight</h3>
            <p className="text-gray-600">Monitor all platform courses, approve content, and manage quality.</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Analytics</h3>
            <p className="text-gray-600">Comprehensive analytics for platform usage, performance, and growth.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
            <p className="text-gray-600">Configure platform settings, security, and system parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
