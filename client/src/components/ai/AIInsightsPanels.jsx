// AI Insights Panels - Advanced analytics and insights with real-time data visualization
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Star,
  Users,
  BookOpen,
  Award,
  Zap,
  Brain,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';

const AIInsightsPanels = ({ 
  context = {},
  userRole = 'student',
  onInsightClick,
  className = ''
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [expandedPanels, setExpandedPanels] = useState(new Set(['performance', 'recommendations']));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentContext, analyticsData } = useAIAssistantStore();

  // Mock real-time data - in production, this would come from the analytics service
  const [realtimeData, setRealtimeData] = useState({});

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        lastUpdated: new Date(),
        activeUsers: Math.floor(Math.random() * 50) + 100,
        completionRate: Math.floor(Math.random() * 20) + 75
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate insights based on context and role
  const insights = useMemo(() => {
    const currentCourse = context.course || currentContext.course;
    const currentLesson = context.lesson || currentContext.lesson;
    const userProgress = context.progress || currentContext.progress;

    const insightPanels = {};

    // Performance Insights
    if (userRole === 'student') {
      insightPanels.performance = {
        title: 'Your Learning Performance',
        icon: TrendingUp,
        color: 'blue',
        metrics: [
          {
            label: 'Study Streak',
            value: userProgress?.studyStreak || 7,
            unit: 'days',
            trend: 'up',
            change: '+2',
            icon: Zap
          },
          {
            label: 'Completion Rate',
            value: userProgress?.completionRate || 85,
            unit: '%',
            trend: 'up',
            change: '+5%',
            icon: Target
          },
          {
            label: 'Average Score',
            value: userProgress?.averageScore || 88,
            unit: '%',
            trend: 'stable',
            change: '0%',
            icon: Star
          },
          {
            label: 'Time Spent',
            value: userProgress?.weeklyTime || 12,
            unit: 'hrs',
            trend: 'up',
            change: '+3h',
            icon: Clock
          }
        ],
        insights: [
          {
            type: 'positive',
            message: 'Great job maintaining your study streak! Consistency is key to learning success.',
            action: () => onInsightClick?.('Tell me more about maintaining good study habits.')
          },
          {
            type: 'suggestion',
            message: 'You\'re performing well in most areas. Consider focusing on time management for even better results.',
            action: () => onInsightClick?.('Give me tips for better time management while studying.')
          }
        ]
      };

      insightPanels.progress = {
        title: 'Learning Progress',
        icon: BarChart3,
        color: 'green',
        data: [
          { subject: 'Mathematics', progress: 78, trend: 'up' },
          { subject: 'Science', progress: 92, trend: 'up' },
          { subject: 'Literature', progress: 65, trend: 'down' },
          { subject: 'History', progress: 88, trend: 'stable' }
        ],
        insights: [
          {
            type: 'warning',
            message: 'Literature progress has declined. You might need additional support in this area.',
            action: () => onInsightClick?.('I\'m struggling with Literature. Can you help me improve?')
          },
          {
            type: 'positive',
            message: 'Excellent progress in Science! You\'re in the top 15% of learners.',
            action: () => onInsightClick?.('What advanced Science topics should I explore next?')
          }
        ]
      };

      insightPanels.recommendations = {
        title: 'AI Recommendations',
        icon: Brain,
        color: 'purple',
        recommendations: [
          {
            type: 'study',
            title: 'Optimal Study Time',
            description: 'Based on your performance data, you learn best between 2-4 PM',
            confidence: 85,
            action: () => onInsightClick?.('Help me create a schedule based on my optimal learning times.')
          },
          {
            type: 'content',
            title: 'Review Recommendations',
            description: 'Review "Quadratic Equations" - you had difficulty with this topic 2 weeks ago',
            confidence: 92,
            action: () => onInsightClick?.('Help me review Quadratic Equations with examples.')
          },
          {
            type: 'skill',
            title: 'Skill Development',
            description: 'Your analytical skills are strong. Consider advanced problem-solving courses',
            confidence: 78,
            action: () => onInsightClick?.('Suggest advanced courses that match my analytical skills.')
          }
        ]
      };
    }

    if (userRole === 'instructor') {
      insightPanels.performance = {
        title: 'Course Performance Analytics',
        icon: BarChart3,
        color: 'blue',
        metrics: [
          {
            label: 'Active Students',
            value: realtimeData.activeUsers || 145,
            unit: '',
            trend: 'up',
            change: '+12',
            icon: Users
          },
          {
            label: 'Completion Rate',
            value: realtimeData.completionRate || 78,
            unit: '%',
            trend: 'up',
            change: '+8%',
            icon: Target
          },
          {
            label: 'Avg. Engagement',
            value: 4.2,
            unit: '/5',
            trend: 'stable',
            change: '0',
            icon: Star
          },
          {
            label: 'Course Rating',
            value: 4.6,
            unit: '/5',
            trend: 'up',
            change: '+0.2',
            icon: ThumbsUp
          }
        ],
        insights: [
          {
            type: 'positive',
            message: 'Student engagement is up 15% this week. Your recent content updates are working well!',
            action: () => onInsightClick?.('What specific changes contributed to the increased engagement?')
          },
          {
            type: 'suggestion',
            message: 'Consider adding more interactive elements to Lesson 3 - students spend 40% less time there.',
            action: () => onInsightClick?.('Suggest ways to make Lesson 3 more interactive and engaging.')
          }
        ]
      };

      insightPanels.students = {
        title: 'Student Analytics',
        icon: Users,
        color: 'green',
        data: [
          { category: 'Struggling Students', count: 12, percentage: 8, trend: 'down' },
          { category: 'Average Performers', count: 98, percentage: 68, trend: 'stable' },
          { category: 'High Achievers', count: 35, percentage: 24, trend: 'up' }
        ],
        insights: [
          {
            type: 'info',
            message: '12 students need additional support. AI has identified common struggle points.',
            action: () => onInsightClick?.('Show me which students need help and what they\'re struggling with.')
          },
          {
            type: 'positive',
            message: 'High achiever count increased by 18% - your advanced materials are effective.',
            action: () => onInsightClick?.('How can I challenge my high-achieving students even more?')
          }
        ]
      };

      insightPanels.recommendations = {
        title: 'Teaching Recommendations',
        icon: Brain,
        color: 'purple',
        recommendations: [
          {
            type: 'content',
            title: 'Content Optimization',
            description: 'Add more visual aids to Lesson 5 - students with visual learning style struggle here',
            confidence: 88,
            action: () => onInsightClick?.('Suggest specific visual aids for Lesson 5 content.')
          },
          {
            type: 'engagement',
            title: 'Increase Interaction',
            description: 'Students are most active during Q&A sessions. Consider adding more interactive elements',
            confidence: 91,
            action: () => onInsightClick?.('Give me ideas for more interactive Q&A and discussion activities.')
          },
          {
            type: 'assessment',
            title: 'Assessment Strategy',
            description: 'Current quiz difficulty might be too high - 65% struggle with Question 7',
            confidence: 85,
            action: () => onInsightClick?.('Help me adjust the quiz difficulty and create better questions.')
          }
        ]
      };
    }

    if (userRole === 'admin') {
      insightPanels.platform = {
        title: 'Platform Analytics',
        icon: TrendingUp,
        color: 'blue',
        metrics: [
          {
            label: 'Total Users',
            value: 2847,
            unit: '',
            trend: 'up',
            change: '+156',
            icon: Users
          },
          {
            label: 'Course Completion',
            value: 73,
            unit: '%',
            trend: 'up',
            change: '+5%',
            icon: Target
          },
          {
            label: 'System Uptime',
            value: 99.8,
            unit: '%',
            trend: 'stable',
            change: '0%',
            icon: CheckCircle
          },
          {
            label: 'User Satisfaction',
            value: 4.5,
            unit: '/5',
            trend: 'up',
            change: '+0.3',
            icon: Star
          }
        ],
        insights: [
          {
            type: 'positive',
            message: 'Platform usage increased by 22% this month. New features are driving engagement.',
            action: () => onInsightClick?.('Which new features are most popular with users?')
          },
          {
            type: 'info',
            message: 'Mobile usage now accounts for 68% of total traffic. Consider mobile-first optimizations.',
            action: () => onInsightClick?.('What mobile optimizations should we prioritize?')
          }
        ]
      };

      insightPanels.courses = {
        title: 'Course Performance',
        icon: BookOpen,
        color: 'green',
        data: [
          { name: 'Web Development', students: 487, rating: 4.8, completion: 82 },
          { name: 'Data Science', students: 324, rating: 4.6, completion: 75 },
          { name: 'Machine Learning', students: 298, rating: 4.7, completion: 68 },
          { name: 'UI/UX Design', students: 245, rating: 4.5, completion: 79 }
        ],
        insights: [
          {
            type: 'suggestion',
            message: 'Machine Learning course has lower completion rates. Consider curriculum adjustments.',
            action: () => onInsightClick?.('Analyze why Machine Learning has lower completion rates.')
          },
          {
            type: 'positive',
            message: 'Web Development maintains highest satisfaction and completion rates.',
            action: () => onInsightClick?.('What makes Web Development course so successful?')
          }
        ]
      };

      insightPanels.recommendations = {
        title: 'Strategic Recommendations',
        icon: Brain,
        color: 'purple',
        recommendations: [
          {
            type: 'expansion',
            title: 'Market Expansion',
            description: 'High demand for cybersecurity courses. Consider adding this category',
            confidence: 92,
            action: () => onInsightClick?.('What should we consider when adding cybersecurity courses?')
          },
          {
            type: 'optimization',
            title: 'Resource Allocation',
            description: 'AI tutoring feature drives 35% more engagement. Consider expanding AI capabilities',
            confidence: 87,
            action: () => onInsightClick?.('How can we expand our AI tutoring capabilities?')
          },
          {
            type: 'retention',
            title: 'User Retention',
            description: 'Users who complete onboarding are 3x more likely to finish courses',
            confidence: 94,
            action: () => onInsightClick?.('How can we improve our onboarding process?')
          }
        ]
      };
    }

    return insightPanels;
  }, [context, currentContext, userRole, realtimeData, onInsightClick]);

  const togglePanel = (panelId) => {
    const newExpanded = new Set(expandedPanels);
    if (newExpanded.has(panelId)) {
      newExpanded.delete(panelId);
    } else {
      newExpanded.add(panelId);
    }
    setExpandedPanels(newExpanded);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const timeframes = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Insights</h3>
          {realtimeData.lastUpdated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Updated {new Date(realtimeData.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh insights"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Insights Panels */}
      {Object.entries(insights).map(([key, panel]) => {
        const Icon = panel.icon;
        const isExpanded = expandedPanels.has(key);
        
        return (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Panel Header */}
            <button
              onClick={() => togglePanel(key)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${panel.color}-50 text-${panel.color}-600 dark:bg-${panel.color}-900/20 dark:text-${panel.color}-400`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{panel.title}</h4>
                  {panel.metrics && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {panel.metrics.length} metrics available
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live data" />
                {isExpanded ? 
                  <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                }
              </div>
            </button>

            {/* Panel Content */}
            {isExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {/* Metrics Grid */}
                {panel.metrics && (
                  <div className="p-4 grid grid-cols-2 gap-4">
                    {panel.metrics.map((metric, index) => {
                      const MetricIcon = metric.icon;
                      return (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <MetricIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <div className="flex items-center gap-1">
                              {getTrendIcon(metric.trend)}
                              <span className={`text-xs font-medium ${
                                metric.trend === 'up' ? 'text-green-600' : 
                                metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {metric.change}
                              </span>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {metric.value}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                              {metric.unit}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {metric.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Data Visualization */}
                {panel.data && (
                  <div className="p-4">
                    <div className="space-y-3">
                      {panel.data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.subject || item.category || item.name}
                              </span>
                              <div className="flex items-center gap-2">
                                {item.progress !== undefined && (
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.progress}%
                                  </span>
                                )}
                                {item.rating && (
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    ★ {item.rating}
                                  </span>
                                )}
                                {getTrendIcon(item.trend)}
                              </div>
                            </div>
                            {item.progress !== undefined && (
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    item.progress >= 80 ? 'bg-green-500' :
                                    item.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            )}
                            {item.count !== undefined && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {item.count} students ({item.percentage}%)
                              </div>
                            )}
                            {item.students !== undefined && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {item.students} students • {item.completion}% completion
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {panel.recommendations && (
                  <div className="p-4 space-y-3">
                    {panel.recommendations.map((rec, index) => (
                      <button
                        key={index}
                        onClick={rec.action}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 flex-shrink-0">
                            <Brain className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                                {rec.title}
                              </h5>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {rec.confidence}% confidence
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500" />
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {rec.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Insights */}
                {panel.insights && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    {panel.insights.map((insight, index) => (
                      <button
                        key={index}
                        onClick={insight.action}
                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left group"
                      >
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                              {insight.message}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AIInsightsPanels;
