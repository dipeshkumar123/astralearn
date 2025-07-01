// Quick Actions Grid - Contextual quick actions based on user role and current context
import React, { useMemo } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Target, 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  FileText, 
  Video, 
  Award, 
  Brain, 
  Zap,
  MessageCircle,
  Settings,
  Download,
  Share2,
  Calendar,
  BarChart3,
  Lightbulb,
  Search,
  Plus,
  Edit,
  Trash2,
  Archive
} from 'lucide-react';
import { useAIAssistantStore } from '../../../stores/aiAssistantStore';

const QuickActionsGrid = ({ 
  context = {},
  userRole = 'student',
  onActionClick,
  className = ''
}) => {
  const { currentContext } = useAIAssistantStore();

  // Generate contextual quick actions based on user role and current context
  const quickActions = useMemo(() => {
    const actions = [];
    const currentCourse = context.course || currentContext.course;
    const currentLesson = context.lesson || currentContext.lesson;
    const userProgress = context.progress || currentContext.progress;

    // Student Actions
    if (userRole === 'student') {
      // Core learning actions
      actions.push(
        {
          id: 'explain-concept',
          title: 'Explain This',
          description: 'Get a simple explanation',
          icon: Lightbulb,
          color: 'blue',
          priority: 5,
          condition: currentLesson,
          action: () => onActionClick?.(`Explain "${currentLesson?.title || 'this concept'}" in simple terms`)
        },
        {
          id: 'quiz-me',
          title: 'Quiz Me',
          description: 'Test your knowledge',
          icon: Brain,
          color: 'purple',
          priority: 4,
          action: () => onActionClick?.('Create a quick quiz to test my understanding of this topic')
        },
        {
          id: 'study-plan',
          title: 'Study Plan',
          description: 'Create a learning schedule',
          icon: Calendar,
          color: 'green',
          priority: 3,
          action: () => onActionClick?.('Create a personalized study plan based on my current progress')
        },
        {
          id: 'examples',
          title: 'Show Examples',
          description: 'Real-world applications',
          icon: Target,
          color: 'orange',
          priority: 4,
          condition: currentLesson,
          action: () => onActionClick?.(`Show me practical examples of "${currentLesson?.title || 'this concept'}"`)
        }
      );

      // Progress and performance actions
      if (userProgress) {
        actions.push(
          {
            id: 'progress-report',
            title: 'My Progress',
            description: 'See how you\'re doing',
            icon: TrendingUp,
            color: 'indigo',
            priority: 3,
            action: () => onActionClick?.('Show me a detailed progress report with insights and recommendations')
          },
          {
            id: 'weak-areas',
            title: 'Improve Weak Areas',
            description: 'Focus on challenges',
            icon: Star,
            color: 'red',
            priority: 5,
            condition: userProgress.strugglingTopics?.length > 0,
            action: () => onActionClick?.('Help me improve in my weak areas and provide targeted practice')
          }
        );
      }

      // Course-specific actions
      if (currentCourse) {
        actions.push(
          {
            id: 'course-summary',
            title: 'Course Overview',
            description: 'Understand the big picture',
            icon: BookOpen,
            color: 'blue',
            priority: 2,
            action: () => onActionClick?.(`Give me an overview of "${currentCourse.title}" and what I should focus on`)
          },
          {
            id: 'next-steps',
            title: 'What\'s Next?',
            description: 'Get learning guidance',
            icon: Zap,
            color: 'yellow',
            priority: 3,
            action: () => onActionClick?.('What should I study next based on my current progress?')
          }
        );
      }

      // General help actions
      actions.push(
        {
          id: 'learning-tips',
          title: 'Learning Tips',
          description: 'Improve study methods',
          icon: HelpCircle,
          color: 'teal',
          priority: 2,
          action: () => onActionClick?.('Give me effective learning tips and study strategies')
        },
        {
          id: 'motivation',
          title: 'Stay Motivated',
          description: 'Get encouragement',
          icon: Star,
          color: 'pink',
          priority: 1,
          action: () => onActionClick?.('I need motivation to keep learning. Help me stay focused and engaged')
        }
      );
    }

    // Instructor Actions
    if (userRole === 'instructor') {
      actions.push(
        {
          id: 'student-analytics',
          title: 'Student Analytics',
          description: 'See class performance',
          icon: BarChart3,
          color: 'blue',
          priority: 5,
          condition: currentCourse,
          action: () => onActionClick?.(`Analyze student performance in "${currentCourse?.title || 'my course'}" and identify areas needing attention`)
        },
        {
          id: 'engagement-tips',
          title: 'Boost Engagement',
          description: 'Keep students active',
          icon: Users,
          color: 'green',
          priority: 4,
          action: () => onActionClick?.('Suggest strategies to increase student engagement and participation')
        },
        {
          id: 'content-improve',
          title: 'Improve Content',
          description: 'Make lessons better',
          icon: Edit,
          color: 'purple',
          priority: 4,
          condition: currentCourse,
          action: () => onActionClick?.(`Suggest improvements for "${currentCourse?.title || 'my course'}" content and structure`)
        },
        {
          id: 'assessment-ideas',
          title: 'Assessment Ideas',
          description: 'Creative testing methods',
          icon: Award,
          color: 'orange',
          priority: 3,
          action: () => onActionClick?.('Give me creative and effective assessment ideas for my students')
        },
        {
          id: 'difficult-students',
          title: 'Handle Challenges',
          description: 'Student management tips',
          icon: HelpCircle,
          color: 'red',
          priority: 3,
          action: () => onActionClick?.('How can I handle challenging student situations and maintain a positive learning environment?')
        },
        {
          id: 'course-planning',
          title: 'Course Planning',
          description: 'Structure your curriculum',
          icon: Calendar,
          color: 'indigo',
          priority: 2,
          action: () => onActionClick?.('Help me plan and structure an effective course curriculum')
        }
      );

      // Content creation actions
      actions.push(
        {
          id: 'create-quiz',
          title: 'Create Quiz',
          description: 'Generate assessments',
          icon: FileText,
          color: 'teal',
          priority: 3,
          condition: currentLesson,
          action: () => onActionClick?.(`Create a quiz for "${currentLesson?.title || 'this lesson'}" with various question types`)
        },
        {
          id: 'lesson-plan',
          title: 'Lesson Plan',
          description: 'Structure your teaching',
          icon: BookOpen,
          color: 'blue',
          priority: 2,
          action: () => onActionClick?.('Help me create a detailed lesson plan with learning objectives and activities')
        }
      );
    }

    // Admin Actions
    if (userRole === 'admin') {
      actions.push(
        {
          id: 'platform-metrics',
          title: 'Platform Metrics',
          description: 'Overall performance',
          icon: TrendingUp,
          color: 'blue',
          priority: 5,
          action: () => onActionClick?.('Show me comprehensive platform metrics and performance indicators')
        },
        {
          id: 'user-analytics',
          title: 'User Analytics',
          description: 'User behavior insights',
          icon: Users,
          color: 'green',
          priority: 4,
          action: () => onActionClick?.('Analyze user engagement patterns and platform usage statistics')
        },
        {
          id: 'course-quality',
          title: 'Course Quality',
          description: 'Assess content effectiveness',
          icon: Star,
          color: 'yellow',
          priority: 4,
          action: () => onActionClick?.('Evaluate course quality and identify top-performing and underperforming content')
        },
        {
          id: 'system-health',
          title: 'System Health',
          description: 'Platform status check',
          icon: Settings,
          color: 'red',
          priority: 3,
          action: () => onActionClick?.('Check system health, performance metrics, and identify any issues')
        },
        {
          id: 'growth-insights',
          title: 'Growth Insights',
          description: 'Expansion opportunities',
          icon: BarChart3,
          color: 'purple',
          priority: 3,
          action: () => onActionClick?.('Provide growth insights and recommendations for platform expansion')
        },
        {
          id: 'user-feedback',
          title: 'User Feedback',
          description: 'Satisfaction analysis',
          icon: MessageCircle,
          color: 'orange',
          priority: 2,
          action: () => onActionClick?.('Analyze user feedback and satisfaction trends across the platform')
        }
      );

      // Management actions
      actions.push(
        {
          id: 'generate-report',
          title: 'Generate Report',
          description: 'Custom analytics report',
          icon: FileText,
          color: 'indigo',
          priority: 3,
          action: () => onActionClick?.('Generate a comprehensive analytics report for the specified time period')
        },
        {
          id: 'optimize-performance',
          title: 'Optimize Platform',
          description: 'Performance improvements',
          icon: Zap,
          color: 'teal',
          priority: 2,
          action: () => onActionClick?.('Suggest platform optimizations to improve performance and user experience')
        }
      );
    }

    // Filter actions based on conditions and sort by priority
    return actions
      .filter(action => action.condition === undefined || action.condition)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 8); // Limit to 8 actions for better UX
  }, [userRole, context, currentContext, currentContext.course, currentContext.lesson, onActionClick]);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 dark:text-green-300',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:border-orange-800 dark:text-orange-300',
      red: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-800 dark:text-red-300',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300',
      teal: 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:hover:bg-teal-900/30 dark:border-teal-800 dark:text-teal-300',
      pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700 dark:bg-pink-900/20 dark:hover:bg-pink-900/30 dark:border-pink-800 dark:text-pink-300'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({quickActions.length})
        </span>
      </div>

      {quickActions.length === 0 ? (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No quick actions available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-4 rounded-xl border transition-all hover:scale-105 hover:shadow-md text-left group ${getColorClasses(action.color)}`}
                title={action.description}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20 group-hover:bg-white/80 dark:group-hover:bg-black/40 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">
                      {action.title}
                    </h4>
                    <p className="text-xs opacity-75 leading-tight">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Context Information */}
      {(currentContext.course || currentContext.lesson) && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <BookOpen className="h-4 w-4" />
            <span>Context:</span>
            {currentContext.course && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs">
                {currentContext.course.title}
              </span>
            )}
            {currentContext.lesson && (
              <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">
                {currentContext.lesson.title}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionsGrid;
