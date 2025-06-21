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
  
  // Course catalog state
  const [availableCourses, setAvailableCourses] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');  useEffect(() => {
    if (token) {
      loadDashboardData();
    } else {
      // If no token, still show dashboard with default/empty state
      setLoading(false);
      // Set default values
      setEnrolledCourses([]);
      setLearningStats({
        totalPoints: 0,
        streak: 0,
        certificates: 0,
        todayStudyTime: 0,
        achievements: 0
      });
      setRecommendations([]);
    }

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // Reduced to 10 seconds

    return () => {
      clearTimeout(timeout);
    };
  }, [token]);

  useEffect(() => {
    if (activeTab === 'explore') {
      loadAvailableCourses();
    }
  }, [activeTab, searchTerm, selectedCategory]);  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load enrolled courses
      try {        const coursesResponse = await fetch('/api/courses/my/enrolled', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!coursesResponse.ok) {
          throw new Error(`Failed to load enrolled courses: ${coursesResponse.status}`);
        }        
        const coursesData = await coursesResponse.json();
        setEnrolledCourses(coursesData.enrolledCourses || []);
      } catch (error) {
        setEnrolledCourses([]); // Set empty array as fallback
      }

      // Load learning analytics
      try {
        const analyticsResponse = await fetch('/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!analyticsResponse.ok) {
          throw new Error(`Failed to load analytics: ${analyticsResponse.status}`);
        }        const analyticsData = await analyticsResponse.json();
        
        // Handle different response structures from the analytics API
        const analyticsPayload = analyticsData.data || analyticsData.analytics || analyticsData.summary || analyticsData;
        
        setLearningStats({
          totalPoints: analyticsPayload?.totalPoints || 0,
          streak: analyticsPayload?.streak || 0,
          certificates: analyticsPayload?.certificates || 0,
          todayStudyTime: analyticsPayload?.todayStudyTime || 0,
          achievements: analyticsPayload?.achievements || 0
        });
      } catch (error) {
        setLearningStats({
          totalPoints: 0,
          streak: 0,
          certificates: 0,
          todayStudyTime: 0,
          achievements: 0
        });
      }      // Load recommendations
      try {
        const recommendationsResponse = await fetch('/api/adaptive-learning/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!recommendationsResponse.ok) {
          throw new Error(`Failed to load recommendations: ${recommendationsResponse.status}`);
        }
          const recData = await recommendationsResponse.json();
        setRecommendations(recData.recommendations || []);
      } catch (error) {
        setRecommendations([]);
      }

    } catch (error) {
      // Don't set error state since we have fallbacks for individual components
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCourses = async () => {
    try {
      setCatalogLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 20
      });
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (selectedCategory) {
        queryParams.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/courses?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableCourses(data.courses || []);      } else {
        setAvailableCourses([]);
      }
    } catch (error) {
      console.error('Course catalog loading error:', error);
      setAvailableCourses([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  // Helper function to check if student is enrolled in a course
  const isEnrolledInCourse = (courseId) => {
    return enrolledCourses.some(enrollment => enrollment.course?._id === courseId);
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
              onClick={() => {
                // Navigate to course detail to continue learning
                if (typeof setCurrentView === 'function') {
                  setCurrentView('course-detail');
                  localStorage.setItem('selectedCourseId', enrollment.course?._id);
                } else {
                  // Fallback navigation using custom event
                  const courseId = enrollment.course?._id;
                  if (courseId) {
                    localStorage.setItem('selectedCourseId', courseId);
                    window.dispatchEvent(new CustomEvent('navigateToCourse', { 
                      detail: { view: 'course-detail', courseId } 
                    }));
                  }
                }
              }}
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
                  // Navigate to course detail to continue learning
                  if (typeof setCurrentView === 'function') {
                    setCurrentView('course-detail');
                    localStorage.setItem('selectedCourseId', enrollment.course?._id);
                  } else {
                    // Enhanced fallback - attempt to navigate using custom event
                    const courseId = enrollment.course?._id;
                    if (courseId) {
                      localStorage.setItem('selectedCourseId', courseId);
                      // Trigger a custom event that App.jsx can listen for
                      window.dispatchEvent(new CustomEvent('navigateToCourse', { 
                        detail: { view: 'course-detail', courseId } 
                      }));
                    } else {
                      alert(`Continuing course: ${enrollment.course?.title}`);
                    }
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                Continue
              </button>
            </div>
          </motion.div>        ))}
      </div>
    </div>
  );

  const renderCourseCatalog = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Catalog</h2>
          <p className="text-gray-600">Discover and enroll in new courses</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="programming">Programming</option>
            <option value="data-science">Data Science</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="marketing">Marketing</option>
            <option value="languages">Languages</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {catalogLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      ) : availableCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map((course, index) => (
            <motion.div
              key={course._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{course.title}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">{course.rating || '4.8'}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {course.description}
              </p>
              
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {course.difficulty || 'Beginner'}
                </span>
                {course.category && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {course.category}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount || 0} students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.estimatedDuration || 0}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.modules?.length || 0} modules</span>
                </div>
                <div className="flex items-center space-x-1">
                  <PlayCircle className="h-4 w-4" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    By {course.instructor?.firstName} {course.instructor?.lastName}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        if (setCurrentView) {
                          setCurrentView('course-preview');
                          localStorage.setItem('selectedCourseId', course._id);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Preview
                    </button>                    
                    {isEnrolledInCourse(course._id) ? (
                      <button 
                        onClick={() => {
                          // Navigate to continue learning
                          if (setCurrentView) {
                            setCurrentView('course-detail');
                            localStorage.setItem('selectedCourseId', course._id);
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Continue
                      </button>
                    ) : (
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/courses/${course._id}/enroll`, {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              }
                            });
                            
                            if (response.ok) {
                              alert(`Successfully enrolled in: ${course.title}`);
                              // Refresh enrolled courses
                              loadDashboardData();
                            } else {
                              const errorData = await response.json();
                              alert(`Enrollment failed: ${errorData.message || 'Unknown error'}`);
                            }
                          } catch (error) {
                            console.error('Enrollment error:', error);
                            alert('Enrollment failed. Please try again.');
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || selectedCategory ? 'No Matching Courses' : 'No Courses Available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search criteria or browse all available courses.'
              : 'New courses are being added regularly. Check back soon for exciting learning opportunities!'
            }
          </p>
          {(searchTerm || selectedCategory) && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Courses
            </button>
          )}
        </div>
      )}
    </div>
  );
  if (loading) {
    return (      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            Token: {token ? 'Available' : 'Missing'} | 
            User: {user?.firstName || 'Unknown'}
          </p>
          <div className="mt-6 space-y-2">
            <button
              onClick={() => {
                console.log('🚨 Emergency bypass activated');
                setLoading(false);
                setEnrolledCourses([]);
                setLearningStats({
                  totalPoints: 0,
                  streak: 0,
                  certificates: 0,
                  todayStudyTime: 0,
                  achievements: 0
                });
                setRecommendations([]);
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors mx-2"
            >
              Skip Loading (Emergency)
            </button>
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-2"
            >
              Retry Loading
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            If loading takes more than 10 seconds, click "Skip Loading"
          </p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'my-learning' && renderMyLearning()}
        {activeTab === 'explore' && renderCourseCatalog()}        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Achievement Dashboard Link */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">🏆 Your Achievements</h2>
                  <p className="text-purple-100">Track your learning milestones and certificates.</p>
                </div>
                <button
                  onClick={() => {
                    if (setCurrentView) {
                      setCurrentView('gamification');
                    }
                  }}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  View Full Dashboard →
                </button>
              </div>
            </div>

            {/* Quick Achievement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{learningStats?.achievements || 0}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Total Achievements</h3>
                <p className="text-sm text-gray-600">Earned through learning</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold text-gray-900">{learningStats?.certificates || 0}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Certificates</h3>
                <p className="text-sm text-gray-600">Course completions</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-8 w-8 text-orange-500" />
                  <span className="text-2xl font-bold text-gray-900">{learningStats?.streak || 0}</span>
                </div>
                <h3 className="font-semibold text-gray-900">Learning Streak</h3>
                <p className="text-sm text-gray-600">Days in a row</p>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Trophy className="h-6 w-6 text-yellow-600 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">First Course Completed</p>
                      <p className="text-sm text-gray-600">Completed your first full course</p>
                    </div>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
