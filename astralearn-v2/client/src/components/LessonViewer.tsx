import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  FileText,
  Video,
  Code,
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AssessmentViewer } from '@/components/AssessmentViewer';
import { apiService } from '@/utils/api';

interface LessonContent {
  id: string;
  lessonId: string;
  type: 'video' | 'text' | 'interactive' | 'assessment';
  title: string;
  content: any;
  orderIndex: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  content: LessonContent[];
}

interface LessonViewerProps {
  lessonId: string;
  onComplete: () => void;
  isCompleted: boolean;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lessonId,
  onComplete,
  isCompleted
}) => {
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  // Fetch lesson details with content
  const { data: lessonData, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => apiService.get(`/lessons/${lessonId}`),
    enabled: !!lessonId,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: any) => apiService.post(`/lessons/${lessonId}/progress`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
    },
  });

  const lesson: Lesson = lessonData?.data;
  const content = lesson?.content || [];
  const currentContent = content[currentContentIndex];

  useEffect(() => {
    if (lesson && !startTime) {
      setStartTime(new Date());
    }
  }, [lesson, startTime]);

  const handleNext = () => {
    if (currentContentIndex < content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  const handleComplete = () => {
    const timeSpent = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0;
    
    updateProgressMutation.mutate({
      completed: true,
      timeSpent: timeSpent
    });
    
    onComplete();
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'interactive':
        return <Code className="h-5 w-5" />;
      case 'assessment':
        return <HelpCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Lesson Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {lesson.title}
            </h2>
            <p className="text-gray-600 mb-4">{lesson.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {lesson.duration} minutes
              </div>
              <div className="flex items-center">
                {getContentIcon(lesson.type)}
                <span className="ml-1 capitalize">{lesson.type}</span>
              </div>
              {content.length > 1 && (
                <div>
                  {currentContentIndex + 1} of {content.length} sections
                </div>
              )}
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {currentContent && (
          <ContentRenderer content={currentContent} />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="border-t p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft />}
              onClick={handlePrevious}
              disabled={currentContentIndex === 0}
            >
              Previous
            </Button>
            
            {currentContentIndex < content.length - 1 ? (
              <Button
                size="sm"
                rightIcon={<ChevronRight />}
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              !isCompleted && (
                <Button
                  size="sm"
                  rightIcon={<CheckCircle />}
                  onClick={handleComplete}
                  disabled={updateProgressMutation.isPending}
                >
                  {updateProgressMutation.isPending ? 'Completing...' : 'Complete Lesson'}
                </Button>
              )
            )}
          </div>

          {content.length > 1 && (
            <div className="flex space-x-1">
              {content.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentContentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentContentIndex
                      ? 'bg-primary-600'
                      : index <= currentContentIndex
                      ? 'bg-primary-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Content Renderer Component
const ContentRenderer: React.FC<{ content: LessonContent }> = ({ content }) => {
  switch (content.type) {
    case 'video':
      return <VideoContent content={content} />;
    case 'text':
      return <TextContent content={content} />;
    case 'interactive':
      return <InteractiveContent content={content} />;
    case 'assessment':
      return <AssessmentContent content={content} />;
    default:
      return <div>Unsupported content type: {content.type}</div>;
  }
};

// Video Content Component
const VideoContent: React.FC<{ content: LessonContent }> = ({ content }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{content.title}</h3>
      
      {/* Video Player Placeholder */}
      <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Play className="h-8 w-8 text-white ml-1" />
          )}
        </button>
      </div>
      
      {content.content.transcript && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Transcript</h4>
          <p className="text-sm text-gray-700">{content.content.transcript}</p>
        </div>
      )}
    </div>
  );
};

// Text Content Component
const TextContent: React.FC<{ content: LessonContent }> = ({ content }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{content.title}</h3>
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content.content.markdown.replace(/\n/g, '<br>') }} />
      </div>
    </div>
  );
};

// Interactive Content Component
const InteractiveContent: React.FC<{ content: LessonContent }> = ({ content }) => {
  const [code, setCode] = useState(content.content.starterCode || '');
  const [output, setOutput] = useState('');

  const runCode = () => {
    // Simple code execution simulation
    try {
      // This is a simplified example - in a real app, you'd use a proper code execution service
      if (code.includes('console.log')) {
        const match = code.match(/console\.log\(['"`](.*)['"`]\)/);
        if (match) {
          setOutput(match[1]);
        }
      } else {
        setOutput('Code executed successfully!');
      }
    } catch (error) {
      setOutput('Error: ' + error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{content.title}</h3>
      
      <div className="mb-4">
        <p className="text-gray-700 mb-4">{content.content.instructions}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-40 p-3 border rounded-lg font-mono text-sm"
            placeholder="Write your code here..."
          />
          <Button onClick={runCode} className="mt-2">
            Run Code
          </Button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output
          </label>
          <div className="w-full h-40 p-3 border rounded-lg bg-gray-900 text-green-400 font-mono text-sm">
            {output || 'Click "Run Code" to see output...'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Assessment Content Component
const AssessmentContent: React.FC<{ content: LessonContent }> = ({ content }) => {
  return (
    <div>
      <AssessmentViewer
        lessonId={content.lessonId}
        onComplete={(passed) => {
          console.log('Assessment completed:', passed);
        }}
      />
    </div>
  );
};
