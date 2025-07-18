/**
 * Ultra-Simplified Lesson Loading Component - Final Fix for Infinite Loading
 * Minimal dependencies and simplified logic to prevent loading loops
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle, Clock, SkipForward, SkipBack, BookOpen } from 'lucide-react';

const SimplifiedLessonLoader = ({ 
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Get current lesson and module data safely with defaults
  const modules = course?.modules || [];
  const module = modules[currentModule];
  const lessons = module?.lessons || [];
  const lesson = lessons[currentLesson];

  // Fetch detailed course progress on component mount
  useEffect(() => {
    const fetchCourseProgress = async () => {
      if (!course?._id) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/courses/${course._id}/progress`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const progressData = await response.json();
          console.log('📊 Fetched course progress for SimplifiedLessonLoader:', progressData);
          
          // Extract completed lessons from lesson progress records
          const completed = new Set();
          
          if (progressData.progress?.lessons) {
            progressData.progress.lessons.forEach(lessonRecord => {
              if (lessonRecord.progressType === 'lesson_complete' && 
                  lessonRecord.progressData?.completed) {
                completed.add(lessonRecord.lessonId);
              }
            });
          }
          
          console.log('📋 Completed lessons for SimplifiedLessonLoader:', completed);
          setCompletedLessons(completed);
        }
      } catch (error) {
        console.error('Error fetching course progress in SimplifiedLessonLoader:', error);
      }
    };

    fetchCourseProgress();
  }, [course?._id]);

  // Safe content extraction function
  const getSafeContent = useCallback((lessonData) => {
    try {
      if (!lessonData) return 'Lesson content loading...';
      
      if (typeof lessonData.content === 'string') {
        return lessonData.content;
      }
      
      if (lessonData.content?.data?.text) {
        return lessonData.content.data.text;
      }
      
      if (lessonData.description) {
        return lessonData.description;
      }
      
      return `Welcome to "${lessonData.title || 'this lesson'}"! This lesson will help you learn important concepts.`;
    } catch (error) {
      console.error('Error extracting lesson content:', error);
      return 'Lesson content is being prepared...';
    }
  }, []);

  // Ultra-simple loading effect with immediate resolution and better debugging
  useEffect(() => {
    let mounted = true;
    let timeoutId;
    
    const checkData = () => {
      if (!mounted) return;
      
      console.log('🔍 SimplifiedLessonLoader - Checking course data:', {
        course: !!course,
        courseTitle: course?.title,
        courseObject: course,
        modulesCount: modules.length,
        currentModule: currentModule,
        currentLesson: currentLesson,
        hasModule: !!module,
        moduleTitle: module?.title,
        lessonsCount: lessons.length,
        hasLesson: !!lesson,
        lessonTitle: lesson?.title,
        propsReceived: { course, currentModule, currentLesson }
      });
      
      // First check if we have a course at all
      if (!course) {
        console.log('❌ No course prop received - waiting for course data');
        // Set a timeout to show error if course never arrives
        timeoutId = setTimeout(() => {
          if (mounted && !course) {
            console.log('⏰ Course loading timeout - showing error');
            setError('Course data not available - loading timeout');
            setLoading(false);
          }
        }, 15000); // 15 second timeout
        return;
      }
      
      // Clear timeout if course arrives
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // We have a course, now check structure
      if (modules.length > 0) {
        if (module && lessons.length > 0 && lesson) {
          console.log('✅ All lesson data available, removing loading');
          setLoading(false);
          setError(null);
        } else {
          console.log('❌ Lesson structure incomplete:', {
            hasModule: !!module,
            lessonsCount: lessons.length,
            hasLesson: !!lesson,
            requestedModule: currentModule,
            requestedLesson: currentLesson
          });
          setError(`Lesson ${currentLesson + 1} not found in module ${currentModule + 1}`);
          setLoading(false);
        }
      } else {
        console.log('❌ No modules found in course, showing course overview');
        // For courses without structured modules, show course overview
        setError(null); // Don't show as error, just show course overview
        setLoading(false);
      }
    };

    // Immediate check, no timeout delays
    checkData();
    
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [course, module, lesson, modules.length, lessons.length, currentModule, currentLesson]); // Direct dependencies

  const handleLessonComplete = useCallback(async () => {
    if (!lesson || !course) return;
    
    const lessonId = lesson._id || lesson.id || `${currentModule}-${currentLesson}`;
    setIsMarkingComplete(true);
    
    try {
      console.log('🎯 SimplifiedLessonLoader marking lesson complete:', { 
        lessonId, 
        courseId: course._id,
        moduleIndex: currentModule,
        lessonIndex: currentLesson 
      });
      
      // Try parent handler first if available
      if (onLessonComplete) {
        try {
          await onLessonComplete(lessonId, currentModule, currentLesson);
          console.log('✅ Parent handler completed lesson successfully');
        } catch (parentError) {
          console.warn('⚠️ Parent handler failed, using direct API call:', parentError);
          // Fall back to direct API call
          await directLessonComplete(course._id, lessonId);
        }
      } else {
        // No parent handler, use direct API call
        await directLessonComplete(course._id, lessonId);
      }
      
      // Update local state immediately for UI feedback
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      
      console.log('✅ SimplifiedLessonLoader lesson marked complete');
    } catch (error) {
      console.error('❌ SimplifiedLessonLoader lesson completion failed:', error);
      // You could show an error toast here
    } finally {
      setIsMarkingComplete(false);
    }
  }, [lesson, course, currentModule, currentLesson, onLessonComplete]);

  // Direct API call for lesson completion with proper authentication
  const directLessonComplete = useCallback(async (courseId, lessonId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        moduleIndex: currentModule,
        lessonIndex: currentLesson,
        completed: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lesson completion failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('📡 Direct API lesson completion result:', result);
    return result;
  }, [currentModule, currentLesson]);

  const handleNext = useCallback(() => {
    if (!modules.length) return;
    
    const currentModuleData = modules[currentModule];
    if (!currentModuleData) return;
    
    if (currentLesson < currentModuleData.lessons.length - 1) {
      onNextLesson?.(currentModule, currentLesson + 1);
    } else if (currentModule < modules.length - 1) {
      onNextLesson?.(currentModule + 1, 0);
    }
  }, [modules, currentModule, currentLesson, onNextLesson]);

  const handlePrevious = useCallback(() => {
    if (currentLesson > 0) {
      onPreviousLesson?.(currentModule, currentLesson - 1);
    } else if (currentModule > 0) {
      const prevModule = modules[currentModule - 1];
      if (prevModule && prevModule.lessons) {
        onPreviousLesson?.(currentModule - 1, prevModule.lessons.length - 1);
      }
    }
  }, [currentModule, currentLesson, modules, onPreviousLesson]);

  // Calculate course progress
  const calculateCourseProgress = useCallback(() => {
    if (!course?.modules) return 0;
    
    let totalLessons = 0;
    let completedCount = 0;

    course.modules.forEach(module => {
      if (module.lessons) {
        totalLessons += module.lessons.length;
        module.lessons.forEach(lesson => {
          const lessonId = lesson._id || lesson.id;
          if (lessonId && completedLessons.has(lessonId)) {
            completedCount++;
          }
        });
      }
    });

    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  }, [course, completedLessons]);

  // Check if current lesson is completed
  const isCurrentLessonCompleted = useCallback(() => {
    if (!lesson) return false;
    const lessonId = lesson._id || lesson.id || `${currentModule}-${currentLesson}`;
    return completedLessons.has(lessonId);
  }, [lesson, currentModule, currentLesson, completedLessons]);

  const courseProgress = calculateCourseProgress();
  const currentLessonCompleted = isCurrentLessonCompleted();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
          {!course && (
            <p className="text-xs text-gray-500 mt-2">Waiting for course data...</p>
          )}
        </div>
      </div>
    );
  }

  if (error && course) {
    // Only show error if we have course data but lesson structure is wrong
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // If no course yet, keep loading (don't show error immediately)
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  // If no lesson but we have course data, show course overview
  if (!lesson && course) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
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
                  <h1 className="text-lg font-semibold text-gray-900">
                    {course.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Course Overview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Overview Content */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.estimatedDuration || 60} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.difficulty || 'Beginner'}</span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Course Description</h3>
                <p className="text-blue-800">
                  {course.description || 'This course will provide you with valuable knowledge and skills.'}
                </p>
              </div>

              {course.objectives && course.objectives.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">Learning Objectives</h3>
                  <ul className="text-green-800 space-y-1">
                    {course.objectives.map((objective, index) => (
                      <li key={index}>• {objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">Course Status</h3>
                <p className="text-yellow-800">
                  This course is currently being developed. Structured lessons will be available soon.
                  In the meantime, you can review the course materials and objectives above.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center pt-6 border-t">
              <button 
                onClick={onBack}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Course Overview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
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
                <h1 className="text-lg font-semibold text-gray-900">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Module {currentModule + 1} • Lesson {currentLesson + 1}
                </p>
              </div>
            </div>
            
            {/* Course Progress Display */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Course Progress: {courseProgress}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
              {currentLessonCompleted && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Lesson Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.estimatedDuration || 15} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{lesson.difficulty || 'Intermediate'}</span>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="prose max-w-none mb-8">
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Learning Objectives</h3>
              <ul className="text-blue-800 space-y-1">
                {Array.isArray(lesson.objectives) && lesson.objectives.length > 0 
                  ? lesson.objectives.map((objective, index) => (
                      <li key={index}>• {typeof objective === 'string' ? objective : 'Learn key concepts'}</li>
                    ))
                  : <li>• Complete this lesson successfully</li>
                }
              </ul>
            </div>

            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">
                {getSafeContent(lesson)}
              </p>
              
              {/* Content type indicator */}
              {lesson?.content?.type && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-medium capitalize">
                      {lesson.content.type} Content
                    </span>
                    {lesson.content.duration && (
                      <span className="text-blue-600 text-sm">
                        • {lesson.content.duration} min
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <p className="mb-4">
                You are currently viewing lesson {currentLesson + 1} of {lessons.length} in module "{module?.title || 'Unknown Module'}".
              </p>
              
              {Array.isArray(lesson?.keyPoints) && lesson.keyPoints.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Key Points:</h4>
                  <ul className="text-yellow-800 space-y-1">
                    {lesson.keyPoints.map((point, index) => (
                      <li key={index}>• {typeof point === 'string' ? point : 'Key learning point'}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Controls */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentModule === 0 && currentLesson === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleLessonComplete}
              disabled={isMarkingComplete}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                currentLessonCompleted 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${isMarkingComplete ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isMarkingComplete 
                  ? 'Marking Complete...' 
                  : currentLessonCompleted 
                    ? 'Completed ✓' 
                    : 'Mark Complete'
                }
              </span>
            </button>

            <button
              onClick={handleNext}
              disabled={
                currentModule === modules.length - 1 && 
                currentLesson === lessons.length - 1
              }
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedLessonLoader;
