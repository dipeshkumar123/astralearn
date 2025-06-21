/**
 * Modern Course Preview Component
 * Redesigned course preview page with modern LMS design patterns
 * Shows all modules/lessons before enrollment with interactive features
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Target, 
  Award, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  Globe,
  Calendar,
  BarChart3,
  Heart,
  Share2,
  Download,
  PlayCircle,
  User,
  MessageCircle,
  Trophy,
  Zap,
  Shield,
  X,
  Check,
  TrendingUp,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ModernCoursePreview = ({ 
  course, 
  onEnroll, 
  onBack,
  userProgress = null,
  isEnrolled = false 
}) => {
  const [expandedModules, setExpandedModules] = useState(new Set([0])); // Expand first module by default
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Calculate course statistics
  const totalLessons = course?.modules?.reduce((total, module) => 
    total + (module.lessons?.length || 0), 0) || 0;
  
  const completedLessons = userProgress?.completedLessons?.length || 0;
  const progressPercentage = isEnrolled && totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const toggleModule = (moduleIndex) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex);
    } else {
      newExpanded.add(moduleIndex);
    }
    setExpandedModules(newExpanded);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEnroll = async () => {
    if (onEnroll) {
      await onEnroll(course._id);
      setShowEnrollModal(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-600">
                  by {course.instructor?.firstName} {course.instructor?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-2 rounded-lg transition-colors ${
                  isWishlisted 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 shadow-sm border"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty || 'Beginner'}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(course.estimatedDuration)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {course.modules?.length || 0} modules
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {course.enrollmentCount || 0} students
                </div>
                {course.rating && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                    {course.rating.toFixed(1)}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">{course.title}</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{course.description}</p>

              {/* Progress Bar for Enrolled Students */}
              {isEnrolled && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-blue-900">Your Progress</h3>
                    <span className="text-sm font-medium text-blue-700">{progressPercentage}% complete</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div 
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
              )}

              {/* Skills & Learning Outcomes */}
              {course.metadata?.skillsGained?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.metadata.skillsGained.map((skill, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Course Content', icon: BookOpen },
                    { id: 'instructor', label: 'Instructor', icon: User },
                    { id: 'reviews', label: 'Reviews', icon: Star }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Course Content</h3>
                      <div className="space-y-4">
                        {course.modules?.map((module, moduleIndex) => (
                          <div key={moduleIndex} className="border rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleModule(moduleIndex)}
                              className="w-full px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                {expandedModules.has(moduleIndex) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                                <div className="text-left">
                                  <h4 className="font-medium text-gray-900">
                                    Module {moduleIndex + 1}: {module.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {module.lessons?.length || 0} lessons • {formatDuration(module.estimatedDuration || 0)}
                                  </p>
                                </div>
                              </div>
                            </button>

                            <AnimatePresence>
                              {expandedModules.has(moduleIndex) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 border-t bg-white">
                                    <p className="text-gray-600 mb-4">{module.description}</p>
                                    <div className="space-y-2">
                                      {module.lessons?.map((lesson, lessonIndex) => (
                                        <div 
                                          key={lessonIndex}
                                          className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                                          onClick={() => setSelectedLesson(lesson)}
                                        >
                                          <div className="flex items-center space-x-3">
                                            {isEnrolled && userProgress?.completedLessons?.includes(lesson._id) ? (
                                              <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                              <Play className="w-4 h-4 text-gray-400" />
                                            )}
                                            <div>
                                              <p className="font-medium text-gray-900 text-sm">{lesson.title}</p>
                                              <p className="text-xs text-gray-600">
                                                {formatDuration(lesson.estimatedDuration || 15)}
                                              </p>
                                            </div>
                                          </div>
                                          {!isEnrolled && (
                                            <Eye className="w-4 h-4 text-gray-400" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'instructor' && (
                    <motion.div
                      key="instructor"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Meet Your Instructor</h3>
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {course.instructor?.firstName?.[0]}{course.instructor?.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {course.instructor?.firstName} {course.instructor?.lastName}
                          </h4>
                          <p className="text-gray-600 mb-4">{course.instructor?.email}</p>
                          <p className="text-gray-700">
                            Experienced educator passionate about helping students achieve their learning goals 
                            through practical, hands-on instruction and personalized guidance.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Student Reviews</h3>
                      <div className="text-center py-12 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No reviews yet. Be the first to review this course!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border p-6 sticky top-24"
            >
              {isEnrolled ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">You're Enrolled!</h3>
                  <p className="text-gray-600 mb-4">Continue your learning journey</p>
                  <button 
                    onClick={() => onBack?.('learning')}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continue Learning
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {course.price ? `$${course.price}` : 'Free'}
                    </div>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <div className="text-sm text-gray-500 line-through">
                        ${course.originalPrice}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowEnrollModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4"
                  >
                    Enroll Now
                  </button>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Download className="w-4 h-4" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Globe className="w-4 h-4" />
                      <span>Access on all devices</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Course Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Course Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students Enrolled</span>
                  <span className="font-medium">{course.enrollmentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Modules</span>
                  <span className="font-medium">{course.modules?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Lessons</span>
                  <span className="font-medium">{totalLessons}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Prerequisites */}
            {course.prerequisites?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {showEnrollModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Enroll in {course.title}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you ready to start your learning journey? You'll get instant access to all course materials.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnroll}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enroll Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lesson Preview Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedLesson.title}
                </h3>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Duration: {formatDuration(selectedLesson.estimatedDuration || 15)}</span>
                  <span>•</span>
                  <span>Difficulty: {selectedLesson.difficulty || 'Beginner'}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                {selectedLesson.objectives && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Learning Objectives:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedLesson.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">
                    {isEnrolled 
                      ? "This lesson is available in your enrolled course."
                      : "Preview available after enrollment. Get full access by enrolling in the course."
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {!isEnrolled && (
                  <button
                    onClick={() => {
                      setSelectedLesson(null);
                      setShowEnrollModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enroll to Access
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernCoursePreview;
