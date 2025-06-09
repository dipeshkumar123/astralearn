// Lesson-specific AI Triggers Hook
import { useEffect, useRef } from 'react';
import { useAIAssistantStore } from '../stores/aiAssistantStore';
import { useAIContext } from '../contexts/AIContextProvider';

export const useAITriggers = ({ 
  userId, 
  courseId, 
  lessonId, 
  lessonContent = {},
  userProgress = {},
  autoTriggers = true 
}) => {
  const { 
    setSuggestedActions, 
    addMessage, 
    isOpen 
  } = useAIAssistantStore();
  
  const { 
    setUserContext, 
    setCourseContext, 
    setProgressContext,
    addSessionData 
  } = useAIContext();
  
  const lastTriggerRef = useRef(null);
  const sessionStartTime = useRef(Date.now());
  const interactionCount = useRef(0);

  // Update contexts when props change
  useEffect(() => {
    if (userId) {
      setUserContext(userId);
    }
  }, [userId, setUserContext]);

  useEffect(() => {
    if (courseId) {
      setCourseContext(courseId, lessonId, lessonContent);
    }
  }, [courseId, lessonId, lessonContent, setCourseContext]);

  useEffect(() => {
    if (userProgress) {
      setProgressContext(userProgress);
    }
  }, [userProgress, setProgressContext]);

  // Track lesson engagement
  useEffect(() => {
    if (lessonId) {
      addSessionData({
        sessionStartTime: sessionStartTime.current,
        lessonStartTime: Date.now(),
        interactionCount: interactionCount.current
      });
    }
  }, [lessonId, addSessionData]);

  // Auto-trigger suggestions based on user behavior
  useEffect(() => {
    if (!autoTriggers || !lessonId) return;

    const triggerTimeout = setTimeout(() => {
      // Generate contextual suggestions based on lesson content and progress
      const suggestions = generateLessonSuggestions({
        lessonContent,
        userProgress,
        sessionDuration: Date.now() - sessionStartTime.current
      });

      if (suggestions.length > 0) {
        setSuggestedActions(suggestions);
      }
    }, 10000); // Trigger after 10 seconds of lesson activity

    return () => clearTimeout(triggerTimeout);
  }, [lessonId, autoTriggers, lessonContent, userProgress, setSuggestedActions]);

  // Difficulty detection and assistance
  useEffect(() => {
    if (!userProgress || !lessonId) return;

    const performance = userProgress.performance || 0;
    const timeSpent = userProgress.timeSpent || 0;
    const attempts = userProgress.attempts || 0;

    // Trigger help if user is struggling
    if (performance < 60 && attempts > 2 && timeSpent > 300000) { // 5 minutes
      const now = Date.now();
      
      // Prevent too frequent triggers
      if (!lastTriggerRef.current || now - lastTriggerRef.current > 300000) { // 5 minutes
        triggerDifficultyAssistance(performance, attempts, timeSpent);
        lastTriggerRef.current = now;
      }
    }
  }, [userProgress]);

  // Manual trigger functions
  const triggerExplanation = (content, level = 'intermediate') => {
    interactionCount.current++;
    addMessage({
      type: 'system',
      content: `🤖 Explaining: ${content}`,
      metadata: { trigger: 'manual_explanation', level }
    });
    
    setSuggestedActions([
      {
        type: 'explain',
        label: 'Get detailed explanation',
        content,
        level
      }
    ]);
  };

  const triggerFeedback = (userAnswer, correctAnswer) => {
    interactionCount.current++;
    setSuggestedActions([
      {
        type: 'feedback',
        label: 'Get personalized feedback',
        userResponse: userAnswer,
        correctAnswer
      }
    ]);
  };

  const triggerRecommendations = (type = 'general') => {
    interactionCount.current++;
    setSuggestedActions([
      {
        type: 'recommend',
        label: 'Get recommendations',
        recommendationType: type
      }
    ]);
  };

  const triggerStudyPlan = (goals = [], timeAvailable = 60) => {
    interactionCount.current++;
    setSuggestedActions([
      {
        type: 'chat',
        label: 'Create study plan',
        message: `Help me create a study plan. Goals: ${goals.join(', ')}. Time available: ${timeAvailable} minutes.`
      }
    ]);
  };

  // Helper function to generate lesson-specific suggestions
  const generateLessonSuggestions = ({ lessonContent, userProgress, sessionDuration }) => {
    const suggestions = [];
    const performance = userProgress.performance || 0;

    // Performance-based suggestions
    if (performance > 80) {
      suggestions.push({
        type: 'recommend',
        label: 'Advanced topics',
        message: 'Great job! Ready for more advanced concepts?'
      });
    } else if (performance < 60) {
      suggestions.push({
        type: 'explain',
        label: 'Need help?',
        message: 'Having trouble? Let me explain this differently.'
      });
    }

    // Time-based suggestions
    if (sessionDuration > 1800000) { // 30 minutes
      suggestions.push({
        type: 'chat',
        label: 'Take a break?',
        message: "You've been studying for a while. Want to review what you've learned?"
      });
    }

    // Content-based suggestions
    if (lessonContent.hasQuiz) {
      suggestions.push({
        type: 'chat',
        label: 'Practice quiz',
        message: 'Ready to test your understanding with a practice quiz?'
      });
    }

    if (lessonContent.hasVideo) {
      suggestions.push({
        type: 'explain',
        label: 'Video summary',
        message: 'Want me to summarize the key points from the video?'
      });
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  // Helper function to trigger difficulty assistance
  const triggerDifficultyAssistance = (performance, attempts, timeSpent) => {
    addMessage({
      type: 'assistant',
      content: `I notice you might be having some difficulty with this lesson. You've spent ${Math.round(timeSpent / 60000)} minutes and made ${attempts} attempts with a ${performance}% success rate. Would you like me to help explain the concepts differently or suggest a different approach?`,
      metadata: { 
        trigger: 'difficulty_detection',
        performance,
        attempts,
        timeSpent
      }
    });

    setSuggestedActions([
      {
        type: 'explain',
        label: 'Explain differently',
        message: 'Please explain this concept using a different approach'
      },
      {
        type: 'recommend',
        label: 'Alternative resources',
        message: 'Suggest alternative learning resources for this topic'
      },
      {
        type: 'chat',
        label: 'Get help',
        message: 'I need personalized help with this lesson'
      }
    ]);
  };

  return {
    triggerExplanation,
    triggerFeedback,
    triggerRecommendations,
    triggerStudyPlan,
    interactionCount: interactionCount.current,
    sessionDuration: Date.now() - sessionStartTime.current
  };
};

export default useAITriggers;
