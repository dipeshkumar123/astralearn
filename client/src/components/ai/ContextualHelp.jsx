// Contextual Help - Smart help system that provides context-aware assistance
import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink,
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Users,
  MessageCircle,
  Lightbulb,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';

const ContextualHelp = ({ 
  context = {},
  userRole = 'student',
  onHelpClick,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set(['quick-help']));
  const [selectedHelpType, setSelectedHelpType] = useState('all');
  const { currentContext } = useAIAssistantStore();

  // Help content based on context and user role
  const helpContent = useMemo(() => {
    const content = {
      quickHelp: [],
      tutorials: [],
      faqs: [],
      resources: []
    };

    const currentCourse = context.course || currentContext.course;
    const currentLesson = context.lesson || currentContext.lesson;
    const userProgress = context.progress || currentContext.progress;

    // Quick Help - Context-specific immediate assistance
    if (currentLesson) {
      content.quickHelp.push({
        id: 'lesson-help',
        title: `Help with "${currentLesson.title}"`,
        description: 'Get specific help for this lesson',
        icon: BookOpen,
        type: 'lesson',
        priority: 5,
        action: () => onHelpClick?.(`I need help understanding "${currentLesson.title}". Can you explain the key concepts?`)
      });

      if (currentLesson.difficulty === 'hard') {
        content.quickHelp.push({
          id: 'difficulty-help',
          title: 'This lesson is challenging',
          description: 'Get tips for difficult content',
          icon: AlertCircle,
          type: 'difficulty',
          priority: 4,
          action: () => onHelpClick?.(`This lesson seems difficult. Can you break it down into simpler steps?`)
        });
      }
    }

    if (currentCourse) {
      content.quickHelp.push({
        id: 'course-overview',
        title: `Course Overview: ${currentCourse.title}`,
        description: 'Understand the course structure',
        icon: Target,
        type: 'course',
        priority: 3,
        action: () => onHelpClick?.(`Give me an overview of "${currentCourse.title}" and what I should expect to learn.`)
      });
    }

    // Role-specific quick help
    if (userRole === 'student') {
      content.quickHelp.push(
        {
          id: 'study-tips',
          title: 'Study Tips',
          description: 'Effective learning strategies',
          icon: Lightbulb,
          type: 'learning',
          priority: 2,
          action: () => onHelpClick?.('Give me some effective study tips and learning strategies.')
        },
        {
          id: 'progress-help',
          title: 'Track Your Progress',
          description: 'Understanding your learning journey',
          icon: CheckCircle,
          type: 'progress',
          priority: 2,
          action: () => onHelpClick?.('How can I track my progress and identify areas for improvement?')
        }
      );

      if (userProgress && userProgress.timeSpent < 30) {
        content.quickHelp.push({
          id: 'getting-started',
          title: 'Getting Started Guide',
          description: 'New to the platform? Start here',
          icon: Star,
          type: 'onboarding',
          priority: 5,
          action: () => onHelpClick?.('I\'m new to this platform. Can you guide me through the basics?')
        });
      }
    }

    if (userRole === 'instructor') {
      content.quickHelp.push(
        {
          id: 'course-management',
          title: 'Course Management',
          description: 'Managing your courses effectively',
          icon: BookOpen,
          type: 'management',
          priority: 4,
          action: () => onHelpClick?.('Help me understand how to manage my courses and students effectively.')
        },
        {
          id: 'student-engagement',
          title: 'Student Engagement',
          description: 'Keep students motivated',
          icon: Users,
          type: 'engagement',
          priority: 3,
          action: () => onHelpClick?.('How can I improve student engagement in my courses?')
        }
      );
    }

    if (userRole === 'admin') {
      content.quickHelp.push(
        {
          id: 'platform-management',
          title: 'Platform Management',
          description: 'System administration help',
          icon: Target,
          type: 'admin',
          priority: 4,
          action: () => onHelpClick?.('I need help with platform management and administration tasks.')
        },
        {
          id: 'analytics-help',
          title: 'Analytics & Reports',
          description: 'Understanding platform metrics',
          icon: Zap,
          type: 'analytics',
          priority: 3,
          action: () => onHelpClick?.('Help me understand the platform analytics and how to generate reports.')
        }
      );
    }

    // Tutorials - Step-by-step guides
    content.tutorials = [
      {
        id: 'platform-basics',
        title: 'Platform Basics',
        description: 'Learn the fundamentals of using AstraLearn',
        icon: Video,
        duration: '5 min',
        level: 'Beginner',
        type: 'tutorial'
      },
      {
        id: 'effective-learning',
        title: 'Effective Learning Strategies',
        description: 'Maximize your learning potential',
        icon: BookOpen,
        duration: '8 min',
        level: 'Intermediate',
        type: 'tutorial'
      },
      {
        id: 'ai-assistant-guide',
        title: 'Using the AI Assistant',
        description: 'Get the most out of AI-powered help',
        icon: MessageCircle,
        duration: '6 min',
        level: 'Beginner',
        type: 'tutorial'
      }
    ];

    if (userRole === 'instructor') {
      content.tutorials.push(
        {
          id: 'course-creation',
          title: 'Creating Engaging Courses',
          description: 'Build courses that students love',
          icon: Target,
          duration: '12 min',
          level: 'Intermediate',
          type: 'tutorial'
        },
        {
          id: 'student-analytics',
          title: 'Understanding Student Analytics',
          description: 'Track and improve student performance',
          icon: Zap,
          duration: '10 min',
          level: 'Advanced',
          type: 'tutorial'
        }
      );
    }

    // FAQs - Frequently asked questions
    content.faqs = [
      {
        id: 'getting-started-faq',
        question: 'How do I get started with learning?',
        answer: 'Begin by exploring our course catalog, choosing a course that matches your interests and skill level, and following the structured learning path.',
        category: 'general',
        votes: 42
      },
      {
        id: 'progress-tracking-faq',
        question: 'How is my progress tracked?',
        answer: 'Your progress is automatically tracked as you complete lessons, quizzes, and assignments. You can view detailed analytics in your dashboard.',
        category: 'progress',
        votes: 38
      },
      {
        id: 'ai-assistant-faq',
        question: 'How does the AI Assistant work?',
        answer: 'The AI Assistant uses advanced language models and your learning context to provide personalized help, explanations, and study recommendations.',
        category: 'ai',
        votes: 35
      },
      {
        id: 'difficulty-faq',
        question: 'What if the content is too difficult?',
        answer: 'Use our adaptive learning features, ask the AI Assistant for simpler explanations, or access prerequisite materials to build your foundation.',
        category: 'learning',
        votes: 29
      }
    ];

    // Resources - Additional learning materials
    content.resources = [
      {
        id: 'study-guides',
        title: 'Study Guides',
        description: 'Comprehensive guides for effective learning',
        icon: FileText,
        type: 'document',
        external: false
      },
      {
        id: 'video-library',
        title: 'Video Library',
        description: 'Educational videos and tutorials',
        icon: Video,
        type: 'video',
        external: false
      },
      {
        id: 'community-forum',
        title: 'Community Forum',
        description: 'Connect with other learners',
        icon: Users,
        type: 'external',
        external: true,
        url: '/community'
      },
      {
        id: 'help-center',
        title: 'Help Center',
        description: 'Comprehensive documentation',
        icon: HelpCircle,
        type: 'external',
        external: true,
        url: '/help'
      }
    ];

    // Sort by priority
    content.quickHelp.sort((a, b) => b.priority - a.priority);

    return content;
  }, [context, currentContext, userRole, onHelpClick]);

  // Filter content based on search and type
  const filteredContent = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(helpContent).forEach(([key, items]) => {
      filtered[key] = items.filter(item => {
        if (selectedHelpType !== 'all' && item.type !== selectedHelpType) return false;
        if (!query) return true;
        
        return (
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.question?.toLowerCase().includes(query) ||
          item.answer?.toLowerCase().includes(query)
        );
      });
    });

    return filtered;
  }, [helpContent, searchQuery, selectedHelpType]);

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const helpTypes = [
    { value: 'all', label: 'All Help' },
    { value: 'lesson', label: 'Lesson Help' },
    { value: 'course', label: 'Course Help' },
    { value: 'learning', label: 'Learning Tips' },
    { value: 'progress', label: 'Progress' },
    { value: 'tutorial', label: 'Tutorials' }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Contextual Help</h3>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search help content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          />
        </div>

        {/* Help Type Filter */}
        <select
          value={selectedHelpType}
          onChange={(e) => setSelectedHelpType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
        >
          {helpTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {/* Quick Help */}
        {filteredContent.quickHelp?.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('quick-help')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Quick Help</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({filteredContent.quickHelp.length})
                </span>
              </div>
              {expandedSections.has('quick-help') ? 
                <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                <ChevronRight className="h-4 w-4 text-gray-400" />
              }
            </button>
            
            {expandedSections.has('quick-help') && (
              <div className="px-4 pb-4 space-y-2">
                {filteredContent.quickHelp.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex-shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tutorials */}
        {filteredContent.tutorials?.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('tutorials')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Tutorials</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({filteredContent.tutorials.length})
                </span>
              </div>
              {expandedSections.has('tutorials') ? 
                <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                <ChevronRight className="h-4 w-4 text-gray-400" />
              }
            </button>
            
            {expandedSections.has('tutorials') && (
              <div className="px-4 pb-4 space-y-2">
                {filteredContent.tutorials.map(tutorial => {
                  const Icon = tutorial.icon;
                  return (
                    <div
                      key={tutorial.id}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 flex-shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {tutorial.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {tutorial.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {tutorial.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {tutorial.level}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FAQs */}
        {filteredContent.faqs?.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toggleSection('faqs')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Frequently Asked</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({filteredContent.faqs.length})
                </span>
              </div>
              {expandedSections.has('faqs') ? 
                <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                <ChevronRight className="h-4 w-4 text-gray-400" />
              }
            </button>
            
            {expandedSections.has('faqs') && (
              <div className="px-4 pb-4 space-y-2">
                {filteredContent.faqs.map(faq => (
                  <div
                    key={faq.id}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {faq.answer}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{faq.category}</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {faq.votes} helpful
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resources */}
        {filteredContent.resources?.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('resources')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Resources</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({filteredContent.resources.length})
                </span>
              </div>
              {expandedSections.has('resources') ? 
                <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                <ChevronRight className="h-4 w-4 text-gray-400" />
              }
            </button>
            
            {expandedSections.has('resources') && (
              <div className="px-4 pb-4 space-y-2">
                {filteredContent.resources.map(resource => {
                  const Icon = resource.icon;
                  return (
                    <div
                      key={resource.id}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 flex-shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {resource.title}
                            </h4>
                            {resource.external && (
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {Object.values(filteredContent).every(arr => arr.length === 0) && (
          <div className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No help content matches your search.' : 'No help content available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextualHelp;
