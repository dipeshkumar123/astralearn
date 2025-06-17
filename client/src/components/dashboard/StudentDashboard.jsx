/**
 * Student Dashboard - Personalized Learning Experience
 * Features: My Learning, Explore Courses, Recommendations, Progress Tracking
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  Clock, 
  PlayCircle,
  Star,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  Users,
  Brain,
  Zap,
  Trophy,
  Activity
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const StudentDashboard = ({ setCurrentView }) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [learningStats, setLearningStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load enrolled courses
      try {
        const coursesResponse = await fetch('/api/courses/my/enrolled', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!coursesResponse.ok) {
          console.warn('Failed to load enrolled courses:', coursesResponse.status);
          throw new Error(`Failed to load enrolled courses: ${coursesResponse.status}`);
        }
        
        const coursesData = await coursesResponse.json();
        setEnrolledCourses(coursesData.enrolledCourses || []);
      } catch (error) {
        console.warn('Enrolled courses error:', error);
        setEnrolledCourses([]); // Set empty array as fallback
      }

      // Load learning analytics
      try {
        const analyticsResponse = await fetch('/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!analyticsResponse.ok) {
          console.warn('Failed to load analytics:', analyticsResponse.status);
          throw new Error(`Failed to load analytics: ${analyticsResponse.status}`);
        }
        
        const analyticsData = await analyticsResponse.json();
        setLearningStats(analyticsData.analytics || {
          totalPoints: 0,
          streak: 0,
          certificates: 0,
          todayStudyTime: 0,
          achievements: 0
        });
      } catch (error) {
        console.warn('Analytics error:', error);
        setLearningStats({
          totalPoints: 0,
          streak: 0,
          certificates: 0,
          todayStudyTime: 0,
          achievements: 0
        });
      }

      // Load recommendations
      try {
        const recommendationsResponse = await fetch('/api/adaptive-learning/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!recommendationsResponse.ok) {
          console.warn('Failed to load recommendations:', recommendationsResponse.status);
          throw new Error(`Failed to load recommendations: ${recommendationsResponse.status}`);
        }
        
        const recData = await recommendationsResponse.json();
        setRecommendations(recData.recommendations || []);
      } catch (error) {
        console.warn('Recommendations error:', error);
        setRecommendations([]);
      }

    } catch (error) {
      console.error('Dashboard data loading error:', error);
      // Don't set error state since we have fallbacks for individual components
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName}! 🎓
        </h1>
        <p className="text-blue-100 mb-4">
          Ready to continue your learning journey? You have {enrolledCourses.length} active courses.
        </p>
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-blue-100">Learning Streak</div>
            <div className="text-xl font-bold">{learningStats?.streak || 0} days</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-blue-100">Total Points</div>
            <div className="text-xl font-bold">{learningStats?.totalPoints || 0}</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-blue-100">Certificates</div>
            <div className="text-xl font-bold">{learningStats?.certificates || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Courses in Progress',
            value: enrolledCourses.filter(c => c.progress < 100).length,
            icon: BookOpen,
            color: 'blue',
            trend: '+2 this week'
          },
          {
            title: 'Average Progress',
            value: `${Math.round(enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / enrolledCourses.length) || 0}%`,
            icon: TrendingUp,
            color: 'green',
            trend: '+5% this week'
          },
          {
            title: 'Study Time Today',
            value: `${learningStats?.todayStudyTime || 0}h`,
            icon: Clock,
            color: 'orange',
            trend: '2h goal'
          },
          {
            title: 'Achievements',
            value: learningStats?.achievements || 0,
            icon: Award,
            color: 'purple',
            trend: '+1 this week'
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
            <div className="text-xs text-green-600">{stat.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* Continue Learning Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>          <button 
            onClick={() => setActiveTab('my-learning')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All Courses
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledCourses.slice(0, 3).map((enrollment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {enrollment.course?.title || 'Course Title'}
                </h3>
                <PlayCircle className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{enrollment.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${enrollment.progress || 0}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Next: Lesson {enrollment.currentLesson || 1}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>            <button 
              onClick={() => setActiveTab('explore')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>
                  </div>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{rec.duration}</span>
                  </div>                  <button 
                    onClick={() => {
                      // Navigate to course detail or continue learning
                      if (setCurrentView) {
                        setCurrentView('course-preview');
                        localStorage.setItem('selectedCourseId', rec.id);
                      } else {
                        alert(`Starting course: ${rec.title}`);
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMyLearning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Learning</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>          <button 
            onClick={() => {
              // Add filter functionality
              alert('Filter options will be implemented');
            }}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((enrollment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-900">{enrollment.course?.title}</h3>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">4.8</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {enrollment.course?.description}
            </p>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{enrollment.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${enrollment.progress || 0}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{enrollment.course?.estimatedDuration}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{enrollment.course?.enrollmentCount || 0}</span>
                </div>
              </div>              <button 
                onClick={() => {
                  // Navigate to course detail or continue learning
                  if (typeof setCurrentView === 'function') {
                    setCurrentView('course-detail');
                    localStorage.setItem('selectedCourseId', enrollment.course?._id);
                  } else {
                    // Fallback navigation - could use router
                    alert(`Continuing course: ${enrollment.course?.title}`);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Continue
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-2xl mb-4">{error}</div>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={loadDashboardData}
          >
            Retry
          </button>
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
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'my-learning', label: 'My Learning', icon: BookOpen },
              { id: 'explore', label: 'Explore', icon: Search },
              { id: 'achievements', label: 'Achievements', icon: Trophy }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'my-learning' && renderMyLearning()}
        {activeTab === 'explore' && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Catalog</h3>
            <p className="text-gray-600">Explore thousands of courses across various subjects.</p>            <button 
              onClick={() => {
                // Navigate to course catalog
                if (setCurrentView && typeof setCurrentView === 'function') {
                  setCurrentView('course-management');
                } else {
                  alert('Browse courses feature will be implemented');
                }
              }}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        )}
        {activeTab === 'achievements' && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Achievements</h3>
            <p className="text-gray-600">Track your learning milestones and certificates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
