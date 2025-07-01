// Smart Suggestions - Intelligent suggestion system with contextual recommendations
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Sparkles,
  Brain,
  MessageCircle,
  FileText,
  Video,
  Users,
  Award,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { useAIAssistantStore } from '../../../stores/aiAssistantStore';

const SmartSuggestions = ({ 
  context = {},
  userRole = 'student',
  onSuggestionClick,
  className = '',
  maxSuggestions = 6,
  showCategories = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentContext, conversationHistory } = useAIAssistantStore();

  // Define suggestion categories based on user role
  const suggestionCategories = useMemo(() => {
    const categories = {
      all: { icon: Sparkles, label: 'All Suggestions', color: 'blue' },
      learning: { icon: BookOpen, label: 'Learning', color: 'green' },
      productivity: { icon: Zap, label: 'Productivity', color: 'purple' },
      insights: { icon: TrendingUp, label: 'Insights', color: 'orange' },
      help: { icon: Lightbulb, label: 'Help', color: 'yellow' }
    };

    if (userRole === 'instructor') {
      categories.teaching = { icon: Users, label: 'Teaching', color: 'blue' };
      categories.analytics = { icon: TrendingUp, label: 'Analytics', color: 'indigo' };
    }

    if (userRole === 'admin') {
      categories.management = { icon: Target, label: 'Management', color: 'red' };
      categories.reports = { icon: FileText, label: 'Reports', color: 'gray' };
    }

    return categories;
  }, [userRole]);

  // Generate contextual suggestions based on current state
  const generateSuggestions = useMemo(() => {
    const suggestions = [];
    const currentCourse = context.course || currentContext.course;
    const currentLesson = context.lesson || currentContext.lesson;
    const userProgress = context.progress || currentContext.progress;

    // Student suggestions
    if (userRole === 'student') {
      if (currentLesson) {
        suggestions.push({
          id: 'explain-concept',
          category: 'learning',
          title: `Explain "${currentLesson.title}" in simple terms`,
          description: 'Get a clear, beginner-friendly explanation',
          icon: BookOpen,
          priority: 5,
          action: () => onSuggestionClick?.(`Please explain "${currentLesson.title}" in simple terms with examples.`)
        });

        suggestions.push({
          id: 'quiz-me',
          category: 'learning', 
          title: 'Quiz me on this lesson',
          description: 'Test your understanding with questions',
          icon: Brain,
          priority: 4,
          action: () => onSuggestionClick?.(`Create a quick quiz to test my understanding of "${currentLesson.title}".`)
        });

        suggestions.push({
          id: 'practical-examples',
          category: 'learning',
          title: 'Show me practical examples',
          description: 'Real-world applications and use cases',
          icon: Target,
          priority: 4,
          action: () => onSuggestionClick?.(`Show me practical, real-world examples of "${currentLesson.title}".`)
        });
      }

      if (currentCourse) {
        suggestions.push({
          id: 'study-plan',
          category: 'productivity',
          title: 'Create a study plan',
          description: 'Personalized learning schedule',
          icon: Clock,
          priority: 3,
          action: () => onSuggestionClick?.(`Create a personalized study plan for "${currentCourse.title}" based on my progress.`)
        });

        suggestions.push({
          id: 'progress-summary',
          category: 'insights',
          title: 'Summarize my progress',
          description: 'See how you\'re doing so far',
          icon: TrendingUp,
          priority: 3,
          action: () => onSuggestionClick?.(`Summarize my progress in "${currentCourse.title}" and suggest areas for improvement.`)
        });
      }

      if (userProgress && userProgress.strugglingTopics?.length > 0) {
        suggestions.push({
          id: 'help-struggling',
          category: 'help',
          title: 'Help with difficult topics',
          description: 'Get extra support for challenging concepts',
          icon: Lightbulb,
          priority: 5,
          action: () => onSuggestionClick?.(`I'm struggling with these topics: ${userProgress.strugglingTopics.join(', ')}. Can you help me understand them better?`)
        });
      }

      // General learning suggestions
      suggestions.push(
        {
          id: 'learning-tips',
          category: 'productivity',
          title: 'Get learning tips',
          description: 'Improve your study techniques',
          icon: Star,
          priority: 2,
          action: () => onSuggestionClick?.('Give me some effective learning and study tips for better retention.')
        },
        {
          id: 'motivation',
          category: 'help',
          title: 'Stay motivated',
          description: 'Get encouragement and motivation',
          icon: Sparkles,
          priority: 2,
          action: () => onSuggestionClick?.('I need some motivation to continue learning. Can you help me stay focused?')
        }
      );
    }

    // Instructor suggestions
    if (userRole === 'instructor') {
      if (currentCourse) {
        suggestions.push({
          id: 'course-analytics',
          category: 'analytics',
          title: 'Course performance analysis',
          description: 'See how students are progressing',
          icon: TrendingUp,
          priority: 5,
          action: () => onSuggestionClick?.(`Analyze the performance of students in "${currentCourse.title}" and identify areas where they need more support.`)
        });

        suggestions.push({
          id: 'improve-content',
          category: 'teaching',
          title: 'Suggest content improvements',
          description: 'Make your course more engaging',
          icon: BookOpen,
          priority: 4,
          action: () => onSuggestionClick?.(`Suggest ways to improve the content and engagement in "${currentCourse.title}".`)
        });
      }

      suggestions.push(
        {
          id: 'engagement-strategies',
          category: 'teaching',
          title: 'Student engagement strategies',
          description: 'Keep students motivated and active',
          icon: Users,
          priority: 4,
          action: () => onSuggestionClick?.('Suggest effective strategies to increase student engagement in online learning.')
        },
        {
          id: 'assessment-ideas',
          category: 'teaching',
          title: 'Creative assessment ideas',
          description: 'Innovative ways to test knowledge',
          icon: Award,
          priority: 3,
          action: () => onSuggestionClick?.('Give me creative and effective assessment ideas for online courses.')
        },
        {
          id: 'difficult-students',
          category: 'help',
          title: 'Handle challenging situations',
          description: 'Deal with student issues effectively',
          icon: Lightbulb,
          priority: 3,
          action: () => onSuggestionClick?.('How can I handle challenging student situations and maintain a positive learning environment?')
        }
      );
    }

    // Admin suggestions
    if (userRole === 'admin') {
      suggestions.push(
        {
          id: 'platform-analytics',
          category: 'reports',
          title: 'Platform performance report',
          description: 'Overall system insights',
          icon: TrendingUp,
          priority: 5,
          action: () => onSuggestionClick?.('Generate a comprehensive platform performance report with key metrics and insights.')
        },
        {
          id: 'user-engagement',
          category: 'management',
          title: 'User engagement analysis',
          description: 'See how users interact with the platform',
          icon: Users,
          priority: 4,
          action: () => onSuggestionClick?.('Analyze user engagement patterns and suggest improvements for the platform.')
        },
        {
          id: 'course-quality',
          category: 'management',
          title: 'Course quality assessment',
          description: 'Evaluate course effectiveness',
          icon: Star,
          priority: 4,
          action: () => onSuggestionClick?.('Assess the quality of courses on the platform and identify top performers and areas for improvement.')
        },
        {
          id: 'system-optimization',
          category: 'help',
          title: 'System optimization tips',
          description: 'Improve platform performance',
          icon: Zap,
          priority: 3,
          action: () => onSuggestionClick?.('Suggest ways to optimize the platform for better performance and user experience.')
        }
      );
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  }, [userRole, context, currentContext, onSuggestionClick]);

  // Filter suggestions based on category and search
  const filteredSuggestions = useMemo(() => {
    let filtered = generateSuggestions;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    return filtered.slice(0, maxSuggestions);
  }, [generateSuggestions, selectedCategory, searchQuery, maxSuggestions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
      red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      gray: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
    };
    return colors[suggestionCategories[category]?.color] || colors.blue;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Smart Suggestions</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh suggestions"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          />
        </div>

        {/* Category filters */}
        {showCategories && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(suggestionCategories).map(([key, category]) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected 
                      ? getCategoryColor(key)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {category.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggestions List */}
      <div className="p-4">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No suggestions match your search.' : 'No suggestions available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSuggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.id}
                  onClick={suggestion.action}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(suggestion.category)} flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          {suggestion.title}
                        </h4>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSuggestions;
