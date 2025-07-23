import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  FileText,
  Video,
  Headphones,
  Download,
  Share2,
  Bookmark,
  CheckCircle,
  Clock,
  Target,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TouchButton } from './MobileNavigation';

interface LessonContent {
  id: string;
  type: 'video' | 'text' | 'audio' | 'interactive' | 'quiz';
  title: string;
  content: string;
  duration?: number;
  videoUrl?: string;
  audioUrl?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface MobileLearningInterfaceProps {
  lesson: LessonContent;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  progress: number;
}

export const MobileLearningInterface: React.FC<MobileLearningInterfaceProps> = ({
  lesson,
  onNext,
  onPrevious,
  onComplete,
  hasNext,
  hasPrevious,
  progress
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Swipe handlers for navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => hasNext && onNext(),
    onSwipedRight: () => hasPrevious && onPrevious(),
    trackMouse: true,
    trackTouch: true,
  });

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (showControls && lesson.type === 'video') {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [showControls, lesson.type]);

  const getContentIcon = () => {
    switch (lesson.type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Headphones className="h-5 w-5" />;
      case 'text': return <FileText className="h-5 w-5" />;
      case 'interactive': return <Target className="h-5 w-5" />;
      case 'quiz': return <CheckCircle className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-black flex flex-col relative" {...swipeHandlers}>
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between p-4 pt-8">
          <div className="flex items-center space-x-3">
            <TouchButton
              onClick={() => window.history.back()}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </TouchButton>
            <div className="text-white">
              <div className="flex items-center space-x-2">
                {getContentIcon()}
                <span className="font-medium">{lesson.title}</span>
              </div>
              {lesson.duration && (
                <div className="text-sm text-gray-300 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{Math.ceil(lesson.duration / 60)} min</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TouchButton
              onClick={() => {/* Share functionality */}}
              variant="outline"
              size="sm"
            >
              <Share2 className="h-4 w-4" />
            </TouchButton>
            <TouchButton
              onClick={() => {/* Bookmark functionality */}}
              variant="outline"
              size="sm"
            >
              <Bookmark className="h-4 w-4" />
            </TouchButton>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 relative"
        onClick={() => setShowControls(!showControls)}
      >
        {lesson.type === 'video' && (
          <VideoPlayer
            videoUrl={lesson.videoUrl!}
            isPlaying={isPlaying}
            isMuted={isMuted}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
          />
        )}

        {lesson.type === 'audio' && (
          <AudioPlayer
            audioUrl={lesson.audioUrl!}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
          />
        )}

        {lesson.type === 'text' && (
          <TextContent content={lesson.content} />
        )}

        {lesson.type === 'interactive' && (
          <InteractiveContent content={lesson.content} />
        )}

        {lesson.type === 'quiz' && (
          <QuizContent content={lesson.content} onComplete={onComplete} />
        )}

        {/* Media Controls Overlay */}
        {(lesson.type === 'video' || lesson.type === 'audio') && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center space-x-6">
              <TouchButton
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="h-6 w-6" />
              </TouchButton>

              <TouchButton
                onClick={() => setIsPlaying(!isPlaying)}
                variant="primary"
                size="lg"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </TouchButton>

              <TouchButton
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                variant="outline"
                size="lg"
              >
                <RotateCw className="h-6 w-6" />
              </TouchButton>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Media Timeline */}
        {(lesson.type === 'video' || lesson.type === 'audio') && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-3 text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(Number(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <span>{formatTime(duration)}</span>
              <TouchButton
                onClick={() => setIsMuted(!isMuted)}
                variant="outline"
                size="sm"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </TouchButton>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between p-4">
          <TouchButton
            onClick={onPrevious}
            disabled={!hasPrevious}
            variant="outline"
            size="lg"
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="ml-2">Previous</span>
          </TouchButton>

          <TouchButton
            onClick={onComplete}
            variant="primary"
            size="lg"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="ml-2">Complete</span>
          </TouchButton>

          <TouchButton
            onClick={onNext}
            disabled={!hasNext}
            variant="outline"
            size="lg"
          >
            <span className="mr-2">Next</span>
            <ChevronRight className="h-6 w-6" />
          </TouchButton>
        </div>
      </div>

      {/* Swipe Indicators */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white/50">
        {hasPrevious && <ChevronLeft className="h-8 w-8" />}
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white/50">
        {hasNext && <ChevronRight className="h-8 w-8" />}
      </div>
    </div>
  );
};

// Video Player Component
const VideoPlayer: React.FC<{
  videoUrl: string;
  isPlaying: boolean;
  isMuted: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}> = ({ videoUrl, isPlaying, isMuted, onTimeUpdate, onDurationChange }) => {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <video
        src={videoUrl}
        className="w-full h-full object-contain"
        controls={false}
        muted={isMuted}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        onDurationChange={(e) => onDurationChange(e.currentTarget.duration)}
      />
    </div>
  );
};

// Audio Player Component
const AudioPlayer: React.FC<{
  audioUrl: string;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}> = ({ audioUrl, isPlaying, onTimeUpdate, onDurationChange }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Headphones className="h-24 w-24 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Audio Lesson</p>
        <p className="text-sm opacity-75">Tap to show controls</p>
      </div>
      <audio
        src={audioUrl}
        className="hidden"
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        onDurationChange={(e) => onDurationChange(e.currentTarget.duration)}
      />
    </div>
  );
};

// Text Content Component
const TextContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="w-full h-full bg-white overflow-y-auto">
      <div className="max-w-none p-6 pt-24 pb-32">
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Content Component
const InteractiveContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      <div className="p-6 pt-24 pb-32">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center mb-6">
            <Target className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">Interactive Exercise</h3>
            <p className="text-gray-600">Engage with the content below</p>
          </div>
          <div className="whitespace-pre-wrap text-gray-900">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quiz Content Component
const QuizContent: React.FC<{ 
  content: string; 
  onComplete: () => void;
}> = ({ content, onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    setShowResult(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      <div className="p-6 pt-24 pb-32">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">Knowledge Check</h3>
            <p className="text-gray-600">Test your understanding</p>
          </div>

          <div className="space-y-4">
            <div className="text-gray-900 font-medium mb-4">
              {content}
            </div>

            {/* Mock quiz options */}
            {['Option A', 'Option B', 'Option C', 'Option D'].map((option, index) => (
              <TouchButton
                key={option}
                onClick={() => setSelectedAnswer(option)}
                variant={selectedAnswer === option ? 'primary' : 'outline'}
                fullWidth
              >
                {option}
              </TouchButton>
            ))}

            {selectedAnswer && !showResult && (
              <TouchButton
                onClick={handleSubmit}
                variant="primary"
                fullWidth
                size="lg"
              >
                Submit Answer
              </TouchButton>
            )}

            {showResult && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Correct! Well done.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
