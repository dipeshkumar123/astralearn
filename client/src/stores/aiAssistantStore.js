// Enhanced AI Assistant Store - Modern AI Interface with Real-time Data
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AIService from '../services/aiService';

export const useAIAssistantStore = create(
  subscribeWithSelector((set, get) => ({
    // UI State - Enhanced with modern features
    isOpen: false,
    isMinimized: false,
    isLoading: false,
    isTyping: false,
    isFullscreen: false,
    isDocked: false,
    theme: 'light', // 'light', 'dark', 'auto'
    
    // Chat State - Enhanced with conversation management
    conversations: [], // Multiple conversation threads
    activeConversationId: null,
    messages: [],
    currentMessage: '',
    messageHistory: [],
    quickReplies: [],
    
    // Context State - Real-time data integration
    currentContext: {
      page: 'home',
      userId: null,
      userRole: null, // 'student', 'instructor', 'admin'
      courseId: null,
      lessonId: null,
      moduleId: null,
      userProgress: {},
      learningStyle: null,
      sessionData: {},
      realTimeData: {
        currentPerformance: null,
        strugglingAreas: [],
        strengths: [],
        recommendations: []
      }
    },
    
    // Assistant State - Multi-modal capabilities
    assistantMode: 'chat', // 'chat', 'explain', 'feedback', 'debug', 'recommend', 'analyze'
    assistantPersonality: 'adaptive', // 'professional', 'friendly', 'adaptive'
    suggestedActions: [],
    smartSuggestions: [],
    contextualHelp: [],
    lastResponse: null,
    
    // Advanced Features
    voiceEnabled: false,
    isListening: false,
    speechSynthesis: false,
    autoSuggestions: true,
    
    // Error State - Enhanced error handling
    error: null,
    warnings: [],
    
    // Real-time Data Management
    unreadCount: 0,
    realTimeSync: true,
    syncInterval: null,
    lastSyncTimestamp: null,
    dataCache: {
      userProgress: null,
      courseData: null,
      analytics: null,
      recommendations: null
    },
    connectionStatus: 'connected', // 'connected', 'disconnected', 'syncing'
    
    // Analytics and Insights
    learningInsights: {
      strengths: [],
      improvementAreas: [],
      recommendations: [],
      progressTrends: [],
      studyPatterns: []
    },
    performanceMetrics: {
      completionRate: 0,
      averageScore: 0,
      timeSpent: 0,
      engagementLevel: 'medium'
    },
    
    // Enhanced Actions
    toggleAssistant: () => {
      const isCurrentlyOpen = get().isOpen;
      set((state) => ({ 
        isOpen: !state.isOpen,
        error: null,
        warnings: [],
        unreadCount: !state.isOpen ? 0 : state.unreadCount // Clear unread when opening
      }));
      
      // Start real-time sync when opening
      if (!isCurrentlyOpen) {
        get().startRealTimeSync();
      } else {
        get().stopRealTimeSync();
      }
    },
    
    minimizeAssistant: () => set({ isMinimized: true }),
    maximizeAssistant: () => set({ isMinimized: false }),
    toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
    toggleDocked: () => set((state) => ({ isDocked: !state.isDocked })),
    
    closeAssistant: () => set({ 
      isOpen: false, 
      isMinimized: false,
      isFullscreen: false,
      error: null,
      warnings: []
    }),
    
    setTheme: (theme) => set({ theme }),
    setLoading: (loading) => set({ isLoading: loading }),
    setTyping: (typing) => set({ isTyping: typing }),
    setCurrentMessage: (message) => set({ currentMessage: message }),
    setError: (error) => set({ error }),
    addWarning: (warning) => set((state) => ({ 
      warnings: [...state.warnings, { id: Date.now(), message: warning, timestamp: new Date() }]
    })),
    clearError: () => set({ error: null }),
    clearWarnings: () => set({ warnings: [] }),
    
    // Conversation Management
    createNewConversation: (title, type = 'general') => {
      const conversationId = `conv_${Date.now()}`;
      set((state) => ({
        conversations: [...state.conversations, {
          id: conversationId,
          title: title || `${type} Chat`,
          type,
          createdAt: new Date(),
          messages: [],
          context: { ...state.currentContext }
        }],
        activeConversationId: conversationId,
        messages: []
      }));
      return conversationId;
    },
    
    switchConversation: (conversationId) => {
      const conversation = get().conversations.find(c => c.id === conversationId);
      if (conversation) {
        set({
          activeConversationId: conversationId,
          messages: conversation.messages || [],
          currentContext: conversation.context || get().currentContext
        });
      }
    },
    
    deleteConversation: (conversationId) => set((state) => ({
      conversations: state.conversations.filter(c => c.id !== conversationId),
      activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId,
      messages: state.activeConversationId === conversationId ? [] : state.messages
    })),
    
    // Update context when user navigates or performs actions
    updateContext: (newContext) => set((state) => ({
      currentContext: {
        ...state.currentContext,
        ...newContext,
        timestamp: new Date().toISOString()
      }
    })),
    
    // Add message to chat
    addMessage: (message) => set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          ...message
        }
      ]
    })),
    
    // Clear chat history
    clearMessages: () => set({ messages: [] }),
    
    // Set assistant mode
    setAssistantMode: (mode) => set({ 
      assistantMode: mode,
      error: null 
    }),
    
    // Update suggested actions
    setSuggestedActions: (actions) => set({ suggestedActions: actions }),
    
    // Send chat message
    sendMessage: async (message) => {
      const state = get();
      
      if (!message.trim()) return;
      
      try {
        set({ isLoading: true, error: null });
        
        // Add user message
        get().addMessage({
          type: 'user',
          content: message,
          context: state.currentContext
        });
        
        // Clear current message
        set({ currentMessage: '' });
        
        // Include real-time context data in the request
        const contextWithRealTimeData = {
          ...state.currentContext,
          realTimeData: state.currentContext.realTimeData,
          userProgress: state.dataCache.userProgress,
          analytics: state.dataCache.analytics,
          learningInsights: state.learningInsights,
          performanceMetrics: state.performanceMetrics
        };
        
        // Send to AI service with enhanced context
        const response = await AIService.chat({
          message,
          context: contextWithRealTimeData,
          conversationHistory: state.messages.slice(-10), // Last 10 messages for context
          userPreferences: {
            personality: state.assistantPersonality,
            mode: state.assistantMode
          }
        });
        
        // Add AI response
        const aiMessage = {
          type: 'assistant',
          content: response.response,
          metadata: response.metadata || {},
          suggestions: response.suggestions || [],
          timestamp: new Date(),
          contextUsed: contextWithRealTimeData
        };
        
        get().addMessage(aiMessage);
        
        // If assistant is not open, increment unread count
        if (!state.isOpen) {
          get().incrementUnreadCount();
        }
        
        // Update suggested actions if provided
        if (response.suggestedActions) {
          set({ suggestedActions: response.suggestedActions });
        }
        
        // Update smart suggestions
        if (response.smartSuggestions) {
          set({ smartSuggestions: response.smartSuggestions });
        }
        
        set({ lastResponse: response });
        
      } catch (error) {
        console.error('Send message error:', error);
        set({ error: error.message });
        
        // Add error message
        get().addMessage({
          type: 'error',
          content: 'Sorry, I encountered an error. Please try again.',
          error: error.message
        });
      } finally {
        set({ isLoading: false });
      }
    },
    
    // Send streaming message (for typing effect)
    sendStreamingMessage: async (message) => {
      const state = get();
      
      if (!message.trim()) return;
      
      try {
        set({ isLoading: true, isTyping: true, error: null });
        
        // Add user message
        get().addMessage({
          type: 'user',
          content: message,
          context: state.currentContext
        });
        
        // Clear current message
        set({ currentMessage: '' });
        
        // Add placeholder for AI response
        const responseId = Date.now() + Math.random();
        get().addMessage({
          id: responseId,
          type: 'assistant',
          content: '',
          isStreaming: true
        });
        
        // Stream response
        await AIService.streamChat({
          message,
          context: state.currentContext,
          onChunk: (chunk, fullText) => {
            set((state) => ({
              messages: state.messages.map(msg => 
                msg.id === responseId 
                  ? { ...msg, content: fullText }
                  : msg
              )
            }));
          }
        });
        
        // Mark streaming as complete
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.id === responseId 
              ? { ...msg, isStreaming: false }
              : msg
          )
        }));
        
      } catch (error) {
        console.error('Streaming message error:', error);
        set({ error: error.message });
        
        // Add error message
        get().addMessage({
          type: 'error',
          content: 'Sorry, I encountered an error. Please try again.',
          error: error.message
        });
      } finally {
        set({ isLoading: false, isTyping: false });
      }
    },
    
    // Get recommendations based on current context
    getRecommendations: async () => {
      const state = get();
      
      try {
        set({ isLoading: true, error: null });
        
        const response = await AIService.getRecommendations({
          userId: state.currentContext.userId,
          context: state.currentContext
        });
        
        get().addMessage({
          type: 'assistant',
          content: response.response,
          recommendations: response.recommendations || [],
          metadata: { type: 'recommendations' }
        });
        
        return response;
        
      } catch (error) {
        console.error('Get recommendations error:', error);
        set({ error: error.message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    
    // Get explanation for content
    explainContent: async (content, level = 'intermediate') => {
      const state = get();
      
      try {
        set({ isLoading: true, error: null });
        
        const response = await AIService.explainContent({
          content,
          level,
          context: state.currentContext
        });
        
        get().addMessage({
          type: 'assistant',
          content: response.response,
          metadata: { type: 'explanation', content, level }
        });
        
        return response;
        
      } catch (error) {
        console.error('Explain content error:', error);
        set({ error: error.message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    
    // Get contextual suggestions
    getSuggestions: async (type = 'help') => {
      const state = get();
      
      try {
        const response = await AIService.getSuggestions({
          context: state.currentContext,
          type
        });
        
        set({ suggestedActions: response.suggestions || [] });
        
        return response;
        
      } catch (error) {
        console.error('Get suggestions error:', error);
        set({ error: error.message });
        throw error;
      }
    },
    
    // Execute suggested action
    executeSuggestedAction: async (action) => {
      const state = get();
      
      try {
        set({ isLoading: true, error: null });
        
        switch (action.type) {
          case 'chat':
            await get().sendMessage(action.message);
            break;
          case 'explain':
            await get().explainContent(action.content, action.level);
            break;
          case 'recommend':
            await get().getRecommendations();
            break;
          default:
            console.warn('Unknown action type:', action.type);
        }
        
      } catch (error) {
        console.error('Execute action error:', error);
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    },
    
    // Real-time Data Synchronization
    startRealTimeSync: () => {
      const state = get();
      if (state.syncInterval) {
        clearInterval(state.syncInterval);
      }
      
      const interval = setInterval(async () => {
        await get().syncRealTimeData();
      }, 30000); // Sync every 30 seconds
      
      set({ 
        syncInterval: interval,
        realTimeSync: true,
        connectionStatus: 'connected'
      });
    },
    
    stopRealTimeSync: () => {
      const { syncInterval } = get();
      if (syncInterval) {
        clearInterval(syncInterval);
        set({ 
          syncInterval: null,
          realTimeSync: false,
          connectionStatus: 'disconnected'
        });
      }
    },
    
    syncRealTimeData: async () => {
      const { currentContext } = get();
      if (!currentContext.userId) return;
      
      try {
        set({ connectionStatus: 'syncing' });
        
        const promises = [
          fetch(`/api/users/${currentContext.userId}/progress`),
          fetch(`/api/analytics/insights/${currentContext.userId}`),
          fetch(`/api/ai/recommendations/${currentContext.userId}`)
        ];
        
        const responses = await Promise.all(promises);
        const [progress, insights, recommendations] = await Promise.all(
          responses.map(r => r.ok ? r.json() : null)
        );
        
        set((state) => ({
          dataCache: {
            ...state.dataCache,
            userProgress: progress,
            analytics: insights,
            recommendations: recommendations
          },
          currentContext: {
            ...state.currentContext,
            realTimeData: {
              currentPerformance: insights?.performance,
              strugglingAreas: insights?.strugglingAreas || [],
              strengths: insights?.strengths || [],
              recommendations: recommendations?.items || []
            }
          },
          learningInsights: insights?.learningInsights || state.learningInsights,
          performanceMetrics: insights?.performance || state.performanceMetrics,
          lastSyncTimestamp: Date.now(),
          connectionStatus: 'connected'
        }));
        
      } catch (error) {
        console.error('Real-time sync error:', error);
        set({ 
          connectionStatus: 'disconnected',
          error: 'Failed to sync real-time data' 
        });
      }
    },
    
    // Unread Messages Management
    markAsRead: () => set({ unreadCount: 0 }),
    
    incrementUnreadCount: () => set((state) => ({ 
      unreadCount: state.unreadCount + 1 
    })),
  }))
);

// Subscribe to context changes to auto-generate suggestions
useAIAssistantStore.subscribe(
  (state) => state.currentContext,
  (context) => {
    // Debounce suggestions generation
    const timeoutId = setTimeout(() => {
      if (context.page && context.userId) {
        useAIAssistantStore.getState().getSuggestions('contextual');
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }
);

export default useAIAssistantStore;
