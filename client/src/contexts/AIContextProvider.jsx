// Context Provider for AI Assistant
import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useAIAssistantStore } from '../stores/aiAssistantStore';

const AIContextContext = createContext({});

export const useAIContext = () => {
  const context = useContext(AIContextContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
};

export const AIContextProvider = ({ children }) => {
  const { updateContext } = useAIAssistantStore();

  // Memoized functions to prevent recreation on every render
  const setContext = useCallback((newContext) => {
    updateContext(newContext);
  }, [updateContext]);

  const setUserContext = useCallback((userId, userProfile = {}) => {
    updateContext({
      userId,
      userProfile,
      learningStyle: userProfile.learningStyleAssessment?.dominantStyle,
      preferences: userProfile.learningPreferences
    });
  }, [updateContext]);

  const setCourseContext = useCallback((courseId, lessonId = null, lessonData = {}) => {
    updateContext({
      courseId,
      lessonId,
      lessonData,
      page: lessonId ? 'lesson' : 'course'
    });
  }, [updateContext]);

  const setProgressContext = useCallback((progressData) => {
    updateContext({
      userProgress: progressData,
      lastActivity: new Date().toISOString()
    });
  }, [updateContext]);
  // Function to update page context
  const setPageContext = useCallback((page, data = {}) => {
    updateContext({
      page,
      pageData: data,
      timestamp: new Date().toISOString()
    });
  }, [updateContext]);

  // Function to add session data
  const addSessionData = useCallback((sessionData) => {
    const currentState = useAIAssistantStore.getState();
    updateContext({
      sessionData: {
        ...currentState.currentContext.sessionData,
        ...sessionData
      }
    });
  }, [updateContext]);

  // Auto-update context based on URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const page = path.split('/')[1] || 'home';
      
      setPageContext(page, {
        fullPath: path,
        timestamp: new Date().toISOString()
      });
    };

    // Initial context update
    handleLocationChange();

    // Listen for navigation changes
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [setPageContext]); // Add setPageContext to dependencies

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    setContext,
    setUserContext,
    setCourseContext,
    setProgressContext,
    setPageContext,
    addSessionData
  }), [setContext, setUserContext, setCourseContext, setProgressContext, setPageContext, addSessionData]);

  return (
    <AIContextContext.Provider value={contextValue}>
      {children}
    </AIContextContext.Provider>
  );
};

export default AIContextProvider;
