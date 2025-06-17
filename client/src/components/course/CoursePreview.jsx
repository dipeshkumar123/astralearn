/**
 * Course Preview Component - Phase 3 Step 1
 * Interactive preview of course content for testing and review
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Target, 
  Users, 
  Star,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  X
} from 'lucide-react';

const CoursePreview = ({ 
  course, 
  onClose, 
  isVisible = true,
  mode = 'student' // 'student' or 'instructor'
}) => {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simulatedUser, setSimulatedUser] = useState({
    name: 'Preview User',
    learningStyle: 'visual',
    progress: 0
  });

  useEffect(() => {
    if (course && course.modules?.length > 0) {
      // Initialize progress tracking
      const initialProgress = {};
      course.modules.forEach((module, moduleIndex) => {
        initialProgress[moduleIndex] = {};
        module.lessons?.forEach((lesson, lessonIndex) => {
          initialProgress[moduleIndex][lessonIndex] = {
            completed: false,
            timeSpent: 0,
            score: null
          };
        });
      });
      setProgress(initialProgress);
    }
  }, [course]);

  const getCurrentLesson = () => {
    if (!course?.modules?.[currentModule]?.lessons?.[currentLesson]) {
      return null;
    }
    return course.modules[currentModule].lessons[currentLesson];
  };

  const getCurrentModule = () => {
    if (!course?.modules?.[currentModule]) {
      return null;
    }
    return course.modules[currentModule];
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

  const markLessonComplete = () => {
    const newProgress = { ...progress };
    if (!newProgress[currentModule]) newProgress[currentModule] = {};
    
    newProgress[currentModule][currentLesson] = {
      ...newProgress[currentModule][currentLesson],
      completed: true,
      timeSpent: (newProgress[currentModule][currentLesson]?.timeSpent || 0) + 300, // Add 5 minutes
      score: Math.floor(Math.random() * 30) + 70 // Random score 70-100
    };
    
    setProgress(newProgress);
  };
  const calculateOverallProgress = () => {
    if (!course || !course.modules || !Array.isArray(course.modules)) {
      return 0;
    }

    let totalLessons = 0;
    let completedLessons = 0;

    course.modules.forEach((module, moduleIndex) => {
      if (module && module.lessons && Array.isArray(module.lessons)) {
        module.lessons.forEach((lesson, lessonIndex) => {
          totalLessons++;
          if (progress[moduleIndex]?.[lessonIndex]?.completed) {
            completedLessons++;
          }
        });
      }
    });

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!isVisible || !course) return null;

  const lesson = getCurrentLesson();
  const module = getCurrentModule();

  return (
    <div className={`fixed inset-0 bg-white z-50 ${isFullscreen ? '' : 'p-4'}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Eye className="w-4 h-4 mr-1" />
                Preview Mode - {mode === 'instructor' ? 'Instructor View' : 'Student Experience'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Progress */}
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateOverallProgress()}%` }}
                />
              </div>
              {calculateOverallProgress()}% Complete
            </div>

            {/* Controls */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              {showSidebar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            {/* Course Info */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  {course.difficulty || 'Beginner'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDuration(course.estimatedDuration || 0)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {course.modules?.length || 0} modules
                </div>
              </div>
            </div>

            {/* Module List */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Course Content</h3>
              <div className="space-y-2">
                {course.modules?.map((moduleData, moduleIndex) => (
                  <div key={moduleIndex} className="border border-gray-200 rounded-lg">
                    <div className={`p-3 cursor-pointer ${
                      moduleIndex === currentModule ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Module {moduleIndex + 1}: {moduleData.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {moduleData.lessons?.length || 0} lessons • {formatDuration(moduleData.estimatedDuration || 0)}
                      </p>
                    </div>

                    {/* Lessons */}
                    {moduleData.lessons?.map((lessonData, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        onClick={() => navigateToLesson(moduleIndex, lessonIndex)}
                        className={`p-3 border-t border-gray-100 cursor-pointer flex items-center justify-between ${
                          moduleIndex === currentModule && lessonIndex === currentLesson
                            ? 'bg-blue-100 border-blue-200'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="mr-3">
                            {progress[moduleIndex]?.[lessonIndex]?.completed ? (
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
                              {formatDuration(lessonData.estimatedDuration || 0)}
                            </p>
                          </div>
                        </div>

                        {progress[moduleIndex]?.[lessonIndex]?.score && (
                          <div className="text-xs text-gray-600">
                            {progress[moduleIndex][lessonIndex].score}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Lesson Header */}
          {lesson && (
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{lesson.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Module {currentModule + 1} • Lesson {currentLesson + 1} of {module?.lessons?.length || 0}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
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
            </div>
          )}

          {/* Lesson Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {lesson ? (
              <div className="max-w-4xl mx-auto">
                {/* Lesson Content Preview */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="prose max-w-none">
                    {lesson.content?.blocks?.length > 0 ? (
                      <div className="space-y-4">
                        {lesson.content.blocks.map((block, index) => (
                          <div key={index} className="border border-gray-200 rounded p-4">
                            <div className="text-xs text-gray-500 mb-2">
                              {block.type.toUpperCase()} Block
                            </div>
                            {block.type === 'text' && (
                              <div dangerouslySetInnerHTML={{ __html: block.content || 'Sample text content...' }} />
                            )}
                            {block.type === 'image' && (
                              <div className="bg-gray-100 rounded p-8 text-center text-gray-500">
                                📷 Image: {block.content?.alt || 'Sample image'}
                              </div>
                            )}
                            {block.type === 'video' && (
                              <div className="bg-gray-900 rounded p-8 text-center text-white">
                                ▶️ Video: {block.content?.title || 'Sample video'}
                              </div>
                            )}
                            {block.type === 'code' && (
                              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                                <code>{block.content || '// Sample code here\nconsole.log("Hello, World!");'}</code>
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">Sample Lesson Content</h3>
                        <p className="mb-4">This is a preview of how lesson content will appear to students.</p>
                        <div className="bg-gray-50 p-6 rounded-lg text-left">
                          <h4 className="font-medium mb-3">Learning Objectives:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {lesson.objectives?.map((objective, index) => (
                              <li key={index}>{objective}</li>
                            )) || [
                              'Understand the key concepts',
                              'Apply practical skills',
                              'Complete hands-on exercises'
                            ]}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lesson Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Estimated time: {formatDuration(lesson.estimatedDuration || 15)}
                      </div>

                      <div className="flex items-center space-x-3">
                        {!progress[currentModule]?.[currentLesson]?.completed && (
                          <button
                            onClick={markLessonComplete}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </button>
                        )}

                        <button
                          onClick={nextLesson}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Next Lesson
                          <SkipForward className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Quiz/Assessment */}
                {Math.random() > 0.7 && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-3">Quick Knowledge Check</h4>
                    <div className="space-y-3">
                      <p className="text-blue-800">What did you learn in this lesson?</p>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="radio" name="quiz" className="mr-2" />
                          <span className="text-blue-800">Option A</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="quiz" className="mr-2" />
                          <span className="text-blue-800">Option B</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="quiz" className="mr-2" />
                          <span className="text-blue-800">Option C</span>
                        </label>
                      </div>                      <button 
                        onClick={() => {
                          // Get selected answer
                          const selectedRadio = document.querySelector('input[name="quiz"]:checked');
                          if (selectedRadio) {
                            // Mock quiz submission logic
                            const answer = selectedRadio.nextSibling.textContent;
                            console.log('Submitted answer:', answer);
                            alert(`Answer submitted: ${answer}`);
                            // Here you would normally send to backend
                          } else {
                            alert('Please select an answer first');
                          }
                        }}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Submit Answer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Content Selected</h3>
                <p>Select a lesson from the sidebar to preview its content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
