/**
 * Student Dashboard - Personalized Learning Experience
 * Features: My Learning, Explore Courses, Recommendations, Progress Tracking
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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
import { useDataSync } from '../../contexts/DataSyncProvider';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';

import EnhancedAIAssistant from '../ai/EnhancedAIAssistant';
const StudentDashboard = ({ setCurrentView }) => {
  // AI Assistant integration
  const { updateContext, setAssistantMode } = useAIAssistantStore();
  
  // Safe location access - fallback if not in Router context
  let location;
  try {
    location = useLocation();
  } catch (error) {
    location = { pathname: '/dashboard' };
  }
  
  const { user, token } = useAuth();
  
  // Update AI context based on current page and user
  useEffect(() => {
    updateContext({
      page: 'learning-assistant',
      userId: user?.id,
      userRole: 'student',
      sessionData: {
        path: location.pathname,
        timestamp: Date.now()
      }
    });
    setAssistantMode('learning-assistant');
  }, [updateContext, setAssistantMode, location, user]);

  const {
    courses,
    userProgress,
    analytics,
    loading,
    errors,
    fetchCourses,
    fetchUserProgress,
    fetchAnalytics,
    getCourseProgress,
    getLearningStats,
    getRecommendations,
    enrollInCourse
  } = useDataSync();
    const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Get enrolled courses from real user progress data
  const enrolledCourses = courses.filter(course =>
    userProgress[course._id] || userProgress[course.id]
  );

  // Get available courses (not enrolled)
  const availableCourses = courses.filter(course =>
    !userProgress[course._id] && !userProgress[course.id]
  );
  // Get real learning statistics
  const learningStats = getLearningStats();

  // Get course recommendations based on user's learning pattern
  const recommendations = getRecommendations();

  // Filter courses based on search and category (using filteredCourses for catalog)
  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      course.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(courses.map(course => course.category))].filter(Boolean);  // Handle course enrollment
  // Handle course enrollment
  const handleEnrollCourse = async (courseId) => {
    try {
      // Validate the course ID before proceeding
      if (!courseId) {
        console.error('Missing course ID for enrollment');
        return;
      }
      
      // Convert to string if it's an ObjectId (MongoDB ID)
      const courseIdStr = typeof courseId === 'object' ? 
        (courseId.toString ? courseId.toString() : JSON.stringify(courseId)) : 
        String(courseId);
        
      await enrollInCourse(courseIdStr);
      // Data will be automatically updated through DataSyncProvider
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    }
  };
  // Initialize data when component mounts
  useEffect(() => {
    if (token) {
      fetchCourses();
      fetchUserProgress();
      fetchAnalytics();
    }
  }, [token]); // Remove function dependencies to prevent infinite loop

  // Helper function to check if student is enrolled in a course
  const isEnrolledInCourse = (courseId) => {
    return enrolledCourses.some(course => course._id === courseId || course.id === courseId);
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
        </p>        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-blue-100">Learning Streak</div>
            <div className="text-xl font-bold">{learningStats.currentStreak} days</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-blue-100">Completed Lessons</div>
            <div className="text-xl font-bold">{learningStats.totalLessonsCompleted}</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-sm text-blue-100">Study Time</div>
            <div className="text-xl font-bold">{Math.round(learningStats.totalTimeSpent / 60)}h</div>
          </div>
        </div>
      </div>      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Courses Enrolled',
            value: enrolledCourses.length,
            icon: BookOpen,
            color: 'blue',
            trend: `${learningStats.totalCoursesEnrolled} total`
          },
          {
            title: 'Average Progress',
            value: `${Math.round(learningStats.averageProgress)}%`,
            icon: TrendingUp,
            color: 'green',
            trend: enrolledCourses.length > 0 ? 'On track' : 'Get started'
          },
          {
            title: 'Total Study Time',
            value: `${Math.round(learningStats.totalTimeSpent / 60)}h`,
            icon: Clock,
            color: 'orange',
            trend: `${learningStats.totalLessonsCompleted} lessons`
          },          {
            title: 'Current Streak',
            value: learningStats.currentStreak,
            icon: Award,
            color: 'purple',
            trend: learningStats.currentStreak > 0 ? 'Keep it up!' : 'Start today'
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
                const courseId = enrollment.course?._id;
                if (!courseId) {
                  console.error('Invalid course ID for enrollment:', enrollment);
                  return;
                }
                
                if (typeof setCurrentView === 'function') {
                  localStorage.setItem('selectedCourseId', courseId);
                  setCurrentView('course-detail');
                } else {
                  // Fallback navigation using custom event
                  localStorage.setItem('selectedCourseId', courseId);
                  window.dispatchEvent(new CustomEvent('navigateToCourse', { 
                    detail: { view: 'course-detail', courseId } 
                  }));
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
                      const courseId = rec.id;
                      if (!courseId) {
                        console.error('Invalid course ID for recommendation:', rec);
                        return;
                      }
                      
                      if (setCurrentView) {
                        localStorage.setItem('selectedCourseId', courseId);
                        setCurrentView('course-preview');
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
      </div>      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((course, index) => {
          const progress = getCourseProgress(course._id || course.id);
          
          return (
            <motion.div
              key={course._id || course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900">{course.title}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">{course.rating || '4.0'}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {progress.completed} of {progress.total} lessons                </span>
                <button
                  onClick={() => {
                    const courseId = course._id || course.id;
                    if (courseId && setCurrentView) {
                      localStorage.setItem('selectedCourseId', courseId);
                      setCurrentView('course-detail');
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Continue
                </button>
              </div>            </motion.div>
          );
        })}
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
      </div>      {/* Course Grid */}
      {loading.courses || catalogLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
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
                        const courseId = course._id;
                        if (!courseId) {
                          console.error('Invalid course ID for course preview:', course);
                          return;
                        }
                        
                        if (setCurrentView) {
                          localStorage.setItem('selectedCourseId', courseId);
                          setCurrentView('course-preview');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Preview
                    </button>                      {isEnrolledInCourse(course._id || course.id) ? (
                      <button 
                        onClick={() => {
                          // Navigate to continue learning
                          const courseId = course._id || course.id;
                          if (courseId && setCurrentView) {
                            localStorage.setItem('selectedCourseId', courseId);
                            setCurrentView('course-detail');
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Continue
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          const id = course._id || course.id;
                          if (!id) {
                            console.error('Missing course ID:', course);
                            return;
                          }
                          
                          // Convert any course ID (string or object) to string format
                          const courseIdStr = typeof id === 'object' ? 
                            (id.toString ? id.toString() : JSON.stringify(id)) : 
                            String(id);
                            
                          handleEnrollCourse(courseIdStr);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >                        Enroll
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
  );  // Show loading state when essential data is loading
  if (loading.courses || loading.progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching courses and progress data...
          </p>
        </div>
      </div>    );
  }

  // Show error state if there are critical errors
  if (errors.courses || errors.progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard data</p>
          <button
            onClick={() => {
              fetchCourses(true);
              fetchUserProgress(true);
            }}            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
