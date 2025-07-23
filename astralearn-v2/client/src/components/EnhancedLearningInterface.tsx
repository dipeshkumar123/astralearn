import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  BarChart3,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  Users,
  MessageCircle,
  Bookmark,
  Share2,
  Settings,
  Download,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LessonViewer } from '@/components/LessonViewer';
import { apiService } from '@/utils/api';

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  isCompleted: boolean;
  completedLessons: number;
  totalLessons: number;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'assessment';
  duration: number;
  order: number;
  isCompleted: boolean;
  isLocked: boolean;
  content?: any[];
}

interface CourseProgress {
  courseId: string;
  userId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  timeSpent: number;
  lastAccessedLesson?: string;
  estimatedTimeToComplete: number;
}

export const EnhancedLearningInterface: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showNotes, setShowNotes] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

  // Fetch course data
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}`),
  });

  // Fetch course modules with lessons
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}/modules`),
  });

  // Fetch course progress
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => apiService.get(`/courses/${courseId}/progress`),
  });

  const course = courseData?.data;
  const modules: Module[] = modulesData?.data || [];
  const progress: CourseProgress = progressData?.data;

  // Auto-select first incomplete lesson
  useEffect(() => {
    if (modules.length > 0 && !selectedLessonId) {
      for (const module of modules) {
        const incompleteLesson = module.lessons.find(lesson => !lesson.isCompleted && !lesson.isLocked);
        if (incompleteLesson) {
          setSelectedLessonId(incompleteLesson.id);
          setExpandedModules(prev => new Set([...prev, module.id]));
          break;
        }
      }
    }
  }, [modules, selectedLessonId]);

  // Mark lesson as completed mutation
  const completeLessonMutation = useMutation({
    mutationFn: (lessonId: string) => 
      apiService.post(`/lessons/${lessonId}/progress`, { completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
    },
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const selectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const getNextLesson = () => {
    const allLessons = modules.flatMap(module => 
      module.lessons.map(lesson => ({ ...lesson, moduleId: module.id }))
    ).sort((a, b) => a.order - b.order);
    
    const currentIndex = allLessons.findIndex(lesson => lesson.id === selectedLessonId);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const allLessons = modules.flatMap(module => 
      module.lessons.map(lesson => ({ ...lesson, moduleId: module.id }))
    ).sort((a, b) => a.order - b.order);
    
    const currentIndex = allLessons.findIndex(lesson => lesson.id === selectedLessonId);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  if (courseLoading || modulesLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedLesson = modules
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === selectedLessonId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Course Navigation */}
      <div className="w-80 bg-white shadow-lg border-r flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft />}
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 line-clamp-2">
                {course?.title}
              </h1>
              <p className="text-sm text-gray-600">
                {course?.category} • {course?.difficulty}
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          {showProgress && progress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Course Progress</span>
                <span className="text-sm font-bold text-primary-600">
                  {progress.progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{progress.completedLessons} of {progress.totalLessons} lessons</span>
                <span>{Math.round(progress.timeSpent / 60)}min studied</span>
              </div>
            </div>
          )}
        </div>

        {/* Module Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Course Content</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProgress(!showProgress)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {modules.map((module) => (
                <ModuleItem
                  key={module.id}
                  module={module}
                  isExpanded={expandedModules.has(module.id)}
                  onToggle={() => toggleModule(module.id)}
                  selectedLessonId={selectedLessonId}
                  onSelectLesson={selectLesson}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" fullWidth leftIcon={<Bookmark />}>
              Notes
            </Button>
            <Button variant="outline" size="sm" fullWidth leftIcon={<HelpCircle />}>
              Help
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {selectedLesson && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {selectedLesson.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {selectedLesson.duration} min
                    </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {selectedLesson.type}
                    </div>
                    {selectedLesson.isCompleted && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" leftIcon={<Share2 />}>
                Share
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Settings />}>
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 p-6">
          {selectedLesson ? (
            <LessonViewer
              lessonId={selectedLesson.id}
              onComplete={() => completeLessonMutation.mutate(selectedLesson.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a lesson to start learning
                </h3>
                <p className="text-gray-600">
                  Choose a lesson from the sidebar to begin your learning journey
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="bg-white border-t p-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              leftIcon={<ChevronRight className="rotate-180" />}
              onClick={() => {
                const prevLesson = getPreviousLesson();
                if (prevLesson) setSelectedLessonId(prevLesson.id);
              }}
              disabled={!getPreviousLesson()}
            >
              Previous Lesson
            </Button>

            <div className="flex items-center space-x-4">
              {selectedLesson && !selectedLesson.isCompleted && (
                <Button
                  leftIcon={<CheckCircle />}
                  onClick={() => completeLessonMutation.mutate(selectedLesson.id)}
                  disabled={completeLessonMutation.isPending}
                >
                  {completeLessonMutation.isPending ? 'Marking...' : 'Mark Complete'}
                </Button>
              )}
            </div>

            <Button
              leftIcon={<ChevronRight />}
              onClick={() => {
                const nextLesson = getNextLesson();
                if (nextLesson) setSelectedLessonId(nextLesson.id);
              }}
              disabled={!getNextLesson()}
            >
              Next Lesson
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Module Item Component
const ModuleItem: React.FC<{
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
}> = ({ module, isExpanded, onToggle, selectedLessonId, onSelectLesson }) => {
  return (
    <div className="border rounded-lg">
      <button
        className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            module.isCompleted 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {module.isCompleted ? <CheckCircle className="h-4 w-4" /> : module.order}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{module.title}</h3>
            <p className="text-xs text-gray-600">
              {module.completedLessons} of {module.totalLessons} lessons
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="border-t bg-gray-50">
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isSelected={selectedLessonId === lesson.id}
              onSelect={() => onSelectLesson(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Lesson Item Component
const LessonItem: React.FC<{
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ lesson, isSelected, onSelect }) => {
  const getLessonIcon = () => {
    switch (lesson.type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'text':
        return <BookOpen className="h-4 w-4" />;
      case 'interactive':
        return <Lightbulb className="h-4 w-4" />;
      case 'assessment':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <button
      className={`w-full p-3 text-left hover:bg-gray-100 flex items-center space-x-3 ${
        isSelected ? 'bg-primary-50 border-r-2 border-primary-500' : ''
      } ${lesson.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onSelect}
      disabled={lesson.isLocked}
    >
      <div className={`flex-shrink-0 ${
        lesson.isCompleted 
          ? 'text-green-600' 
          : isSelected 
            ? 'text-primary-600' 
            : 'text-gray-400'
      }`}>
        {lesson.isCompleted ? <CheckCircle className="h-4 w-4" /> : getLessonIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium ${
          isSelected ? 'text-primary-900' : 'text-gray-900'
        }`}>
          {lesson.title}
        </h4>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{lesson.duration} min</span>
          <span>•</span>
          <span className="capitalize">{lesson.type}</span>
        </div>
      </div>
    </button>
  );
};
