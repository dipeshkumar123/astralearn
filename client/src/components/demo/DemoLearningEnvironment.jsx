// Demo Learning Environment - Showcases AI Assistant Integration
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Book, 
  Play, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  User,
  Settings,
  Brain,
  Lightbulb
} from 'lucide-react';
import { useAIContext } from '../../contexts/AIContextProvider';
import { useAITriggers } from '../../hooks/useAITriggers';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';

const DemoLearningEnvironment = ({ onBackToStatus }) => {
  const [currentLesson, setCurrentLesson] = useState('intro-to-ai');
  const [userProgress, setUserProgress] = useState({
    performance: 75,
    timeSpent: 1200000, // 20 minutes
    attempts: 2,
    completedLessons: ['basics-of-ml'],
    currentStreak: 5
  });
  const [demoUser] = useState({
    id: 'demo-user-001',
    name: 'Alex Student',
    learningStyleAssessment: {
      dominantStyle: 'visual',
      scores: { visual: 85, auditory: 60, kinesthetic: 70, reading: 75 },
      confidence: 90
    },
    learningPreferences: {
      studyDuration: 45,
      contentTypes: ['video', 'interactive'],
      difficulty: 'intermediate'
    }
  });

  const { setUserContext, setCourseContext, setProgressContext, setPageContext } = useAIContext();
  const { toggleAssistant } = useAIAssistantStore();
  
  const {
    triggerExplanation,
    triggerFeedback,
    triggerRecommendations,
    triggerStudyPlan,
    sessionDuration
  } = useAITriggers({
    userId: demoUser.id,
    courseId: 'ai-fundamentals',
    lessonId: currentLesson,
    lessonContent: {
      title: 'Introduction to Artificial Intelligence',
      hasVideo: true,
      hasQuiz: true,
      difficulty: 'intermediate',
      estimatedTime: 30
    },
    userProgress,
    autoTriggers: true
  });

  const lessons = [
    {
      id: 'basics-of-ml',
      title: 'Basics of Machine Learning',
      status: 'completed',
      score: 88
    },
    {
      id: 'intro-to-ai',
      title: 'Introduction to Artificial Intelligence',
      status: 'current',
      score: null
    },
    {
      id: 'neural-networks',
      title: 'Understanding Neural Networks',
      status: 'locked',
      score: null
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning Fundamentals',
      status: 'locked',
      score: null
    }
  ];

  // Initialize contexts
  useEffect(() => {
    setUserContext(demoUser.id, demoUser);
    setCourseContext('ai-fundamentals', currentLesson, {
      title: 'Introduction to Artificial Intelligence',
      hasVideo: true,
      hasQuiz: true,
      difficulty: 'intermediate'
    });
    setProgressContext(userProgress);
    setPageContext('demo-lesson');
  }, [currentLesson, demoUser, userProgress, setUserContext, setCourseContext, setProgressContext, setPageContext]);

  const handleLessonSelect = (lessonId) => {
    if (lessons.find(l => l.id === lessonId)?.status !== 'locked') {
      setCurrentLesson(lessonId);
    }
  };

  const simulateQuizAnswer = (isCorrect) => {
    const newProgress = {
      ...userProgress,
      attempts: userProgress.attempts + 1,
      performance: isCorrect ? Math.min(100, userProgress.performance + 5) : Math.max(0, userProgress.performance - 10),
      timeSpent: userProgress.timeSpent + 30000 // Add 30 seconds
    };
    setUserProgress(newProgress);
    
    triggerFeedback(
      isCorrect ? "Artificial Intelligence is the simulation of human intelligence in machines" : "AI is just advanced programming",
      "Artificial Intelligence is the simulation of human intelligence in machines"
    );
  };

  const currentLessonData = lessons.find(l => l.id === currentLesson);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBackToStatus}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Status</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">{demoUser.name}</span>
              </div>
              <button
                onClick={toggleAssistant}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Brain className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Course Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Book className="w-5 h-5 mr-2" />
                AI Fundamentals
              </h3>
              
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      lesson.id === currentLesson
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : lesson.status === 'completed'
                        ? 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100'
                        : lesson.status === 'locked'
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                    disabled={lesson.status === 'locked'}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{lesson.title}</span>
                      {lesson.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    {lesson.score && (
                      <div className="text-xs text-gray-600 mt-1">Score: {lesson.score}%</div>
                    )}
                  </button>
                ))}
              </div>

              {/* Progress Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Your Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Performance</span>
                    <span className="font-medium">{userProgress.performance}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Study Time</span>
                    <span className="font-medium">{Math.round(userProgress.timeSpent / 60000)}m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Streak</span>
                    <span className="font-medium">{userProgress.currentStreak} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Lesson Header */}
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLessonData?.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>30 min estimated</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    <span>Intermediate</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{userProgress.performance}% progress</span>
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="p-6">
                {/* Video Placeholder */}
                <div className="bg-gray-900 rounded-lg aspect-video mb-6 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-75" />
                    <p className="text-lg font-medium">Introduction to AI Video</p>
                    <p className="text-sm opacity-75">Click to play (Demo)</p>
                  </div>
                </div>

                {/* Content Text */}
                <div className="prose max-w-none mb-8">
                  <h3>What is Artificial Intelligence?</h3>
                  <p>
                    Artificial Intelligence (AI) refers to the simulation of human intelligence in machines 
                    that are programmed to think and learn like humans. The term may also be applied to any 
                    machine that exhibits traits associated with a human mind such as learning and problem-solving.
                  </p>
                  
                  <h4>Key Characteristics of AI:</h4>
                  <ul>
                    <li><strong>Learning:</strong> The ability to improve performance through experience</li>
                    <li><strong>Reasoning:</strong> Using rules to reach approximate or definite conclusions</li>
                    <li><strong>Problem-solving:</strong> Finding solutions to complex challenges</li>
                    <li><strong>Perception:</strong> Interpreting sensory data to understand environment</li>
                  </ul>

                  <p>
                    AI systems can be categorized into narrow AI (designed for specific tasks) and 
                    general AI (possessing broad cognitive abilities similar to humans).
                  </p>
                </div>

                {/* Interactive Demo Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => triggerExplanation('machine learning algorithms', 'beginner')}
                    className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
                  >
                    <Lightbulb className="w-5 h-5 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Need Help Understanding?</h4>
                    <p className="text-sm text-gray-600">Get AI explanation of machine learning</p>
                  </button>
                  
                  <button
                    onClick={triggerRecommendations}
                    className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
                  >
                    <Target className="w-5 h-5 text-purple-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Get Recommendations</h4>
                    <p className="text-sm text-gray-600">Personalized learning suggestions</p>
                  </button>
                </div>

                {/* Quiz Section */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Quick Knowledge Check</h3>
                  <p className="text-blue-800 mb-4">
                    What is the primary goal of Artificial Intelligence?
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => simulateQuizAnswer(true)}
                      className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      A) To simulate human intelligence in machines
                    </button>
                    <button
                      onClick={() => simulateQuizAnswer(false)}
                      className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      B) To replace all human workers
                    </button>
                    <button
                      onClick={() => simulateQuizAnswer(false)}
                      className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      C) To create robot companions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLearningEnvironment;
