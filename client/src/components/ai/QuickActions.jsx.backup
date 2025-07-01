// Quick Actions Component for AI Assistant
import React from 'react';
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  HelpCircle,
  Brain,
  Zap
} from 'lucide-react';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';

const QuickActions = () => {
  const { sendMessage, getRecommendations, currentContext } = useAIAssistantStore();

  const quickActions = [
    {
      icon: <HelpCircle className="w-4 h-4" />,
      label: 'Get Help',
      action: () => sendMessage('I need help with my current lesson'),
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Explain',
      action: () => sendMessage('Please explain this concept in simple terms'),
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: 'Recommend',
      action: () => getRecommendations(),
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Progress',
      action: () => sendMessage('Show my learning progress and areas for improvement'),
      color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
    }
  ];

  const handleQuickAction = async (action) => {
    try {
      await action();
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  return (
    <div className="p-3 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.action)}
            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${action.color}`}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
