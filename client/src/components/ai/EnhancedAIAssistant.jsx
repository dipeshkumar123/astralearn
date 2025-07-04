// Enhanced AI Assistant - Modern, Role-Based, Real-Time AI Interface
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Zap,
  Settings,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MoreVertical,
  Plus,
  History,
  Star,
  TrendingUp,
  Users,
  Shield,
  Palette,
  Moon,
  Sun,
  Expand,
  Minimize,
  Pin,
  PinOff,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';
import { useAuth } from '../auth/AuthProvider';
import ModernMessageBubble from './components/ModernMessageBubble';
import SmartSuggestions from './SmartSuggestions';
import ContextualHelp from './ContextualHelp';
import AIInsightsPanels from './AIInsightsPanels';
import ConversationHistory from './ConversationHistory';

const EnhancedAIAssistant = () => {
  const { token, user } = useAuth(); // Add user data to get role and ID
  const {
    isOpen,
    isMinimized,
    isFullscreen,
    isDocked,
    isLoading,
    isTyping,
    theme,
    messages,
    conversations,
    activeConversationId,
    currentMessage,
    assistantMode,
    assistantPersonality,
    suggestedActions,
    smartSuggestions,
    contextualHelp,
    currentContext,
    error,
    warnings,
    voiceEnabled,
    isListening,
    speechSynthesis,
    autoSuggestions,
    learningInsights,
    toggleAssistant,
    minimizeAssistant,
    maximizeAssistant,
    toggleFullscreen,
    toggleDocked,
    closeAssistant,
    setTheme,
    setCurrentMessage,
    sendMessage,
    clearMessages,
    clearError,
    clearWarnings,
    createNewConversation,
    switchConversation,
    updateContext,
    setAssistantMode,
    setAssistantPersonality
  } = useAIAssistantStore();

  // Router hooks - safely handle when not in Router context
  const [location, setLocation] = useState({ pathname: '/', search: '', hash: '', state: null });
  const [params, setParams] = useState({});
  
  // Try to get router context safely
  useEffect(() => {
    try {
      // This will be undefined if not in router context
      const currentPath = window.location.pathname;
      setLocation({ 
        pathname: currentPath, 
        search: window.location.search, 
        hash: window.location.hash, 
        state: null 
      });
    } catch (error) {
      // Keep default location
      console.warn('Router context not available, using default location');
    }
  }, []);
  
  // Responsive design state
  const [viewportSize, setViewportSize] = useState('desktop');
  const [activeTab, setActiveTab] = useState('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Real-time context data
  const contextData = useMemo(() => {
    return {
      user: {
        id: user?._id || user?.id,
        role: user?.role,
        name: user?.firstName + ' ' + user?.lastName || user?.name,
        email: user?.email,
        preferences: user?.preferences,
        learningStyle: user?.learningStyle
      },
      location: {
        pathname: location.pathname,
        search: location.search,
        state: location.state
      },
      params,
      timestamp: Date.now()
    };
  }, [user, location, params]);

  // Responsive viewport detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewportSize('mobile');
      } else if (width < 1024) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time context updates
  useEffect(() => {
    updateContext(contextData);
  }, [contextData, updateContext]);

  // Role-based configurations
  const roleConfigs = {
    student: {
      primaryModes: ['chat', 'explain', 'help', 'practice'],
      personality: 'friendly',
      features: ['voice', 'suggestions', 'progress'],
      theme: 'student'
    },
    instructor: {
      primaryModes: ['analyze', 'insights', 'manage', 'recommend'],
      personality: 'professional',
      features: ['analytics', 'bulk-help', 'course-insights'],
      theme: 'instructor'
    },
    admin: {
      primaryModes: ['system', 'analytics', 'optimize', 'troubleshoot'],
      personality: 'technical',
      features: ['system-stats', 'user-insights', 'performance'],
      theme: 'admin'
    }
  };

  const currentRole = currentContext?.userRole || 'student';
  const roleConfig = roleConfigs[currentRole] || roleConfigs.student;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Real-time data fetching
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchRealTimeData();
      const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, user?._id]);

  const fetchRealTimeData = async () => {
    if (!token || !user?._id) return; // Don't fetch if not authenticated or no user data
    
    try {
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const promises = [];
      
      // Always fetch user's own progress
      promises.push(
        fetch(`/api/users/${user._id}/progress`, { headers: authHeaders })
          .then(res => res.ok ? res.json() : null)
      );

      // Only fetch analytics insights if user is admin or instructor
      if (user.role === 'admin' || user.role === 'instructor') {
        promises.push(
          fetch(`/api/analytics/insights/${user._id}`, { headers: authHeaders })
            .then(res => res.ok ? res.json() : null)
        );
      } else {
        promises.push(Promise.resolve(null)); // Placeholder for students
      }

      // Always fetch contextual help
      promises.push(
        fetch(`/api/ai/contextual-help`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            context: currentContext,
            currentPage: currentContext.page || location.pathname,
            userAction: 'real-time-sync'
          })
        }).then(res => res.ok ? res.json() : null)
      );

      const [progress, insights, help] = await Promise.all(promises);

      if (progress || insights || help) {
        updateContext({
          realTimeData: {
            currentPerformance: progress?.performance || progress?.progressData || {},
            strugglingAreas: insights?.strugglingAreas || [],
            strengths: insights?.strengths || [],
            recommendations: insights?.recommendations || [],
            contextualHelp: help?.help || help?.suggestions || []
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    try {
      await sendMessage(currentMessage);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleModeChange = (mode) => {
    setAssistantMode(mode);
    if (!activeConversationId) {
      createNewConversation(`${mode} Chat`, mode);
    }
  };

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    
    const roleGreetings = {
      student: `Good ${timeOfDay}! Ready to learn something new?`,
      instructor: `Good ${timeOfDay}! How can I assist with your teaching today?`,
      admin: `Good ${timeOfDay}! What system insights do you need?`
    };

    return roleGreetings[currentRole] || roleGreetings.student;
  };

  const getModeIcon = (mode) => {
    const icons = {
      chat: MessageCircle,
      explain: BookOpen,
      help: HelpCircle,
      practice: Target,
      analyze: TrendingUp,
      insights: Brain,
      manage: Users,
      recommend: Lightbulb,
      system: Settings,
      optimize: Zap,
      troubleshoot: Shield
    };
    const IconComponent = icons[mode] || MessageCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  const themeClasses = {
    light: 'bg-white text-gray-900 border-gray-200',
    dark: 'bg-gray-900 text-white border-gray-700',
    student: 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 border-blue-200',
    instructor: 'bg-gradient-to-br from-green-50 to-emerald-50 text-gray-900 border-green-200',
    admin: 'bg-gradient-to-br from-purple-50 to-violet-50 text-gray-900 border-purple-200'
  };

  const currentTheme = roleConfig.theme || theme;

  // Floating button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleAssistant}
          className={`${roleConfig.theme === 'student' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' :
                      roleConfig.theme === 'instructor' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                      'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
                    } text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group`}
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Brain className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
            {currentContext?.realTimeData?.recommendations?.length > 0 && (
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </button>
      </div>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`${themeClasses[currentTheme]} rounded-lg shadow-lg border p-4 min-w-[320px]`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${roleConfig.theme === 'student' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                                       roleConfig.theme === 'instructor' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                                       'bg-gradient-to-r from-purple-600 to-violet-600'
                                     } rounded-full flex items-center justify-center`}>
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-medium">AI Assistant</span>
                <div className="text-xs text-gray-500 capitalize">{currentRole} Mode</div>
              </div>
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
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={closeAssistant}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Responsive container dimensions
  const getContainerClasses = () => {
    if (isFullscreen) {
      return 'inset-0';
    }
    
    if (isDocked) {
      return viewportSize === 'mobile' 
        ? 'bottom-0 left-0 right-0 h-screen'
        : 'bottom-0 right-0 h-screen w-96';
    }
    
    // Floating mode
    switch (viewportSize) {
      case 'mobile':
        return 'bottom-4 left-4 right-4 h-[80vh] max-h-[600px]';
      case 'tablet':
        return 'bottom-6 right-6 w-80 h-[500px]';
      default:
        return 'bottom-6 right-6 w-96 h-[600px]';
    }
  };

  // Full interface
  return (
    <div 
      ref={containerRef}
      className={`fixed ${getContainerClasses()} z-50 ${themeClasses[currentTheme]} rounded-lg shadow-2xl border overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
      role="dialog"
      aria-labelledby="ai-assistant-title"
      aria-describedby="ai-assistant-description"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-opacity-80 backdrop-blur-sm">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className={`w-6 h-6 sm:w-8 sm:h-8 ${roleConfig.theme === 'student' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                                   roleConfig.theme === 'instructor' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                                   'bg-gradient-to-r from-purple-600 to-violet-600'
                                 } rounded-full flex items-center justify-center flex-shrink-0`}>
            <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="ai-assistant-title" className="font-semibold text-sm sm:text-base truncate">AI Assistant</h3>
            <div className="text-xs opacity-75 capitalize truncate">
              {viewportSize === 'mobile' ? currentRole : `${currentRole} • ${assistantMode}`}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Responsive controls */}
          {viewportSize !== 'mobile' && roleConfig.features.includes('voice') && (
            <button
              onClick={() => {}} // TODO: Implement voice toggle
              className={`p-2 rounded transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          )}
          
          {viewportSize !== 'mobile' && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Toggle conversation history"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {viewportSize !== 'mobile' && (
            <button
              onClick={toggleDocked}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label={isDocked ? 'Undock assistant' : 'Dock assistant'}
            >
              {isDocked ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={isFullscreen ? toggleFullscreen : toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
          </button>
          
          <button
            onClick={minimizeAssistant}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Minimize assistant"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={closeAssistant}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error/Warning Display */}
      {(error || warnings.length > 0) && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          {error && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={clearError} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {warnings.map(warning => (
            <div key={warning.id} className="text-xs text-yellow-700 mb-1">
              {warning.message}
            </div>
          ))}
          {warnings.length > 0 && (
            <button onClick={clearWarnings} className="text-xs text-blue-600 hover:underline">
              Clear warnings
            </button>
          )}
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex border-b bg-gray-50 overflow-x-auto">
        {roleConfig.primaryModes.map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              assistantMode === mode
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              {getModeIcon(mode)}
              <span className="capitalize">{mode}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for History/Settings */}
        {(showHistory || showSettings) && (
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            {showHistory && <ConversationHistory />}
            {showSettings && (
              <div className="space-y-4">
                <h4 className="font-medium">Settings</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Theme</label>
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value={roleConfig.theme}>{currentRole}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Personality</label>
                  <select 
                    value={assistantPersonality} 
                    onChange={(e) => setAssistantPersonality(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="adaptive">Adaptive</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-medium text-gray-900 mb-2">{getPersonalizedGreeting()}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  I'm here to help with your {currentRole === 'student' ? 'learning journey' : 
                                             currentRole === 'instructor' ? 'teaching tasks' : 
                                             'system management'}.
                </p>
                {autoSuggestions && smartSuggestions.length > 0 && (
                  <SmartSuggestions suggestions={smartSuggestions} onSelect={setCurrentMessage} />
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <ModernMessageBubble 
                key={message.id} 
                message={message} 
                role={currentRole}
                theme={currentTheme}
              />
            ))}
            
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Help Panel */}
          {contextualHelp.length > 0 && (
            <div className="border-t p-3 bg-blue-50">
              <ContextualHelp help={contextualHelp} />
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="space-y-3">
              {/* Quick Actions */}
              {suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestedActions.slice(0, 3).map((action, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentMessage(action.message)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Input Field */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder={`Ask me anything about ${currentRole === 'student' ? 'your learning' : 
                                                         currentRole === 'instructor' ? 'teaching' : 
                                                         'the system'}...`}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  {roleConfig.features.includes('voice') && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !currentMessage.trim()}
                  className={`p-3 rounded-lg transition-colors ${
                    isLoading || !currentMessage.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : `${roleConfig.theme === 'student' ? 'bg-blue-600 hover:bg-blue-700' :
                          roleConfig.theme === 'instructor' ? 'bg-green-600 hover:bg-green-700' :
                          'bg-purple-600 hover:bg-purple-700'} text-white`
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Insights Panel for Instructors/Admins */}
        {(currentRole === 'instructor' || currentRole === 'admin') && learningInsights && (
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <AIInsightsPanels insights={learningInsights} role={currentRole} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAIAssistant;
