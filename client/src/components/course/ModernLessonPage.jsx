/**
 * Modern Course Lesson Page - Active Learning Experience
 * Complete redesign with modern UI/UX patterns for students actively learning
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft,
  BookOpen, 
  CheckCircle,
  Clock, 
  Play,
  Pause,
  SkipForward, 
  SkipBack,
  Menu,
  X,
  Brain,
  Trophy,
  TrendingUp,
  Target,
  MessageCircle,
  Bookmark,
  Download,
  Share2,
  Volume2,
  VolumeX,
  Settings,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ModernLessonPage = ({ 
  course, 
  currentModule = 0, 
  currentLesson = 0, 
  userProgress = {}, 
  onBack,
  onLessonComplete,
  onNextLesson,
  onPreviousLesson,
  onNavigateToLesson
}) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [lessonNotes, setLessonNotes] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [lessonProgress, setLessonProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  // Get current lesson and module data
  const getCurrentModule = () => course?.modules?.[currentModule];
  const getCurrentLesson = () => getCurrentModule()?.lessons?.[currentLesson];
  const lesson = getCurrentLesson();
  const module = getCurrentModule();

  // Initialize progress from userProgress
  useEffect(() => {
    if (userProgress?.completedLessons) {
      setCompletedLessons(new Set(userProgress.completedLessons));
    }
  }, [userProgress]);

  // Simulate AI suggestions based on current lesson
  useEffect(() => {
    if (lesson) {
      const suggestions = [
        "💡 Try practicing this concept with the interactive exercises",
        "📚 Review the previous lesson if you need more context",
        "🎯 Focus on the key objectives highlighted in this lesson",
        "🔄 Consider taking notes to reinforce your learning"
      ];
      setAiSuggestions(suggestions.slice(0, 2));
    }
  }, [lesson]);

  const isLessonCompleted = useCallback((moduleIdx, lessonIdx) => {
    const lessonId = course?.modules?.[moduleIdx]?.lessons?.[lessonIdx]?._id;
    return lessonId && completedLessons.has(lessonId);
  }, [completedLessons, course]);

  const markLessonComplete = async () => {
    if (!lesson) return;
    
    const lessonId = lesson._id || `${currentModule}-${currentLesson}`;
    const newCompleted = new Set([...completedLessons, lessonId]);
    setCompletedLessons(newCompleted);
    
    if (onLessonComplete) {
      await onLessonComplete(lessonId, currentModule, currentLesson);
    }
  };

  const navigateToNextLesson = () => {
    if (!module) return;
    
    if (currentLesson < module.lessons.length - 1) {
      onNextLesson?.(currentModule, currentLesson + 1);
    } else if (currentModule < course.modules.length - 1) {
      onNextLesson?.(currentModule + 1, 0);
    }
  };

  const navigateToPreviousLesson = () => {
    if (currentLesson > 0) {
      onPreviousLesson?.(currentModule, currentLesson - 1);
    } else if (currentModule > 0) {
      const prevModule = course.modules[currentModule - 1];
      onPreviousLesson?.(currentModule - 1, prevModule.lessons.length - 1);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const calculateCourseProgress = () => {
    if (!course?.modules) return 0;
    
    const totalLessons = course.modules.reduce((total, mod) => 
      total + (mod.lessons?.length || 0), 0);
    
    if (totalLessons === 0) return 0;
    
    return Math.round((completedLessons.size / totalLessons) * 100);
  };

  const getModuleProgress = (moduleIndex) => {
    const moduleData = course?.modules?.[moduleIndex];
    if (!moduleData?.lessons) return 0;
    
    const completed = moduleData.lessons.filter((_, lessonIdx) => 
      isLessonCompleted(moduleIndex, lessonIdx)).length;
    
    return Math.round((completed / moduleData.lessons.length) * 100);
  };

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Module {currentModule + 1} • Lesson {currentLesson + 1}
                </p>
              </div>
            </div>

            {/* Center - Progress */}
            {showProgress && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateCourseProgress()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {calculateCourseProgress()}%
                  </span>
                </div>
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowProgress(!showProgress)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showProgress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Brain className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-white border-r shadow-sm flex-shrink-0 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {course.modules?.map((moduleData, moduleIndex) => (
                    <div key={moduleIndex} className="border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 text-sm">
                            Module {moduleIndex + 1}: {moduleData.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {getModuleProgress(moduleIndex)}%
                            </span>
                            <div className="w-12 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${getModuleProgress(moduleIndex)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {moduleData.lessons?.length || 0} lessons • {formatDuration(moduleData.estimatedDuration || 0)}
                        </p>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {moduleData.lessons?.map((lessonData, lessonIndex) => {
                          const isCompleted = isLessonCompleted(moduleIndex, lessonIndex);
                          const isCurrent = moduleIndex === currentModule && lessonIndex === currentLesson;
                          
                          return (
                            <div
                              key={lessonIndex}
                              onClick={() => onNavigateToLesson?.(moduleIndex, lessonIndex)}
                              className={`p-3 border-t border-gray-100 cursor-pointer flex items-center justify-between transition-colors ${
                                isCurrent
                                  ? 'bg-blue-100 border-blue-200'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : isCurrent ? (
                                    <Play className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {lessonData.title}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {formatDuration(lessonData.estimatedDuration || 15)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Lesson Header */}
          <div className="bg-white border-b p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                  <p className="text-gray-600 mb-4">{lesson.description || lesson.content?.substring(0, 150) + '...'}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(lesson.estimatedDuration || 15)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{lesson.difficulty || 'Beginner'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>Module {currentModule + 1} of {course.modules.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBookmarks([...bookmarks, lesson._id])}
                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
                {/* Learning Objectives */}
                {lesson.objectives && lesson.objectives.length > 0 && (
                  <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {lesson.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-2 text-blue-800">
                          <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Main Content */}
                <div className="prose prose-lg max-w-none">
                  {lesson.content?.blocks?.length > 0 ? (
                    <div className="space-y-6">
                      {lesson.content.blocks.map((block, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">
                            {block.type} Block
                          </div>
                          {block.type === 'text' && (
                            <div dangerouslySetInnerHTML={{ __html: block.content || 'Sample text content...' }} />
                          )}
                          {block.type === 'image' && (
                            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                              <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                              📷 Image: {block.content?.alt || 'Sample image'}
                            </div>
                          )}
                          {block.type === 'video' && (
                            <div className="bg-gray-900 rounded-lg p-8 text-center text-white">
                              <Play className="w-16 h-16 mx-auto mb-4" />
                              ▶️ Video: {block.content?.title || 'Sample video'}
                            </div>
                          )}
                          {block.type === 'code' && (
                            <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
                              <code>{block.content || '// Sample code here\nconsole.log("Hello, World!");'}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2 text-gray-900">Lesson Content</h3>
                      <div className="text-gray-700 space-y-4">
                        <p>
                          Welcome to <strong>{lesson.title}</strong>! This lesson will help you understand the key concepts 
                          and practical applications of the topic.
                        </p>
                        <p>
                          {lesson.content || 'In this comprehensive lesson, we will explore the fundamental concepts, provide practical examples, and give you hands-on experience with real-world scenarios. You will learn step-by-step how to apply these concepts in your own projects.'}
                        </p>
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="font-medium mb-3">Key Takeaways:</h4>
                          <ul className="text-left space-y-2">
                            <li>• Understand the core principles and concepts</li>
                            <li>• Learn practical implementation techniques</li>
                            <li>• Apply knowledge through hands-on exercises</li>
                            <li>• Build confidence for real-world application</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Elements */}
                <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Quick Knowledge Check
                  </h4>
                  <p className="text-purple-800 mb-4">Test your understanding of the key concepts:</p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="quiz" className="text-purple-600" />
                      <span className="text-purple-800">I understand the main concepts</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="quiz" className="text-purple-600" />
                      <span className="text-purple-800">I can apply this knowledge practically</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="quiz" className="text-purple-600" />
                      <span className="text-purple-800">I need to review some concepts</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="bg-white border-t shadow-lg p-4 sticky bottom-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                {/* Left - Previous Lesson */}
                <button
                  onClick={navigateToPreviousLesson}
                  disabled={currentModule === 0 && currentLesson === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:block">Previous</span>
                </button>

                {/* Center - Lesson Progress */}
                <div className="flex items-center space-x-4">
                  {!isLessonCompleted(currentModule, currentLesson) && (
                    <button
                      onClick={markLessonComplete}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                  
                  {isLessonCompleted(currentModule, currentLesson) && (
                    <div className="flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Completed</span>
                    </div>
                  )}
                </div>

                {/* Right - Next Lesson */}
                <button
                  onClick={navigateToNextLesson}
                  disabled={
                    currentModule === course.modules.length - 1 && 
                    currentLesson === module?.lessons?.length - 1
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <span className="hidden sm:block">Next Lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <AnimatePresence>
          {showAIAssistant && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-white border-l shadow-sm flex-shrink-0 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-blue-600" />
                    AI Assistant
                  </h2>
                  <button
                    onClick={() => setShowAIAssistant(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* AI Suggestions */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="font-medium text-blue-900 mb-3">Smart Suggestions</h3>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="text-sm text-blue-800 p-2 bg-white rounded border">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Help */}
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <h3 className="font-medium text-yellow-900 mb-3 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Need Help?
                    </h3>
                    <div className="space-y-2">
                      <button className="w-full text-left text-sm text-yellow-800 p-2 bg-white rounded border hover:bg-yellow-50 transition-colors">
                        🤔 I don't understand this concept
                      </button>
                      <button className="w-full text-left text-sm text-yellow-800 p-2 bg-white rounded border hover:bg-yellow-50 transition-colors">
                        💡 Can you explain this differently?
                      </button>
                      <button className="w-full text-left text-sm text-yellow-800 p-2 bg-white rounded border hover:bg-yellow-50 transition-colors">
                        📚 Show me related resources
                      </button>
                    </div>
                  </div>

                  {/* Progress Insights */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <h3 className="font-medium text-green-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Your Progress
                    </h3>
                    <div className="text-sm text-green-800 space-y-2">
                      <div className="flex justify-between">
                        <span>Course Progress:</span>
                        <span className="font-medium">{calculateCourseProgress()}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lessons Completed:</span>
                        <span className="font-medium">{completedLessons.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Module:</span>
                        <span className="font-medium">{currentModule + 1} of {course.modules.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Panel */}
        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ y: 320, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 320, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30"
              style={{ height: '300px' }}
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Lesson Notes
                  </h3>
                  <button
                    onClick={() => setShowNotes(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={lessonNotes}
                  onChange={(e) => setLessonNotes(e.target.value)}
                  placeholder="Take notes about this lesson..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-end mt-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Save Notes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernLessonPage;
