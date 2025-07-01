// Suggested Actions Panel - Dynamic action suggestions based on AI analysis
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Clock, 
  Star, 
  Zap, 
  Brain,
  BookOpen,
  MessageCircle,
  Award,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  RefreshCw,
  X,
  Pin,
  PinOff,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useAIAssistantStore } from '../../../stores/aiAssistantStore';

const SuggestedActionsPanel = ({ 
  context = {},
  userRole = 'student',
  onActionClick,
  onActionDismiss,
  onActionPin,
  className = ''
}) => {
  const [dismissedActions, setDismissedActions] = useState(new Set());
  const [pinnedActions, setPinnedActions] = useState(new Set());
  const [actionFeedback, setActionFeedback] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { 
    currentContext, 
    conversationHistory, 
    userProgress,
    analyticsData 
  } = useAIAssistantStore();

  // Generate intelligent action suggestions based on context, behavior, and analytics
  const suggestedActions = useMemo(() => {
    const actions = [];
    const currentCourse = context.course || currentContext.course;
    const currentLesson = context.lesson || currentContext.lesson;
    const recentMessages = conversationHistory?.slice(-5) || [];
    const progress = context.progress || userProgress;

    // Analyze recent conversation for patterns
    const recentTopics = recentMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content?.toLowerCase())
      .join(' ');

    const hasConfusion = recentTopics.includes('confused') || 
                        recentTopics.includes('don\'t understand') ||
                        recentTopics.includes('explain');

    const hasStruggle = recentTopics.includes('difficult') ||
                       recentTopics.includes('hard') ||
                       recentTopics.includes('struggling');

    const wantsExamples = recentTopics.includes('example') ||
                         recentTopics.includes('show me') ||
                         recentTopics.includes('demonstrate');

    // Student-specific suggestions
    if (userRole === 'student') {
      // Confusion-based suggestions
      if (hasConfusion) {
        actions.push({
          id: 'simplify-explanation',
          type: 'learning',
          priority: 'high',
          title: 'Get a Simpler Explanation',
          description: 'Break down complex concepts into easier terms',
          icon: Lightbulb,
          color: 'yellow',
          confidence: 0.95,
          action: () => onActionClick?.('Please explain this concept in much simpler terms, as if explaining to a beginner.'),
          reasoning: 'User expressed confusion in recent messages'
        });

        actions.push({
          id: 'visual-aid',
          type: 'learning',
          priority: 'high',
          title: 'Request Visual Aid',
          description: 'Ask for diagrams, charts, or visual representations',
          icon: BarChart3,
          color: 'blue',
          confidence: 0.85,
          action: () => onActionClick?.('Can you create a visual representation or diagram to help me understand this better?'),
          reasoning: 'Visual aids help with comprehension'
        });
      }

      // Struggle-based suggestions
      if (hasStruggle) {
        actions.push({
          id: 'break-down-steps',
          type: 'learning',
          priority: 'high',
          title: 'Break Into Steps',
          description: 'Get step-by-step guidance',
          icon: Target,
          color: 'green',
          confidence: 0.92,
          action: () => onActionClick?.('Can you break this down into smaller, manageable steps?'),
          reasoning: 'User is struggling with the material'
        });

        actions.push({
          id: 'practice-problems',
          type: 'practice',
          priority: 'medium',
          title: 'Practice Problems',
          description: 'Get similar problems to practice',
          icon: Brain,
          color: 'purple',
          confidence: 0.88,
          action: () => onActionClick?.('Give me some practice problems to help me master this concept.'),
          reasoning: 'Practice helps overcome difficulties'
        });
      }

      // Example-seeking suggestions
      if (wantsExamples) {
        actions.push({
          id: 'real-world-examples',
          type: 'examples',
          priority: 'high',
          title: 'Real-World Applications',
          description: 'See how this applies in practice',
          icon: Target,
          color: 'orange',
          confidence: 0.90,
          action: () => onActionClick?.('Show me real-world examples of how this concept is used.'),
          reasoning: 'User requested examples'
        });
      }

      // Progress-based suggestions  
      if (progress) {
        if (progress.completionRate < 50) {
          actions.push({
            id: 'motivation-boost',
            type: 'motivation',
            priority: 'medium',
            title: 'Stay Motivated',
            description: 'Get encouragement and tips',
            icon: Star,
            color: 'pink',
            confidence: 0.75,
            action: () => onActionClick?.('I need some motivation to keep going. Can you help me stay focused?'),
            reasoning: 'Low completion rate indicates need for motivation'
          });
        }

        if (progress.timeSpent > 60) { // More than 1 hour
          actions.push({
            id: 'take-break',
            type: 'wellness',
            priority: 'medium',
            title: 'Take a Break',
            description: 'Rest and recharge',
            icon: Clock,
            color: 'indigo',
            confidence: 0.70,
            action: () => onActionClick?.('I\'ve been studying for a while. What\'s the best way to take an effective break?'),
            reasoning: 'Extended study time suggests need for break'
          });
        }

        if (progress.averageScore < 70) {
          actions.push({
            id: 'study-strategy',
            type: 'strategy',
            priority: 'high',
            title: 'Improve Study Strategy',
            description: 'Get better learning techniques',
            icon: Zap,
            color: 'red',
            confidence: 0.88,
            action: () => onActionClick?.('My scores are lower than I\'d like. Can you suggest better study strategies?'),
            reasoning: 'Low average score indicates need for strategy improvement'
          });
        }
      }

      // Course-specific suggestions
      if (currentCourse) {
        actions.push({
          id: 'course-roadmap',
          type: 'planning',
          priority: 'low',
          title: 'Course Roadmap',
          description: 'See what\'s ahead in this course',
          icon: BookOpen,
          color: 'blue',
          confidence: 0.65,
          action: () => onActionClick?.(`Show me a roadmap of what's coming up in "${currentCourse.title}".`),
          reasoning: 'Course context available'
        });
      }

      // Lesson-specific suggestions
      if (currentLesson) {
        actions.push({
          id: 'lesson-summary',
          type: 'summary',
          priority: 'medium',
          title: 'Quick Summary',
          description: 'Get key points from this lesson',
          icon: MessageCircle,
          color: 'teal',
          confidence: 0.80,
          action: () => onActionClick?.(`Summarize the key points from "${currentLesson.title}".`),
          reasoning: 'Lesson context available'
        });

        actions.push({
          id: 'check-understanding',
          type: 'assessment',
          priority: 'medium',
          title: 'Check Understanding',
          description: 'Quick comprehension check',
          icon: CheckCircle,
          color: 'green',
          confidence: 0.82,
          action: () => onActionClick?.(`Ask me a few questions to check if I understand "${currentLesson.title}".`),
          reasoning: 'Active lesson engagement'
        });
      }
    }

    // Instructor-specific suggestions
    if (userRole === 'instructor') {
      // Analyze class performance patterns
      if (analyticsData) {
        if (analyticsData.strugglingStudents > 3) {
          actions.push({
            id: 'help-struggling',
            type: 'support',
            priority: 'high',
            title: 'Support Struggling Students',
            description: 'Get strategies for students who need help',
            icon: Users,
            color: 'red',
            confidence: 0.95,
            action: () => onActionClick?.('Several students are struggling. What strategies can I use to help them?'),
            reasoning: 'High number of struggling students detected'
          });
        }

        if (analyticsData.engagementRate < 60) {
          actions.push({
            id: 'boost-engagement',
            type: 'engagement',
            priority: 'high',
            title: 'Boost Engagement',
            description: 'Increase student participation',
            icon: TrendingUp,
            color: 'orange',
            confidence: 0.90,
            action: () => onActionClick?.('Student engagement is low. How can I make my classes more interactive?'),
            reasoning: 'Low engagement rate detected'
          });
        }
      }

      // Course improvement suggestions
      if (currentCourse) {
        actions.push({
          id: 'course-analytics',
          type: 'analytics',
          priority: 'medium',
          title: 'Course Analytics',
          description: 'Analyze course performance',
          icon: BarChart3,
          color: 'blue',
          confidence: 0.85,
          action: () => onActionClick?.(`Analyze the performance data for "${currentCourse.title}" and suggest improvements.`),
          reasoning: 'Course data available for analysis'
        });
      }

      // Content creation suggestions
      actions.push({
        id: 'create-assessment',
        type: 'creation',
        priority: 'medium',
        title: 'Create Assessment',
        description: 'Generate quiz or assignment',
        icon: Award,
        color: 'purple',
        confidence: 0.75,
        action: () => onActionClick?.('Help me create an effective assessment for my students.'),
        reasoning: 'Common instructor need'
      });
    }

    // Admin-specific suggestions
    if (userRole === 'admin') {
      actions.push({
        id: 'platform-overview',
        type: 'overview',
        priority: 'high',
        title: 'Platform Overview',
        description: 'Get comprehensive platform insights',
        icon: BarChart3,
        color: 'blue',
        confidence: 0.90,
        action: () => onActionClick?.('Give me a comprehensive overview of platform performance and key metrics.'),
        reasoning: 'Admin needs platform insights'
      });

      actions.push({
        id: 'growth-opportunities',
        type: 'growth',
        priority: 'medium',
        title: 'Growth Opportunities',
        description: 'Identify expansion possibilities',
        icon: TrendingUp,
        color: 'green',
        confidence: 0.80,
        action: () => onActionClick?.('Identify growth opportunities and areas for platform expansion.'),
        reasoning: 'Strategic planning need'
      });
    }

    // Filter out dismissed actions and sort by priority and confidence
    return actions
      .filter(action => !dismissedActions.has(action.id))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.confidence - a.confidence;
      });
  }, [
    context, 
    currentContext, 
    conversationHistory, 
    userProgress, 
    analyticsData, 
    userRole, 
    dismissedActions,
    onActionClick
  ]);

  // Prioritize pinned actions
  const displayActions = useMemo(() => {
    const pinned = suggestedActions.filter(action => pinnedActions.has(action.id));
    const unpinned = suggestedActions.filter(action => !pinnedActions.has(action.id));
    const combined = [...pinned, ...unpinned];
    
    return showAll ? combined : combined.slice(0, 6);
  }, [suggestedActions, pinnedActions, showAll]);

  const handleActionClick = (action) => {
    action.action();
    
    // Track action usage
    setActionFeedback(prev => ({
      ...prev,
      [action.id]: { ...prev[action.id], used: true, usedAt: new Date() }
    }));
  };

  const handleDismiss = (actionId) => {
    setDismissedActions(prev => new Set([...prev, actionId]));
    onActionDismiss?.(actionId);
  };

  const handlePin = (actionId) => {
    const newPinned = new Set(pinnedActions);
    if (newPinned.has(actionId)) {
      newPinned.delete(actionId);
    } else {
      newPinned.add(actionId);
    }
    setPinnedActions(newPinned);
    onActionPin?.(actionId, newPinned.has(actionId));
  };

  const handleFeedback = (actionId, type) => {
    setActionFeedback(prev => ({
      ...prev,
      [actionId]: { ...prev[actionId], feedback: type, feedbackAt: new Date() }
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDismissedActions(new Set());
    setIsRefreshing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      purple: 'text-purple-600 dark:text-purple-400',
      orange: 'text-orange-600 dark:text-orange-400',
      red: 'text-red-600 dark:text-red-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      indigo: 'text-indigo-600 dark:text-indigo-400',
      teal: 'text-teal-600 dark:text-teal-400',
      pink: 'text-pink-600 dark:text-pink-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Suggestions</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({displayActions.length})
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Refresh suggestions"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="max-h-96 overflow-y-auto">
        {displayActions.length === 0 ? (
          <div className="p-8 text-center">
            <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No suggestions available right now.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Keep interacting with the AI to get personalized suggestions!
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {displayActions.map((action) => {
              const Icon = action.icon;
              const isPinned = pinnedActions.has(action.id);
              const feedback = actionFeedback[action.id];
              
              return (
                <div
                  key={action.id}
                  className={`relative group p-4 rounded-lg border transition-all hover:shadow-md ${getPriorityColor(action.priority)}`}
                >
                  {/* Priority Indicator */}
                  {action.priority === 'high' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  
                  {/* Pin Indicator */}
                  {isPinned && (
                    <Pin className="absolute top-2 right-2 h-3 w-3 text-yellow-500" />
                  )}
                  
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-700 ${getColorClasses(action.color)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {action.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(action.confidence * 100)}%
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            action.confidence > 0.8 ? 'bg-green-400' :
                            action.confidence > 0.6 ? 'bg-yellow-400' : 'bg-gray-400'
                          }`} />
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {action.description}
                      </p>
                      
                      {action.reasoning && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 italic">
                          {action.reasoning}
                        </p>
                      )}
                      
                      {/* Action Button */}
                      <button
                        onClick={() => handleActionClick(action)}
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        Try this suggestion
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Menu */}
                  <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePin(action.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isPinned 
                            ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' 
                            : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        }`}
                        title={isPinned ? 'Unpin' : 'Pin suggestion'}
                      >
                        {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                      </button>
                      
                      <button
                        onClick={() => handleDismiss(action.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Dismiss suggestion"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Feedback Buttons */}
                  {feedback?.used && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(action.id, 'positive')}
                        className={`p-1 rounded transition-colors ${
                          feedback.feedback === 'positive' 
                            ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(action.id, 'negative')}
                        className={`p-1 rounded transition-colors ${
                          feedback.feedback === 'negative' 
                            ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Show More Button */}
            {suggestedActions.length > 6 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full p-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {showAll ? 'Show Less' : `Show ${suggestedActions.length - 6} More Suggestions`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedActionsPanel;
