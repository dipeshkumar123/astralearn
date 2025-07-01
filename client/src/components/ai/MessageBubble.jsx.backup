// Message Bubble Component for AI Assistant
import React from 'react';
import { 
  User, 
  Bot, 
  AlertCircle, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  ExternalLink,
  BookOpen,
  Target,
  Lightbulb,
  Zap
} from 'lucide-react';

const MessageBubble = ({ message }) => {
  const { type, content, metadata, recommendations, suggestions, error, isStreaming } = message;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderContent = () => {
    if (type === 'error') {
      return (
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700">{content}</p>
            {error && (
              <p className="text-xs text-red-500 mt-1 opacity-75">{error}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Main content */}
        <div className="prose prose-sm max-w-none">
          {content.split('\n').map((line, index) => (
            <p key={index} className="mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs">Writing...</span>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Target className="w-4 h-4 mr-1" />
              Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-1">{rec.title}</h5>
                  <p className="text-sm text-blue-700 mb-2">{rec.description}</p>
                  {rec.action && (
                    <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {rec.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Lightbulb className="w-4 h-4 mr-1" />
              Suggestions
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full px-3 py-1 hover:bg-yellow-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metadata indicators */}
        {metadata && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {metadata.type === 'explanation' && (
              <div className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3" />
                <span>Explanation</span>
              </div>
            )}
            {metadata.type === 'recommendations' && (
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>Recommendations</span>
              </div>
            )}
            {metadata.learningStyle && (
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Adapted for {metadata.learningStyle}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${type === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${type === 'user' ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            type === 'user' 
              ? 'bg-blue-600 text-white' 
              : type === 'error'
              ? 'bg-red-100 text-red-600'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
          }`}>
            {type === 'user' ? (
              <User className="w-4 h-4" />
            ) : type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Message bubble */}
        <div className={`rounded-lg px-4 py-3 ${
          type === 'user'
            ? 'bg-blue-600 text-white'
            : type === 'error'
            ? 'bg-red-50 border border-red-200'
            : 'bg-gray-100 text-gray-900'
        }`}>
          {renderContent()}

          {/* Action buttons for assistant messages */}
          {type === 'assistant' && !isStreaming && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(content)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  className="text-gray-500 hover:text-green-600 transition-colors"
                  title="Helpful"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
