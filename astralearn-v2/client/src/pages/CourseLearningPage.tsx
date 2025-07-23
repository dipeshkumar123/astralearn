import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  BarChart3,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LessonViewer } from '@/components/LessonViewer';
import { apiService } from '@/utils/api';

interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'interactive' | 'assessment';
  duration: number;
  orderIndex: number;
  isPublished: boolean;
}

interface Progress {
  courseId: string;
  userId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons: Array<{
    lessonId: string;
    completed: boolean;
    timeSpent: number;
    score?: number;
  }>;
}

export const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}`),
  });

  // Fetch modules
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}/modules`),
    enabled: !!courseId,
  });

  // Fetch progress
  const { data: progressData, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}/progress`),
    enabled: !!courseId,
    retry: false, // Don't retry if user is not enrolled
  });

  // Auto-enroll mutation
  const autoEnrollMutation = useMutation({
    mutationFn: () => apiService.post(`/courses/${courseId}/enroll`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
    },
  });

  // Fetch lessons for all modules
  const { data: allLessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['all-lessons', courseId],
    queryFn: async () => {
      if (!modulesData?.data) return [];
      
      const lessonsPromises = modulesData.data.map((module: Module) =>
        apiService.get(`/modules/${module.id}/lessons`)
      );
      
      const lessonsResponses = await Promise.all(lessonsPromises);
      return lessonsResponses.flatMap(response => response.data);
    },
    enabled: !!modulesData?.data,
  });

  // Update lesson progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: any }) =>
      apiService.post(`/lessons/${lessonId}/progress`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
    },
  });

  const modules: Module[] = modulesData?.data || [];
  const lessons: Lesson[] = allLessonsData || [];
  const progress: Progress = progressData?.data || null;
  const isNotEnrolled = progressError?.response?.status === 403;

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.lessons.find(l => l.lessonId === lessonId)?.completed || false;
  };

  const handleLessonComplete = (lessonId: string) => {
    updateProgressMutation.mutate({
      lessonId,
      data: { completed: true, timeSpent: 0 }
    });
  };

  if (courseLoading || modulesLoading || (progressLoading && !isNotEnrolled)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show enrollment prompt if user is not enrolled
  if (isNotEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link to="/courses" className="mr-4">
                  <Button variant="ghost" size="sm" leftIcon={<ArrowLeft />}>
                    Back to Courses
                  </Button>
                </Link>
                <BookOpen className="h-8 w-8 text-primary-600" />
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {course?.data.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {course?.data.category} • {course?.data.difficulty}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enroll to Start Learning
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You need to enroll in this course to access the learning materials and track your progress.
            </p>
            <Button
              size="lg"
              onClick={() => autoEnrollMutation.mutate()}
              disabled={autoEnrollMutation.isPending}
              leftIcon={<Play />}
            >
              {autoEnrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/courses" className="mr-4">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft />}>
                  Back to Courses
                </Button>
              </Link>
              <BookOpen className="h-8 w-8 text-primary-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {course?.data.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {course?.data.category} • {course?.data.difficulty}
                </p>
              </div>
            </div>
            
            {progress && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {progress.completedLessons} of {progress.totalLessons} lessons
                  </p>
                  <p className="text-xs text-gray-600">
                    {progress.progressPercentage}% complete
                  </p>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Course Content
              </h2>
              
              <div className="space-y-2">
                {modules.map((module) => {
                  const moduleLessons = lessons.filter(l => l.moduleId === module.id);
                  const isExpanded = expandedModules.has(module.id);
                  
                  return (
                    <div key={module.id} className="border rounded-lg">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                          )}
                          <span className="font-medium text-gray-900">
                            {module.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {moduleLessons.length} lessons
                        </span>
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t bg-gray-50">
                          {moduleLessons.map((lesson) => {
                            const completed = isLessonCompleted(lesson.id);
                            const isSelected = selectedLesson === lesson.id;
                            
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson(lesson.id)}
                                className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 ${
                                  isSelected ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                                }`}
                              >
                                <div className="flex items-center">
                                  {completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  ) : (
                                    <Play className="h-4 w-4 text-gray-400 mr-2" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {lesson.duration} min
                                      <span className="ml-2 px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                                        {lesson.type}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <LessonViewer 
                lessonId={selectedLesson} 
                onComplete={() => handleLessonComplete(selectedLesson)}
                isCompleted={isLessonCompleted(selectedLesson)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a lesson to start learning
                </h3>
                <p className="text-gray-600">
                  Choose a lesson from the course content sidebar to begin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


