// Context Provider for AI Assistant
import React, { createContext, useContext, useEffect } from 'react';
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

  // Function to update AI context from anywhere in the app
  const setContext = (newContext) => {
    updateContext(newContext);
  };

  // Function to update user context
  const setUserContext = (userId, userProfile = {}) => {
    updateContext({
      userId,
      userProfile,
      learningStyle: userProfile.learningStyleAssessment?.dominantStyle,
      preferences: userProfile.learningPreferences
    });
  };

  // Function to update course/lesson context
  const setCourseContext = (courseId, lessonId = null, lessonData = {}) => {
    updateContext({
      courseId,
      lessonId,
      lessonData,
      page: lessonId ? 'lesson' : 'course'
    });
  };

  // Function to update progress context
  const setProgressContext = (progressData) => {
    updateContext({
      userProgress: progressData,
      lastActivity: new Date().toISOString()
    });
  };

  // Function to update page context
  const setPageContext = (page, data = {}) => {
    updateContext({
      page,
      pageData: data,
      timestamp: new Date().toISOString()
    });
  };

  // Function to add session data
  const addSessionData = (sessionData) => {
    updateContext({
      sessionData: {
        ...useAIAssistantStore.getState().currentContext.sessionData,
        ...sessionData
      }
    });
  };

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
    
    // For SPAs, we might need to listen to navigation events
    // This would depend on your routing setup
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const contextValue = {
    setContext,
    setUserContext,
    setCourseContext,
    setProgressContext,
    setPageContext,
    addSessionData
  };

  return (
    <AIContextContext.Provider value={contextValue}>
      {children}
    </AIContextContext.Provider>
  );
};

export default AIContextProvider;
