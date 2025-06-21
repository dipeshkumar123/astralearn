/**
 * Redesigned Course Preview Component
 * Modern LMS-style course preview with interactive features and enrollment flow
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
  Heart,
  Share2,
  Download,
  PlayCircle,
  User,
  MessageCircle,
  Trophy,
  Shield,
  X,
  Zap,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RedesignedCoursePreview = ({ 
  course, 
  userProgress, 
  isEnrolled = false, 
  onEnroll, 
  onBack 
}) => {
  const [expandedModules, setExpandedModules] = useState(new Set([0])); // Expand first module by default
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate course statistics
  const totalLessons = course?.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
  const totalDuration = course?.modules?.reduce((acc, module) => acc + (module.estimatedDuration || 0), 0) || 0;
  const completedLessons = userProgress ? Object.values(userProgress).reduce((acc, moduleProgress) => 
    acc + Object.values(moduleProgress).filter(lesson => lesson.completed).length, 0) : 0;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEnroll = async () => {
    if (onEnroll) {
      const success = await onEnroll(course._id);
      if (success) {
        setShowEnrollModal(false);
      }
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Course Header */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="flex items-center justify-between py-6 border-b border-blue-700/30">
            <button
              onClick={onBack}
              className="flex items-center text-blue-200 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-2 rounded-lg transition-all ${
                  isWishlisted 
                    ? 'bg-red-500 text-white scale-110' 
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 hover:scale-105 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Course Hero Content */}
          <div className="py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Course Info */}
              <div className="lg:col-span-2">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(course.difficulty)}`}>
                      <Target className="w-4 h-4 mr-2" />
                      {course.difficulty || 'Beginner'}
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {course.category || 'Technology'}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {course.title}
                  </h1>
                  
                  <p className="text-xl text-blue-100 leading-relaxed max-w-3xl">
                    {course.description}
                  </p>

                  {/* Course Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-2 mx-auto">
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="font-bold text-lg">{course.rating || 4.8}</div>
                      <div className="text-blue-200 text-sm">Rating</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-2 mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-lg">{course.enrollmentCount || '5.2K'}</div>
                      <div className="text-blue-200 text-sm">Students</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-2 mx-auto">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-lg">{formatDuration(totalDuration)}</div>
                      <div className="text-blue-200 text-sm">Duration</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-2 mx-auto">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-lg">{totalLessons}</div>
                      <div className="text-blue-200 text-sm">Lessons</div>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {course.instructor?.firstName?.[0]}{course.instructor?.lastName?.[0]}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-semibold text-lg">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </p>
                      <p className="text-blue-200">Senior Instructor & Industry Expert</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-blue-200">
                        <span>4.9⭐ Instructor Rating</span>
                        <span>•</span>
                        <span>15+ Courses</span>
                        <span>•</span>
                        <span>50K+ Students</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Enrollment Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-8 sticky top-8">
                  {/* Course Preview */}
                  <div className="relative bg-gray-900 rounded-xl mb-6 aspect-video overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 group-hover:shadow-2xl">
                        <Play className="w-10 h-10 text-gray-900 ml-2" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                      🎬 Course Preview
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-4xl font-bold text-gray-900">
                        {course.price || 'Free'}
                      </div>
                      {course.originalPrice && (
                        <>
                          <span className="text-xl text-gray-500 line-through">
                            ${course.originalPrice}
                          </span>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-sm font-medium">
                            Save 60%
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center text-orange-600 text-sm font-medium">
                      <Zap className="w-4 h-4 mr-1" />
                      Limited time offer • 2 days left
                    </div>
                  </div>

                  {/* Enrollment Status & Button */}
                  {isEnrolled ? (
                    <div className="space-y-6">
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <div className="flex items-center text-green-700 mb-3">
                          <CheckCircle className="w-6 h-6 mr-2" />
                          <span className="font-bold text-lg">You're Enrolled!</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Progress</span>
                            <span className="font-medium">{overallProgress}% complete</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-3">
                            <div 
                              className="bg-green-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${overallProgress}%` }}
                            />
                          </div>
                          <div className="text-sm text-green-600">
                            {completedLessons} of {totalLessons} lessons completed
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => onBack('course-detail')}
                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                      >
                        <PlayCircle className="w-6 h-6 mr-2" />
                        Continue Learning
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowEnrollModal(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Enroll Now - Start Learning
                    </button>
                  )}

                  {/* Course Includes */}
                  <div className="mt-8 space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg">This course includes:</h4>
                    <div className="space-y-3">
                      {[
                        { icon: Clock, text: `${formatDuration(totalDuration)} on-demand video`, color: 'text-blue-600' },
                        { icon: BookOpen, text: `${totalLessons} comprehensive lessons`, color: 'text-green-600' },
                        { icon: Download, text: 'Downloadable resources', color: 'text-purple-600' },
                        { icon: Award, text: 'Certificate of completion', color: 'text-yellow-600' },
                        { icon: Globe, text: 'Access on mobile and TV', color: 'text-indigo-600' },
                        { icon: Shield, text: '30-day money-back guarantee', color: 'text-red-600' }
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={index} className="flex items-center">
                            <Icon className={`w-5 h-5 mr-3 ${item.color}`} />
                            <span className="text-gray-700">{item.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-t-3xl shadow-xl -mt-12 relative z-10">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 pt-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: BookOpen },
                { id: 'curriculum', name: 'Curriculum', icon: Target },
                { id: 'instructor', name: 'Instructor', icon: User },
                { id: 'reviews', name: 'Reviews', icon: MessageCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-2 border-b-3 font-semibold text-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 transform scale-105'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-12"
                >
                  {/* What You'll Learn */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Trophy className="w-6 h-6 mr-3 text-yellow-500" />
                      What you'll learn
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(course.objectives || [
                        'Master the fundamentals and core concepts',
                        'Build real-world projects from scratch',
                        'Apply best practices and industry standards',
                        'Develop problem-solving skills',
                        'Understand advanced techniques and patterns',
                        'Create a professional portfolio'
                      ]).map((objective, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start bg-green-50 rounded-lg p-4"
                        >
                          <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-800 font-medium">{objective}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h3>
                    <div className="bg-blue-50 rounded-xl p-6">
                      <ul className="space-y-3">
                        {(course.requirements || [
                          'Basic computer skills and internet access',
                          'No prior experience required - we start from the beginning',
                          'A willingness to learn and practice'
                        ]).map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-4 mt-2"></div>
                            <span className="text-gray-700 text-lg">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Course Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">About this course</h3>
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p className="text-xl leading-relaxed">
                        {course.detailedDescription || course.description || 
                        `This comprehensive course is designed to take you from beginner to advanced level. 
                        You'll learn through a combination of theory, practical exercises, and real-world projects. 
                        Our step-by-step approach ensures you understand each concept thoroughly before moving on to the next.`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'curriculum' && (
                <motion.div
                  key="curriculum"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Course Curriculum</h3>
                    <div className="flex items-center space-x-6 text-gray-600">
                      <span className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        {course.modules?.length || 0} modules
                      </span>
                      <span className="flex items-center">
                        <PlayCircle className="w-5 h-5 mr-2" />
                        {totalLessons} lessons
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        {formatDuration(totalDuration)} total
                      </span>
                    </div>
                  </div>

                  {/* Module List */}
                  <div className="space-y-4">
                    {course.modules?.map((module, moduleIndex) => (
                      <motion.div 
                        key={moduleIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: moduleIndex * 0.1 }}
                        className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => toggleModule(moduleIndex)}
                          className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {expandedModules.has(moduleIndex) ? 
                                <ChevronDown className="w-6 h-6 text-gray-400 mr-4" /> :
                                <ChevronRight className="w-6 h-6 text-gray-400 mr-4" />
                              }
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">
                                  Module {moduleIndex + 1}: {module.title}
                                </h4>
                                <p className="text-gray-600 mt-1">
                                  {module.lessons?.length || 0} lessons • {formatDuration(module.estimatedDuration || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedModules.has(moduleIndex) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-gray-50 border-t border-gray-200">
                                {module.lessons?.map((lesson, lessonIndex) => {
                                  const isCompleted = userProgress?.[moduleIndex]?.[lessonIndex]?.completed;
                                  const canPreview = lessonIndex < 2; // Allow preview of first 2 lessons
                                  
                                  return (
                                    <motion.div
                                      key={lessonIndex}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: lessonIndex * 0.05 }}
                                      className="px-8 py-4 border-b border-gray-200 last:border-b-0 hover:bg-white transition-colors group"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-1">
                                          <div className="w-10 h-10 mr-4 flex items-center justify-center">
                                            {isCompleted ? (
                                              <CheckCircle className="w-6 h-6 text-green-500" />
                                            ) : (
                                              <PlayCircle className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-semibold text-gray-900">
                                              {lesson.title}
                                            </p>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                              <Clock className="w-4 h-4 mr-1" />
                                              {formatDuration(lesson.estimatedDuration || 15)}
                                              {canPreview && (
                                                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                  FREE PREVIEW
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {canPreview && !isEnrolled && (
                                          <button
                                            onClick={() => setSelectedLesson({ moduleIndex, lessonIndex, lesson })}
                                            className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                          >
                                            Preview
                                          </button>
                                        )}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'instructor' && (
                <motion.div
                  key="instructor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  <div className="flex items-start space-x-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {course.instructor?.firstName?.[0]}{course.instructor?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </h3>
                      <p className="text-xl text-gray-600 mb-6">Senior Instructor & Industry Expert</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        {[
                          { label: 'Instructor Rating', value: '4.8', icon: '⭐' },
                          { label: 'Reviews', value: '1,234', icon: '💬' },
                          { label: 'Students', value: '12,345', icon: '👥' },
                          { label: 'Courses', value: '15', icon: '📚' }
                        ].map((stat, index) => (
                          <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                            <div className="text-2xl mb-1">{stat.icon}</div>
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-gray-700 text-lg leading-relaxed">
                        With over 10 years of industry experience, our instructor brings real-world knowledge 
                        and practical insights to every lesson. They have worked with leading companies and 
                        have helped thousands of students achieve their learning goals through engaging, 
                        hands-on instruction.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Review Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 rounded-2xl p-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-3">{course.rating || 4.8}</div>
                      <div className="flex items-center justify-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-gray-600">{course.reviews || 1234} reviews</div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="space-y-3">
                        {[
                          { stars: 5, count: 800, percentage: 65 },
                          { stars: 4, count: 300, percentage: 24 },
                          { stars: 3, count: 100, percentage: 8 },
                          { stars: 2, count: 25, percentage: 2 },
                          { stars: 1, count: 9, percentage: 1 }
                        ].map((rating) => (
                          <div key={rating.stars} className="flex items-center">
                            <div className="w-16 text-gray-600 flex items-center">
                              <span className="mr-1">{rating.stars}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${rating.percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="w-16 text-gray-600 text-right">{rating.percentage}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {[
                      {
                        name: "Sarah Johnson",
                        rating: 5,
                        date: "2 weeks ago",
                        avatar: "SJ",
                        comment: "Excellent course! The instructor explains complex concepts in a very clear and understandable way. The practical projects really helped me solidify my understanding. I've already started applying what I learned in my job."
                      },
                      {
                        name: "Mike Chen",
                        rating: 5,
                        date: "1 month ago", 
                        avatar: "MC",
                        comment: "This course exceeded my expectations. The content is well-structured and the examples are relevant to real-world scenarios. The instructor's teaching style is engaging and easy to follow. Highly recommended!"
                      },
                      {
                        name: "Emily Davis",
                        rating: 4,
                        date: "2 months ago",
                        avatar: "ED",
                        comment: "Great course overall. The pace is good and the materials are comprehensive. I just wish there were more advanced topics covered. But for what it promises, it delivers excellent value."
                      }
                    ].map((review, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {review.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-gray-900">{review.name}</h4>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <div className="flex items-center mb-4">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-5 h-5 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg">{review.comment}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEnrollModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Start Learning?</h3>
                <p className="text-gray-600 text-lg">
                  Join thousands of students and unlock your potential today!
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  'Lifetime access to course content',
                  'Certificate of completion',
                  'Direct instructor support',
                  '30-day money-back guarantee'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleEnroll}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedLesson(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedLesson.lesson.title}
                    </h3>
                    <p className="text-gray-600">
                      Module {selectedLesson.moduleIndex + 1} • Free Preview
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="aspect-video bg-gray-900 rounded-xl mb-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                  <div className="text-center text-white z-10">
                    <PlayCircle className="w-20 h-20 mx-auto mb-4 opacity-80" />
                    <p className="text-xl font-medium">Free Lesson Preview</p>
                    <p className="text-gray-300 mt-2">
                      {formatDuration(selectedLesson.lesson.estimatedDuration || 15)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Lesson Overview</h4>
                    <p className="text-gray-700 leading-relaxed">
                      This lesson introduces key concepts and provides hands-on practice 
                      with real-world examples. You'll learn step-by-step techniques and 
                      best practices used by industry professionals.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">What You'll Learn</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        Core concepts and fundamentals
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        Practical implementation techniques
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        Common patterns and best practices
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        Real-world applications
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                      Like what you see? Get full access to this course and {totalLessons - 2} more lessons.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedLesson(null);
                        setShowEnrollModal(true);
                      }}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RedesignedCoursePreview;
