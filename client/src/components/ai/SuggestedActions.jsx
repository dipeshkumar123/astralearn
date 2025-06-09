// Suggested Actions Component for AI Assistant
import React from 'react';
import { 
  MessageCircle, 
  BookOpen, 
  Target, 
  Lightbulb, 
  Play, 
  HelpCircle,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';

const SuggestedActions = ({ actions = [] }) => {
  const { executeSuggestedAction, sendMessage } = useAIAssistantStore();

  const getActionIcon = (type) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="w-3 h-3" />;
      case 'explain':
        return <BookOpen className="w-3 h-3" />;
      case 'recommend':
        return <Target className="w-3 h-3" />;
      case 'suggest':
        return <Lightbulb className="w-3 h-3" />;
      case 'help':
        return <HelpCircle className="w-3 h-3" />;
      case 'progress':
        return <TrendingUp className="w-3 h-3" />;
      case 'schedule':
        return <Clock className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const handleActionClick = async (action) => {
    try {
      if (action.type === 'chat') {
        await sendMessage(action.message || action.label);
      } else {
        await executeSuggestedAction(action);
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        Suggested Actions
      </h4>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className="flex items-center space-x-1 text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 transform hover:scale-105"
          >
            {getActionIcon(action.type)}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedActions;
