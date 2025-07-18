/**
 * Modern Lesson Completion Page - Complete Redesign
 * Next-gen learning experience with modern UI patterns, accessibility, and mobile-first design
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  FastForward,
  Rewind,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Zap,
  Award,
  Users,
  Star,
  RefreshCw,
  FileText,
  Video,
  Headphones,
  Code,
  Image,
  PenTool,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../../contexts/DataSyncProvider';

const ModernLessonCompletion = ({ 
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
  // UI State
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Lesson State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  
  // Interactive Features
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [lessonNotes, setLessonNotes] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Advanced Features
  const [focusMode, setFocusMode] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [autoNext, setAutoNext] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [studyStreak, setStudyStreak] = useState(7);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Refs
  const playerRef = useRef(null);
  const notesRef = useRef(null);
  const contentRef = useRef(null);
  
  // Use DataSync for progress updates
  const { updateLessonProgress } = useDataSync();

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

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Auto-generate AI suggestions based on lesson content
  useEffect(() => {
    if (lesson) {
      const suggestions = generateAISuggestions(lesson);
      setAiSuggestions(suggestions);
    }
  }, [lesson]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateToPreviousLesson();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToNextLesson();
          break;
        case 'n':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowNotes(!showNotes);
          }
          break;
        case 't':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowTranscript(!showTranscript);
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false);
          if (showAIAssistant) setShowAIAssistant(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, showNotes, showTranscript, isFullscreen, showAIAssistant]);

  const generateAISuggestions = (lesson) => {
    const suggestions = [
      {
        type: 'tip',
        icon: <Lightbulb className="w-4 h-4" />,
        text: "💡 Try the practice exercises to reinforce key concepts",
        action: () => scrollToSection('exercises')
      },
      {
        type: 'review',
        icon: <RefreshCw className="w-4 h-4" />,
        text: "🔄 Review the previous lesson if you need more context",
        action: () => navigateToPreviousLesson()
      },
      {
        type: 'focus',
        icon: <Target className="w-4 h-4" />,
        text: "🎯 Focus on the learning objectives highlighted above",
        action: () => scrollToSection('objectives')
      },
      {
        type: 'notes',
        icon: <PenTool className="w-4 h-4" />,
        text: "📝 Take notes to improve retention and understanding",
        action: () => setShowNotes(true)
      }
    ];
    
    return suggestions.slice(0, 2);
  };

  const isLessonCompleted = useCallback((moduleIdx, lessonIdx) => {
    const lessonId = course?.modules?.[moduleIdx]?.lessons?.[lessonIdx]?._id;
    return lessonId && completedLessons.has(lessonId);
  }, [completedLessons, course]);

  const markLessonComplete = async () => {
    if (!lesson) return;
    
    const lessonId = lesson._id || `${currentModule}-${currentLesson}`;
    const newCompleted = new Set([...completedLessons, lessonId]);
    setCompletedLessons(newCompleted);
    
    // Play completion animation/sound
    playCompletionFeedback();
    
    if (onLessonComplete) {
      await onLessonComplete(lessonId, currentModule, currentLesson);
    }

    // Auto-advance if enabled
    if (autoNext) {
      setTimeout(() => navigateToNextLesson(), 2000);
    }
  };

  const playCompletionFeedback = () => {
    // Create celebration animation
    const celebration = document.createElement('div');
    celebration.className = 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center';
    celebration.innerHTML = `
      <div class="text-6xl animate-bounce">🎉</div>
    `;
    document.body.appendChild(celebration);
    
    setTimeout(() => {
      document.body.removeChild(celebration);
    }, 2000);
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

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const getLessonTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'interactive': return <Activity className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading your lesson...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Preparing an amazing learning experience</p>
        </div>
      </div>
    );
  }

  const currentLessonCompleted = isLessonCompleted(currentModule, currentLesson);
  const canGoNext = currentModule < course.modules.length - 1 || currentLesson < module.lessons.length - 1;
  const canGoPrev = currentModule > 0 || currentLesson > 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    } ${focusMode ? 'focus-mode' : ''}`}>
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded-lg transition-colors lg:hidden ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold truncate max-w-md">
                  {course.title}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Module {currentModule + 1} • Lesson {currentLesson + 1} of {module?.lessons?.length || 0}
                </p>
              </div>
            </div>

            {/* Center - Progress Bar */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Course Progress</span>
                  <span>{calculateCourseProgress()}%</span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateCourseProgress()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{studyStreak}</span>
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(sessionTime)}</span>
              </div>

              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {!focusMode && (
                <button
                  onClick={toggleFullscreen}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Dropdown */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full right-4 mt-1 w-64 rounded-xl shadow-lg border z-50 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Quick Settings</span>
                  <button
                    onClick={() => setShowQuickActions(false)}
                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Auto-advance lessons</span>
                    <input
                      type="checkbox"
                      checked={autoNext}
                      onChange={(e) => setAutoNext(e.target.checked)}
                      className="toggle"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Focus mode</span>
                    <input
                      type="checkbox"
                      checked={focusMode}
                      onChange={(e) => setFocusMode(e.target.checked)}
                      className="toggle"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Show progress indicators</span>
                    <input
                      type="checkbox"
                      checked={showProgress}
                      onChange={(e) => setShowProgress(e.target.checked)}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && !focusMode && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`w-80 border-r flex-shrink-0 overflow-hidden ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="h-full flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Course Content</h2>
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className={`p-1 rounded transition-colors ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      {sidebarCollapsed ? <ChevronDown /> : <ChevronUp />}
                    </button>
                  </div>
                  
                  {!sidebarCollapsed && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Overall Progress</span>
                        <span className="font-medium">{calculateCourseProgress()}%</span>
                      </div>
                      <div className={`w-full rounded-full h-1.5 ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <motion.div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateCourseProgress()}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Module List */}
                <div className="flex-1 overflow-y-auto">
                  {!sidebarCollapsed && course.modules?.map((moduleData, moduleIndex) => {
                    const moduleProgress = getModuleProgress(moduleIndex);
                    const isCurrentModule = moduleIndex === currentModule;
                    
                    return (
                      <div key={moduleIndex} className="border-b border-gray-100 dark:border-gray-700">
                        <div className={`p-4 ${
                          isCurrentModule ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-sm">
                              Module {moduleIndex + 1}: {moduleData.title}
                            </h3>
                            <span className="text-xs font-medium text-blue-600">
                              {moduleProgress}%
                            </span>
                          </div>
                          
                          <div className={`w-full rounded-full h-1 mb-3 ${
                            darkMode ? 'bg-gray-600' : 'bg-gray-200'
                          }`}>
                            <motion.div 
                              className="bg-blue-500 h-1 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${moduleProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>

                          <div className="space-y-1">
                            {moduleData.lessons?.map((lessonData, lessonIndex) => {
                              const isCompleted = isLessonCompleted(moduleIndex, lessonIndex);
                              const isCurrent = moduleIndex === currentModule && lessonIndex === currentLesson;
                              
                              return (
                                <button
                                  key={lessonIndex}
                                  onClick={() => onNavigateToLesson?.(moduleIndex, lessonIndex)}
                                  className={`w-full p-2 rounded-lg text-left transition-colors flex items-center space-x-3 ${
                                    isCurrent 
                                      ? (darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-900')
                                      : (darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50')
                                  }`}
                                >
                                  <div className="flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <div className={`w-4 h-4 rounded-full border-2 ${
                                        isCurrent ? 'border-blue-500' : 'border-gray-300'
                                      }`} />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      {getLessonTypeIcon(lessonData.type)}
                                      <p className="text-xs font-medium truncate">
                                        {lessonData.title}
                                      </p>
                                    </div>
                                    <p className="text-xs opacity-60">
                                      {formatDuration(lessonData.estimatedDuration || 15)}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Lesson Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`border-b px-6 py-4 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold">{lesson.title}</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Module {currentModule + 1} • Lesson {currentLesson + 1} of {module?.lessons?.length || 0}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                  lesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {lesson.difficulty || 'Intermediate'}
                </div>
                
                <div className="flex items-center space-x-1 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(lesson.estimatedDuration || 15)}</span>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            {lesson.objectives && lesson.objectives.length > 0 && (
              <div id="objectives" className={`rounded-lg p-4 ${
                darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              } border`}>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Learning Objectives
                </h3>
                <ul className="space-y-1">
                  {lesson.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                      <span className="text-blue-800 dark:text-blue-200">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Lesson Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 pb-32" ref={contentRef}>
              {/* Content blocks would go here */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="prose dark:prose-invert max-w-none"
              >
                {/* Lesson content rendering logic */}
                <div className={`rounded-lg p-6 mb-8 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-sm border border-gray-200 dark:border-gray-700`}>
                  <h2>Welcome to this lesson!</h2>
                  <p>This is where the actual lesson content would be rendered based on the lesson data structure.</p>
                  <p>The content could include text, images, videos, interactive elements, and more.</p>
                  
                  {/* Placeholder for different content types */}
                  {lesson.type === 'video' && (
                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
                      <div className="text-center">
                        <Play className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">Video content would be rendered here</p>
                      </div>
                    </div>
                  )}
                  
                  {lesson.type === 'interactive' && (
                    <div id="exercises" className={`p-6 rounded-lg border-2 border-dashed mb-6 ${
                      darkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Interactive Exercise
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Interactive content and exercises would be rendered here
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* AI Assistant Panel */}
          <AnimatePresence>
            {showAIAssistant && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className={`fixed right-0 top-16 bottom-16 w-80 border-l z-40 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-600" />
                        AI Assistant
                      </h3>
                      <button
                        onClick={() => setShowAIAssistant(false)}
                        className={`p-1 rounded transition-colors ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={suggestion.action}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="text-purple-600 mt-0.5">
                              {suggestion.icon}
                            </div>
                            <p className="text-sm">{suggestion.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className={`p-3 rounded-lg ${
                      darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
                    } border`}>
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                        Study Tips
                      </h4>
                      <ul className="text-sm space-y-1 text-purple-700 dark:text-purple-300">
                        <li>• Take breaks every 25 minutes</li>
                        <li>• Review material within 24 hours</li>
                        <li>• Practice active recall techniques</li>
                      </ul>
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
                initial={{ y: 400, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 400, opacity: 0 }}
                className={`fixed bottom-16 left-0 right-0 h-64 border-t z-40 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center">
                        <PenTool className="w-5 h-5 mr-2 text-green-600" />
                        Lesson Notes
                      </h3>
                      <button
                        onClick={() => setShowNotes(false)}
                        className={`p-1 rounded transition-colors ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-4">
                    <textarea
                      ref={notesRef}
                      value={lessonNotes}
                      onChange={(e) => setLessonNotes(e.target.value)}
                      placeholder="Take notes about this lesson..."
                      className={`w-full h-full resize-none border rounded-lg p-3 text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-xl z-50 ${
          darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Navigation */}
            <div className="flex items-center space-x-3">
              <button
                onClick={navigateToPreviousLesson}
                disabled={!canGoPrev}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode ? 'hover:bg-gray-800 disabled:hover:bg-transparent' : 'hover:bg-gray-100 disabled:hover:bg-transparent'
                }`}
              >
                <SkipBack className="w-4 h-4 mr-2" />
                Previous
              </button>

              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span>Lesson Progress:</span>
                <div className={`w-24 h-2 rounded-full ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <motion.div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${lessonProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span>{lessonProgress}%</span>
              </div>
            </div>

            {/* Center - Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showAIAssistant 
                    ? 'bg-purple-600 text-white' 
                    : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
                }`}
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Help
              </button>

              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showNotes 
                    ? 'bg-green-600 text-white' 
                    : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
                }`}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Notes
              </button>

              {!currentLessonCompleted && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markLessonComplete}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </motion.button>
              )}
            </div>

            {/* Right side - Next Navigation */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-sm text-center">
                <div className="text-xs opacity-60">Study Streak</div>
                <div className="font-bold text-yellow-600 flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  {studyStreak} days
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={navigateToNextLesson}
                disabled={!canGoNext}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  canGoNext 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                    : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
                }`}
              >
                {canGoNext ? 'Next Lesson' : 'Course Complete'}
                <SkipForward className="w-4 h-4 ml-2" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {focusMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setFocusMode(false)} />
      )}
    </div>
  );
};

export default ModernLessonCompletion;
