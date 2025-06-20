/**
 * Course Learning Environment
 * Interactive learning environment for students to engage with course content
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  BookOpen, 
  CheckCircle, 
  Clock, 
  Target, 
  Users, 
  Star,
  Play,
  Pause,
  SkipForward, 
  SkipBack,
  Menu,
  X,
  Brain,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const CourseLearningEnvironment = ({ course, userProgress, onBack }) => {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [lessonProgress, setLessonProgress] = useState({});

  // AI Assistant integration state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [currentAIHelp, setCurrentAIHelp] = useState(null);

  useEffect(() => {
    // Initialize progress based on userProgress
    if (userProgress && userProgress.progressData) {
      const completed = new Set(userProgress.progressData.completedLessons || []);
      setCompletedLessons(completed);
      setLessonProgress(userProgress.progressData.lessonProgress || {});
    }
  }, [userProgress]);

  // Load AI suggestions based on current lesson
  useEffect(() => {
    const loadAISuggestions = () => {
      const lesson = getCurrentLesson();
      if (lesson) {
        // Generate contextual AI suggestions
        const suggestions = [
          {
            type: 'study_tip',
            title: 'Study Tip',
            content: `For mastering "${lesson.title}", try the spaced repetition technique. Review this material again in 1 day, then 3 days, then 1 week.`,
            icon: '💡'
          },
          {
            type: 'practice',
            title: 'Practice Suggestion',
            content: 'Based on your progress, you might benefit from additional practice exercises related to this topic.',
            icon: '🎯'
          },
          {
            type: 'connection',
            title: 'Learning Connection',
            content: `This lesson connects well with concepts from earlier modules. Consider reviewing Module ${Math.max(1, currentModule)} for better understanding.`,
            icon: '🔗'
          }
        ];
        setAiSuggestions(suggestions);
      }
    };

    loadAISuggestions();
  }, [currentModule, currentLesson]);

  const getCurrentModule = () => {
    return course?.modules?.[currentModule];
  };

  const getCurrentLesson = () => {
    const module = getCurrentModule();
    return module?.lessons?.[currentLesson];
  };

  const navigateToLesson = (moduleIndex, lessonIndex) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(lessonIndex);
    setIsPlaying(false);
  };

  const nextLesson = () => {
    const currentModuleData = getCurrentModule();
    if (!currentModuleData) return;

    if (currentLesson < currentModuleData.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else if (currentModule < course.modules.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentLesson(0);
    }
  };

  const previousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    } else if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      const prevModule = course.modules[currentModule - 1];
      setCurrentLesson(prevModule.lessons.length - 1);
    }
  };

  const markLessonComplete = async () => {
    const lesson = getCurrentLesson();
    if (!lesson) return;

    const lessonId = lesson._id || `${currentModule}-${currentLesson}`;
    const newCompleted = new Set([...completedLessons, lessonId]);
    setCompletedLessons(newCompleted);

    // Update lesson progress
    const newProgress = {
      ...lessonProgress,
      [lessonId]: {
        completed: true,
        completedAt: new Date().toISOString(),
        timeSpent: lessonProgress[lessonId]?.timeSpent || 0
      }
    };
    setLessonProgress(newProgress);

    // TODO: Send progress update to backend
    try {
      await fetch(`/api/courses/${course._id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lessonId,
          completed: true,
          moduleIndex: currentModule,
          lessonIndex: currentLesson
        })
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const calculateOverallProgress = () => {
    if (!course?.modules) return 0;
    
    let totalLessons = 0;
    let completedCount = 0;

    course.modules.forEach(module => {
      if (module.lessons) {
        totalLessons += module.lessons.length;
        module.lessons.forEach(lesson => {
          const lessonId = lesson._id || `${course.modules.indexOf(module)}-${module.lessons.indexOf(lesson)}`;
          if (completedLessons.has(lessonId)) {
            completedCount++;
          }
        });
      }
    });

    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const lesson = getCurrentLesson();
  const module = getCurrentModule();
  const overallProgress = calculateOverallProgress();

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900">{course.title}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* AI Assistant Toggle */}
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                  showAIAssistant 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">AI Assistant</span>
              </button>
              
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{overallProgress}% Complete</span>
              </div>
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Sidebar - Course Navigation */}
          <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}>
            <div className="p-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h2>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-4 mb-2">
                    <span>{course.modules?.length || 0} modules</span>
                    <span>{course.estimatedDuration}h total</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{course.rating || 4.5}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {course.modules?.map((moduleData, moduleIndex) => (
                  <div key={moduleIndex} className="border border-gray-200 rounded-lg">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 text-sm">
                        Module {moduleIndex + 1}: {moduleData.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {moduleData.lessons?.length || 0} lessons • {formatDuration(moduleData.estimatedDuration || 0)}
                      </p>
                    </div>

                    {moduleData.lessons?.map((lessonData, lessonIndex) => {
                      const lessonId = lessonData._id || `${moduleIndex}-${lessonIndex}`;
                      const isCompleted = completedLessons.has(lessonId);
                      const isCurrent = moduleIndex === currentModule && lessonIndex === currentLesson;
                      
                      return (
                        <div
                          key={lessonIndex}
                          onClick={() => navigateToLesson(moduleIndex, lessonIndex)}
                          className={`p-3 border-t border-gray-100 cursor-pointer flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-blue-100 border-blue-200'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="mr-3">
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
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
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-screen">
            {lesson ? (
              <div className="bg-white">
                {/* Lesson Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
                      <p className="text-gray-600 mt-1">
                        Module {currentModule + 1} • Lesson {currentLesson + 1} of {module?.lessons?.length || 0}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={previousLesson}
                        disabled={currentModule === 0 && currentLesson === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={nextLesson}
                        disabled={
                          currentModule === course.modules.length - 1 && 
                          currentLesson === module?.lessons?.length - 1
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(lesson.estimatedDuration || 15)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{lesson.difficulty || 'Intermediate'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>Interactive</span>
                    </div>
                  </div>
                </div>                {/* Lesson Content - Add bottom padding for sticky buttons */}
                <div className="p-6 pb-24">
                  <div className="max-w-4xl mx-auto">
                    {/* Learning Objectives */}
                    {lesson.objectives && lesson.objectives.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Learning Objectives</h3>
                        <ul className="space-y-2">
                          {lesson.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <Target className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                              <span className="text-blue-800">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Lesson Content */}
                    <div className="prose max-w-none mb-8">
                      {lesson.content?.blocks?.length > 0 ? (
                        <div className="space-y-6">
                          {lesson.content.blocks.map((block, index) => (
                            <div key={index}>
                              {block.type === 'paragraph' && (
                                <p className="text-gray-700 leading-relaxed">{block.content}</p>
                              )}
                              {block.type === 'heading' && (
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">{block.content}</h3>
                              )}
                              {block.type === 'list' && (
                                <ul className="list-disc list-inside space-y-2">
                                  {block.items?.map((item, itemIndex) => (
                                    <li key={itemIndex} className="text-gray-700">{item}</li>
                                  ))}
                                </ul>
                              )}
                              {block.type === 'code' && (
                                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                                  <code>{block.content}</code>
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Lesson Content</h3>
                          <p className="text-gray-600 mb-6">
                            This lesson covers important concepts related to {lesson.title}.
                          </p>
                          <div className="bg-gray-50 p-6 rounded-lg text-left max-w-2xl mx-auto">
                            <h4 className="font-medium mb-3">What you'll learn:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              <li>Core concepts and terminology</li>
                              <li>Practical applications and examples</li>
                              <li>Best practices and tips</li>
                              <li>Hands-on exercises to reinforce learning</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>                    {/* Lesson Actions - Fixed positioning */}
                    <div className="border-t border-gray-200 pt-6 mt-6 bg-white sticky bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200 shadow-lg z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-600">
                            Estimated time: {formatDuration(lesson.estimatedDuration || 15)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Progress: {Math.round((currentLesson + 1) / (getCurrentModule()?.lessons?.length || 1) * 100)}%
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {!completedLessons.has(lesson._id || `${currentModule}-${currentLesson}`) && (
                            <button
                              onClick={markLessonComplete}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Complete
                            </button>
                          )}

                          <button
                            onClick={nextLesson}
                            disabled={
                              currentModule === course.modules.length - 1 && 
                              currentLesson === getCurrentModule()?.lessons?.length - 1
                            }
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            Next Lesson
                            <SkipForward className="w-4 h-4 ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* AI Assistant - Suggestions */}
                    {showAIAssistant && aiSuggestions.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant Suggestions</h3>
                        <div className="space-y-4">
                          {aiSuggestions.map((suggestion, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center mb-2">
                                <span className="text-xl mr-2">{suggestion.icon}</span>
                                <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                              </div>
                              <p className="text-gray-700">{suggestion.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to {course.title}</h3>
                  <p className="text-gray-600 mb-6">Select a lesson from the sidebar to begin your learning journey.</p>
                </div>
              </div>            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Floating Panel */}
      {showAIAssistant && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-4 top-20 bottom-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col"
        >
          {/* AI Panel Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">AI Learning Assistant</h3>
              </div>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Get personalized help with your learning</p>
          </div>

          {/* AI Panel Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Current Lesson Context */}
            {lesson && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Current Lesson</h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">{lesson.title}</p>
                  <p className="text-xs text-blue-700 mt-1">{module?.title}</p>
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">AI Suggestions</h4>
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">{suggestion.icon}</span>
                    <h5 className="text-sm font-medium text-gray-900">{suggestion.title}</h5>
                  </div>
                  <p className="text-xs text-gray-700">{suggestion.content}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  💡 Explain this concept
                </button>
                <button className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  🎯 Get practice exercises
                </button>
                <button className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  📚 Related resources
                </button>
                <button className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  ❓ Ask a question
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CourseLearningEnvironment;
