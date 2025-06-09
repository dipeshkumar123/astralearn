// AI Assistant Floating Component
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Loader2, 
  Lightbulb,
  BookOpen,
  Target,
  HelpCircle,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';
import MessageBubble from './MessageBubble';
import SuggestedActions from './SuggestedActions';
import QuickActions from './QuickActions';

const AIAssistant = () => {
  const {
    isOpen,
    isMinimized,
    isLoading,
    isTyping,
    messages,
    currentMessage,
    assistantMode,
    suggestedActions,
    error,
    toggleAssistant,
    minimizeAssistant,
    maximizeAssistant,
    closeAssistant,
    setCurrentMessage,
    sendMessage,
    sendStreamingMessage,
    clearMessages,
    clearError,
    setAssistantMode
  } = useAIAssistantStore();

  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when assistant opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;
    
    try {
      // Use streaming for better UX
      await sendStreamingMessage(currentMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleModeChange = (mode) => {
    setAssistantMode(mode);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getPlaceholderText = () => {
    switch (assistantMode) {
      case 'explanation':
        return 'Ask me to explain any concept...';
      case 'feedback':
        return 'Share your work for personalized feedback...';
      case 'suggestions':
        return 'Ask for study suggestions or recommendations...';
      default:
        return 'Ask me anything about your learning...';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'explanation':
        return <BookOpen className="w-4 h-4" />;
      case 'feedback':
        return <Target className="w-4 h-4" />;
      case 'suggestions':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleAssistant}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Brain className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
          </div>
        </button>
      </div>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">AI Assistant</span>
              {isTyping && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={maximizeAssistant}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Maximize"
              >
                <Maximize2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={closeAssistant}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full assistant interface
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        ref={containerRef}
        className="bg-white rounded-lg shadow-xl border border-gray-200 w-96 h-[600px] flex flex-col animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-600">
                {isLoading ? 'Thinking...' : 'Ready to help'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={minimizeAssistant}
              className="p-2 hover:bg-white/50 rounded transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={closeAssistant}
              className="p-2 hover:bg-white/50 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { mode: 'chat', label: 'Chat', icon: MessageCircle },
            { mode: 'explanation', label: 'Explain', icon: BookOpen },
            { mode: 'feedback', label: 'Feedback', icon: Target },
            { mode: 'suggestions', label: 'Suggest', icon: Lightbulb }
          ].map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                assistantMode === mode
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Ready to assist!</h4>
              <p className="text-sm text-gray-600 mb-4">
                I'm your AI learning companion. Ask me anything!
              </p>
              {suggestedActions.length > 0 && (
                <SuggestedActions actions={suggestedActions} />
              )}
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Actions */}
        {suggestedActions.length > 0 && messages.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100">
            <SuggestedActions actions={suggestedActions} />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={getPlaceholderText()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!currentMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
          
          {/* Quick action buttons */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={clearMessages}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                disabled={messages.length === 0}
              >
                Clear chat
              </button>
            </div>
            <div className="flex items-center space-x-1">
              {getModeIcon(assistantMode)}
              <span className="text-xs text-gray-500 capitalize">{assistantMode} mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
