/**
 * Data Synchronization Provider
 * Centralized state management for real-time data synchronization across all components
 * Eliminates mock data and ensures consistent, real-time data flow
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';

const DataSyncContext = createContext();

export const useDataSync = () => {
  const context = useContext(DataSyncContext);
  if (!context) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }
  return context;
};

export const DataSyncProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  
  // Centralized state for all real data
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [lessons, setLessons] = useState({});
  const [learningPaths, setLearningPaths] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    courses: false,
    progress: false,
    analytics: false,
    lessons: false,
    learningPaths: false,
    studyGroups: false,
    discussions: false,
    achievements: false,
    notifications: false
  });

  // Error states
  const [errors, setErrors] = useState({});

  const API_BASE = 'http://localhost:5000/api';

  // Helper function for API calls
  const apiCall = useCallback(async (endpoint, options = {}) => {
    if (!isAuthenticated || !token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }, [token, isAuthenticated]);

  // Set loading state for specific data type
  const setDataLoading = useCallback((dataType, isLoading) => {
    setLoading(prev => ({ ...prev, [dataType]: isLoading }));
  }, []);

  // Set error for specific data type
  const setDataError = useCallback((dataType, error) => {
    setErrors(prev => ({ ...prev, [dataType]: error }));
  }, []);

  // Clear error for specific data type
  const clearDataError = useCallback((dataType) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[dataType];
      return newErrors;
    });
  }, []);

  // Fetch courses with real data
  const fetchCourses = useCallback(async (refresh = false) => {
    if (!refresh && courses.length > 0) return courses;
    
    setDataLoading('courses', true);
    clearDataError('courses');
    
    try {
      const data = await apiCall('/courses');
      setCourses(data.courses || data);
      return data.courses || data;
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setDataError('courses', error.message);
      return [];
    } finally {
      setDataLoading('courses', false);
    }
  }, [apiCall, courses.length]);

  // Fetch user progress with real data
  const fetchUserProgress = useCallback(async (refresh = false) => {
    if (!refresh && Object.keys(userProgress).length > 0) return userProgress;
    
    setDataLoading('progress', true);
    clearDataError('progress');
    
    try {
      const data = await apiCall('/users/progress');
      setUserProgress(data.progress || data);
      return data.progress || data;
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      setDataError('progress', error.message);
      return {};
    } finally {
      setDataLoading('progress', false);
    }
  }, [apiCall, userProgress]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (refresh = false) => {
    if (!refresh && Object.keys(analytics).length > 0) return analytics;
    
    setDataLoading('analytics', true);
    clearDataError('analytics');
    
    try {
      const data = await apiCall('/analytics/summary');
      setAnalytics(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setDataError('analytics', error.message);
      return {};
    } finally {
      setDataLoading('analytics', false);
    }
  }, [apiCall, analytics]);

  // Fetch lessons for a course
  const fetchLessons = useCallback(async (courseId, refresh = false) => {
    if (!courseId) return [];
    
    if (!refresh && lessons[courseId]) return lessons[courseId];
    
    setDataLoading('lessons', true);
    clearDataError('lessons');
    
    try {
      const data = await apiCall(`/courses/${courseId}/lessons`);
      setLessons(prev => ({ ...prev, [courseId]: data.lessons || data }));
      return data.lessons || data;
    } catch (error) {
      console.error(`Failed to fetch lessons for course ${courseId}:`, error);
      setDataError('lessons', error.message);
      return [];
    } finally {
      setDataLoading('lessons', false);
    }
  }, [apiCall, lessons]);

  // Update lesson progress in real-time
  const updateLessonProgress = useCallback(async (courseId, lessonId, progressData) => {
    try {
      const data = await apiCall(`/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'POST',
        body: JSON.stringify(progressData)
      });

      // Update local state immediately for real-time UI updates
      setUserProgress(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          lessons: {
            ...prev[courseId]?.lessons,
            [lessonId]: progressData
          }
        }
      }));

      return data;
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
      throw error;
    }
  }, [apiCall]);

  // Complete a lesson with real-time updates
  const completeLesson = useCallback(async (courseId, lessonId, completionData) => {
    try {
      const data = await apiCall(`/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        body: JSON.stringify(completionData)
      });

      // Update multiple state pieces for real-time synchronization
      setUserProgress(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          completedLessons: [...(prev[courseId]?.completedLessons || []), lessonId],
          overallProgress: data.progress?.overallProgress || prev[courseId]?.overallProgress
        }
      }));

      // Refresh analytics data to reflect new completion
      fetchAnalytics(true);

      return data;
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      throw error;
    }
  }, [apiCall, fetchAnalytics]);

  // Enroll in a course with real-time updates
  const enrollInCourse = useCallback(async (courseId) => {
    try {
      const data = await apiCall(`/courses/${courseId}/enroll`, {
        method: 'POST'
      });

      // Update user progress and courses data immediately
      fetchUserProgress(true);
      fetchCourses(true);

      return data;
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      throw error;
    }
  }, [apiCall, fetchUserProgress, fetchCourses]);

  // Get course progress with real-time calculation
  const getCourseProgress = useCallback((courseId) => {
    const progress = userProgress[courseId];
    if (!progress) return { completed: 0, total: 0, percentage: 0 };

    const completed = progress.completedLessons?.length || 0;
    const total = progress.totalLessons || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [userProgress]);

  // Get real learning statistics
  const getLearningStats = useCallback(() => {
    const stats = {
      totalCoursesEnrolled: Object.keys(userProgress).length,
      totalLessonsCompleted: Object.values(userProgress).reduce(
        (sum, progress) => sum + (progress.completedLessons?.length || 0), 0
      ),
      totalTimeSpent: Object.values(userProgress).reduce(
        (sum, progress) => sum + (progress.totalTimeSpent || 0), 0
      ),
      averageProgress: Object.keys(userProgress).length > 0 
        ? Object.values(userProgress).reduce(
            (sum, progress) => sum + (progress.overallProgress || 0), 0
          ) / Object.keys(userProgress).length
        : 0,
      currentStreak: Math.max(
        ...Object.values(userProgress).map(p => p.currentStreak || 0), 0
      )
    };

    return stats;
  }, [userProgress]);

  // Generate course recommendations based on user progress and preferences
  const getRecommendations = useCallback(() => {
    if (!courses.length) return [];

    const enrolledCourseIds = Object.keys(userProgress);
    const availableCourses = courses.filter(course => 
      !enrolledCourseIds.includes(course._id) && !enrolledCourseIds.includes(course.id)
    );

    if (!availableCourses.length) return [];

    // Get user's enrolled course categories for preference matching
    const enrolledCategories = courses
      .filter(course => enrolledCourseIds.includes(course._id) || enrolledCourseIds.includes(course.id))
      .map(course => course.category)
      .filter(Boolean);

    // Score courses based on various factors
    const scoredCourses = availableCourses.map(course => {
      let score = 0;
      
      // Prefer courses in categories user has shown interest in
      if (enrolledCategories.includes(course.category)) {
        score += 5;
      }
      
      // Prefer courses with higher ratings
      if (course.rating) {
        score += course.rating;
      }
      
      // Prefer courses with more enrollments (popularity)
      if (course.enrollmentCount) {
        score += Math.min(course.enrollmentCount / 100, 3); // Max 3 points
      }
      
      // Prefer beginner-friendly courses if user is new
      if (enrolledCourseIds.length <= 2 && course.difficulty === 'beginner') {
        score += 2;
      }
      
      // Add consistency factor based on course rating and category match
      if (enrolledCategories.includes(course.category)) {
        score += 1.5;
      }
      
      return {
        ...course,
        score,
        reason: enrolledCategories.includes(course.category) 
          ? `Based on your interest in ${course.category}` 
          : course.difficulty === 'beginner' && enrolledCourseIds.length <= 2
            ? 'Perfect for getting started'
            : 'Popular with other learners',
        duration: course.duration || course.estimatedDuration || '4 hours'
      };
    });

    // Sort by score and return top recommendations
    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // Return top 6 recommendations
  }, [courses, userProgress]);

  // Initialize data when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch all essential data
      fetchCourses();      fetchUserProgress();
      fetchAnalytics();
    }
  }, [isAuthenticated, user]); // Remove function dependencies to prevent infinite loop

  // Real-time data sync interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncInterval = setInterval(() => {
      // Refresh critical data every 30 seconds
      if (typeof fetchUserProgress === 'function') {
        fetchUserProgress(true);
      }
      if (typeof fetchAnalytics === 'function') {
        fetchAnalytics(true);
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [isAuthenticated]); // Remove function dependencies to prevent infinite loop

  const value = {
    // Data
    courses,
    userProgress,
    analytics,
    lessons,
    learningPaths,
    studyGroups,
    discussions,
    achievements,
    notifications,

    // Loading states
    loading,

    // Error states
    errors,

    // Data fetchers
    fetchCourses,
    fetchUserProgress,
    fetchAnalytics,
    fetchLessons,

    // Data mutators
    updateLessonProgress,
    completeLesson,
    enrollInCourse,    // Data calculators
    getCourseProgress,
    getLearningStats,
    getRecommendations,

    // Utility functions
    clearDataError,
    setDataError,

    // Real-time indicators
    isDataSynced: Object.keys(errors).length === 0 && isAuthenticated,
    lastSyncTime: new Date()
  };

  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
};

export default DataSyncProvider;
