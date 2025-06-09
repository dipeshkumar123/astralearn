// AI Assistant Store - Zustand state management for AI interactions
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AIService from '../services/aiService';

export const useAIAssistantStore = create(
  subscribeWithSelector((set, get) => ({
    // UI State
    isOpen: false,
    isMinimized: false,
    isLoading: false,
    isTyping: false,
    
    // Chat State
    messages: [],
    currentMessage: '',
    
    // Context State
    currentContext: {
      page: 'home',
      userId: null,
      courseId: null,
      lessonId: null,
      userProgress: {},
      learningStyle: null,
      sessionData: {}
    },
    
    // Assistant State
    assistantMode: 'chat', // 'chat', 'suggestions', 'explanation', 'feedback'
    suggestedActions: [],
    lastResponse: null,
    
    // Error State
    error: null,
    
    // Actions
    toggleAssistant: () => set((state) => ({ 
      isOpen: !state.isOpen,
      error: null 
    })),
    
    minimizeAssistant: () => set({ isMinimized: true }),
    
    maximizeAssistant: () => set({ isMinimized: false }),
    
    closeAssistant: () => set({ 
      isOpen: false, 
      isMinimized: false,
      error: null 
    }),
    
    setLoading: (loading) => set({ isLoading: loading }),
    
    setTyping: (typing) => set({ isTyping: typing }),
    
    setCurrentMessage: (message) => set({ currentMessage: message }),
    
    setError: (error) => set({ error }),
    
    clearError: () => set({ error: null }),
    
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
        
        // Send to AI service
        const response = await AIService.chat({
          message,
          context: state.currentContext
        });
        
        // Add AI response
        get().addMessage({
          type: 'assistant',
          content: response.response,
          metadata: response.metadata || {},
          suggestions: response.suggestions || []
        });
        
        // Update suggested actions if provided
        if (response.suggestedActions) {
          set({ suggestedActions: response.suggestedActions });
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
    }
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
