import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './App.css'
import EnhancedAIAssistant from './components/ai/EnhancedAIAssistant'
import AIToggleButton from './components/ai/AIToggleButton'
import AIContextProvider from './contexts/AIContextProvider'
import DataSyncProvider, { useDataSync } from './contexts/DataSyncProvider'
import CourseManagementDashboard from './components/course/CourseManagementDashboard'
import CoursePreview from './components/course/CoursePreview'
import ModernCoursePreview from './components/course/ModernCoursePreview'
import RedesignedCoursePreview from './components/course/RedesignedCoursePreview'
import ModernLessonPage from './components/course/ModernLessonPage'
import ModernLessonCompletion from './components/course/ModernLessonCompletion'
import SimplifiedLessonLoader from './components/course/SimplifiedLessonLoader'
import LessonErrorBoundary from './components/course/LessonErrorBoundary'
import CourseLearningEnvironment from './components/course/CourseLearningEnvironment'
import AdaptiveLearningDashboard from './components/adaptive/AdaptiveLearningDashboard'
import GamificationDashboard from './components/gamification/GamificationDashboard'
import SocialDashboard from './components/social/SocialDashboard'
import AuthProvider, { useAuth } from './components/auth/AuthProvider'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard'
import LandingPage from './components/LandingPage'

// Main App Content Component
function AppContent() {  const [serverStatus, setServerStatus] = useState('checking');
  const [serverInfo, setServerInfo] = useState(null);  const [currentView, setCurrentView] = useState('status');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userDismissedAuth, setUserDismissedAuth] = useState(false);
  const { user, logout, isAuthenticated, loading, token } = useAuth();
  useEffect(() => {
    checkServerStatus();
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setCurrentView('dashboard');
  }, []);

  const handleCoursePreviewBack = useCallback((destination) => {
    if (destination === 'course-detail') {
      setCurrentView('course-detail');
    } else {
      setCurrentView('dashboard');
    }
  }, []);

  // Show login modal if not authenticated and not loading
  useEffect(() => {
    if (!loading && !isAuthenticated && !showLogin && !showRegister && !userDismissedAuth) {
      setShowLogin(true);
    }
  }, [loading, isAuthenticated, showLogin, showRegister, userDismissedAuth]);
  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      setServerStatus('connected');
      setServerInfo(data);
    } catch (error) {
      setServerStatus('disconnected');
      setServerInfo(null);
    }
  };  // Simplified course data loading with better error handling
  const loadCourseData = useCallback(async (courseId) => {
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      console.error('Invalid course ID provided:', courseId);
      return null;
    }

    try {
      console.log('Loading course data for:', courseId);
      
      // Try course-management endpoint first
      const response = await fetch(`/api/course-management/${courseId}/hierarchy?includeContent=true`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.course) {
          console.log('Course hierarchy loaded:', data.course.title);
          setSelectedCourse(data.course);
          return data.course;
        }
      }
      
      // Fallback to basic courses endpoint
      console.log('Falling back to basic course endpoint');
      const fallbackResponse = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token') || ''}`
        }
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const courseData = fallbackData.course || fallbackData;
        console.log('Basic course loaded:', courseData?.title);
        setSelectedCourse(courseData);
        return courseData;
      }
      
      console.error('Failed to load course from both endpoints:', response.status, fallbackResponse.status);
      return null;
    } catch (error) {
      console.error('Error loading course:', error);
      return null;
    }
  }, [token]); // Stable dependency

  const renderCurrentView = () => {
    // Show loading while authentication is being checked
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AstraLearn...</p>
          </div>
        </div>
      );
    }    // If not authenticated, show landing page with authentication options
    if (!isAuthenticated) {      return (
        <LandingPage 
          onShowLogin={() => {
            setUserDismissedAuth(false);
            setShowLogin(true);
          }}
          onShowRegister={() => {
            setUserDismissedAuth(false);
            setShowRegister(true);
          }}
        />
      );
    }    // Authenticated user views
    switch (currentView) {
      case 'course-management':
        return <CourseManagementDashboard onBackToStatus={() => setCurrentView('dashboard')} />;      case 'course-preview':
        // Check if we have a valid course ID
        if (!selectedCourseId || selectedCourseId === 'undefined' || selectedCourseId === 'null') {
          console.error('No valid course ID for preview, redirecting to dashboard');
          setCurrentView('dashboard');
          return renderCurrentView();
        }
        return (
          <ModernCoursePreviewWrapper 
            courseId={selectedCourseId} 
            onBack={handleCoursePreviewBack}
            loadCourseData={loadCourseData}
          />
        );
      case 'course-detail':
        // Check if we have a valid course ID
        if (!selectedCourseId || selectedCourseId === 'undefined' || selectedCourseId === 'null') {
          console.error('No valid course ID for detail, redirecting to dashboard');
          setCurrentView('dashboard');
          return renderCurrentView();
        }
        return (
          <LessonErrorBoundary onBack={handleBackToDashboard}>
            <ModernLessonWrapper 
              courseId={selectedCourseId} 
              onBack={handleBackToDashboard}
              loadCourseData={loadCourseData}
            />
          </LessonErrorBoundary>
        );case 'adaptive-learning':
        // Pass userRole for student, instructor, admin access levels
        return <AdaptiveLearningDashboard userId={user.id} userRole={user.role} onBackToMain={() => setCurrentView('dashboard')} />;case 'gamification':
        return <GamificationDashboard userRole={user.role} onBackToMain={() => setCurrentView('dashboard')} />;      case 'social-learning':
        return <SocialDashboard userRole={user.role} onBackToMain={() => setCurrentView('dashboard')} />;      case 'dashboard':
      default:        // Pass setCurrentView as prop for navigation functionality
        return <RoleBasedDashboard setCurrentView={handleViewChange} />;
    }
  };  // Handle custom navigation events from dashboard
  useEffect(() => {
    const handleNavigateToCourse = (event) => {
      const { view, courseId } = event.detail;
      setSelectedCourseId(courseId);
      setCurrentView(view);
    };

    window.addEventListener('navigateToCourse', handleNavigateToCourse);
    
    return () => {
      window.removeEventListener('navigateToCourse', handleNavigateToCourse);
    };
  }, []);

  // Also handle navigation changes in the main setCurrentView function
  const handleViewChange = useCallback((view, options = {}) => {
    // Extract course ID from localStorage when navigating to course views
    if (view === 'course-preview' || view === 'course-detail') {
      const courseId = options.courseId || localStorage.getItem('selectedCourseId');
      
      // Validate courseId before setting it
      if (!courseId || courseId === 'undefined' || courseId === 'null') {
        console.error('Invalid course ID detected:', courseId);
        // Fallback to dashboard if no valid course ID
        setCurrentView('dashboard');
        return;
      }
      
      setSelectedCourseId(courseId);
      // Preload course data to ensure it exists
      loadCourseData(courseId).then(courseData => {
        if (!courseData) {
          console.error('Course not found, redirecting to dashboard');
          setCurrentView('dashboard');
        }
      });
    }
    setCurrentView(view);
  }, [loadCourseData]);

  return (
    <AIContextProvider>
      <div className="min-h-screen bg-gray-50">
        {/* User Authentication Status */}
        {user && (
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-blue-600">🌟 AstraLearn</span>
                  </div>                    {/* Navigation - Always show but highlight current view */}
                    <nav className="hidden md:flex space-x-6">
                      <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentView === 'dashboard' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Dashboard
                      </button>
                      
                      {/* Course Management - Only for instructors and admins */}
                      {(user.role === 'instructor' || user.role === 'admin') && ( // course-management access
                        <button
                          onClick={() => setCurrentView('course-management')}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentView === 'course-management' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Course Management
                        </button>
                      )}
                      
                      {/* Adaptive Learning - Available to all roles but customized per role */}
                      <button
                        onClick={() => setCurrentView('adaptive-learning')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentView === 'adaptive-learning' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {user.role === 'student' ? 'My Learning Path' : 
                         user.role === 'instructor' ? 'Student Analytics' : 
                         'Learning Analytics'}
                      </button>
                      
                      {/* Gamification - Students and Instructors only */}
                      {(user.role === 'student' || user.role === 'instructor') && (
                        <button
                          onClick={() => setCurrentView('gamification')}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentView === 'gamification' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {user.role === 'student' ? 'Achievements' : 'Student Engagement'}
                        </button>
                      )}
                          {/* Social Learning - Primarily for students */}
                      {user.role === 'student' && ( // Social Learning for students
                        <button
                          onClick={() => setCurrentView('social-learning')}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentView === 'social-learning' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Social Learning
                        </button>
                      )}
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {user.firstName} {user.lastName}
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {user.role}
                    </span>
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderCurrentView()}
          {/* Authentication Forms */}
        {showLogin && (
          <LoginForm
            onClose={() => {
              setShowLogin(false);
              setUserDismissedAuth(true);
            }}
            switchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}

        {showRegister && (
          <RegisterForm
            onClose={() => {
              setShowRegister(false);
              setUserDismissedAuth(true);
            }}
            switchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        )}
        
        {/* Enhanced AI Assistant - Always available for authenticated users */}
        {isAuthenticated && <EnhancedAIAssistant />}
      </div>
    </AIContextProvider>
  )
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <DataSyncProvider>
          <AIContextProvider>
            <AppContent />
          </AIContextProvider>
        </DataSyncProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Modern Course Preview Wrapper Component
const ModernCoursePreviewWrapper = ({ courseId, onBack, loadCourseData }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    let isCancelled = false;

    const loadCourse = async () => {
      const targetCourseId = courseId || localStorage.getItem('selectedCourseId');
      
      if (targetCourseId) {
        setLoading(true);
        
        try {
          const courseData = await loadCourseData(targetCourseId);
          if (isCancelled) return;
          
          setCourse(courseData);
          
          // Check enrollment status only once per component mount
          if (user && courseData) {
            try {
              const response = await fetch('/api/courses/my/enrolled', {
                headers: {
                  'Authorization': `Bearer ${token || localStorage.getItem('token')}`
                }
              });
              if (response.ok && !isCancelled) {
                const data = await response.json();
                const enrollment = data.enrolledCourses?.find(
                  e => e.course?._id === targetCourseId
                );
                if (enrollment) {
                  setIsEnrolled(true);
                  setUserProgress(enrollment.progressData);
                } else {
                  setIsEnrolled(false);
                  setUserProgress(null);
                }
              }
            } catch (error) {
              console.error('Error checking enrollment:', error);
            }
          }
        } catch (error) {
          console.error('Error loading course:', error);
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      } else {
        console.error('No course ID provided for preview');
        onBack();
      }
    };

    loadCourse();

    return () => {
      isCancelled = true;
    };
  }, [courseId, user?.id, token, loadCourseData]); // Include loadCourseData to ensure it reloads when token changes

  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsEnrolled(true);
        // Optionally reload course data to get updated enrollment info
        return true;
      } else {
        console.error('Enrollment failed');
        return false;
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return false;
    }
  };

  const handleBackNavigation = (destination) => {
    if (destination === 'learning') {
      // Navigate to learning environment
      localStorage.setItem('selectedCourseId', course._id);
      // Use a custom event to trigger navigation to course-detail
      window.dispatchEvent(new CustomEvent('navigateToCourse', {
        detail: { view: 'course-detail', courseId: course._id }
      }));
    } else {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <button 
            onClick={() => onBack()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  return (
    <RedesignedCoursePreview
      course={course}
      userProgress={userProgress}
      isEnrolled={isEnrolled}
      onEnroll={handleEnroll}
      onBack={handleBackNavigation}
    />
  );
};

// Simplified Modern Lesson Page Wrapper - Fixed for infinite loading
const ModernLessonWrapper = ({ courseId, onBack, loadCourseData }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const { getCourseProgress, updateLessonProgress } = useDataSync();

  // Simple, one-time course loading with timeout protection
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const loadCourse = async () => {
      const targetCourseId = courseId || localStorage.getItem('selectedCourseId');
      
      if (!targetCourseId) {
        console.error('No course ID provided for lesson');
        onBack();
        return;
      }

      setLoading(true);
      setError(null);

      // Set timeout to prevent hanging
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setError('Course loading timeout - please try again');
          setLoading(false);
        }
      }, 10000);

      try {
        console.log('📚 Loading course for lessons:', targetCourseId);
        const courseData = await loadCourseData(targetCourseId);
        
        if (!isMounted) return;
        
        clearTimeout(timeoutId);
        
        if (courseData) {
          console.log('✅ Course loaded successfully for lessons:', courseData.title);
          console.log('📚 Course structure:', {
            title: courseData.title,
            hasModules: !!courseData.modules,
            modulesCount: courseData.modules?.length || 0,
            modules: courseData.modules?.map(m => ({
              title: m.title,
              lessonsCount: m.lessons?.length || 0
            })) || []
          });
          setCourse(courseData);
          
          // Set marker to indicate lesson view is active
          document.body.setAttribute('data-lesson-active', 'true');
        } else {
          console.error('❌ No course data returned from loadCourseData');
          setError('Course not found');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading course for lessons:', error);
          setError('Failed to load course');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCourse();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      // Remove lesson view marker
      document.body.removeAttribute('data-lesson-active');
    };
  }, [courseId]); // Only depend on courseId to prevent loops

  // Simplified progress access
  const courseProgress = course?._id ? getCourseProgress(course._id) : {};

  const handleLessonComplete = async (lessonId, moduleIndex, lessonIndex) => {
    try {
      if (course?._id && updateLessonProgress) {
        await updateLessonProgress(course._id, lessonId, {
          moduleIndex,
          lessonIndex,
          completed: true
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleNavigateToLesson = (moduleIndex, lessonIndex) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(lessonIndex);
  };

  const handleNextLesson = (moduleIndex, lessonIndex) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(lessonIndex);
  };

  const handlePreviousLesson = (moduleIndex, lessonIndex) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(lessonIndex);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
          >
            Retry
          </button>
          <button 
            onClick={() => onBack()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <button 
            onClick={() => onBack()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  return (
    <SimplifiedLessonLoader
      course={course}
      currentModule={currentModule}
      currentLesson={currentLesson}
      userProgress={courseProgress}
      onBack={() => onBack()}
      onLessonComplete={handleLessonComplete}
      onNextLesson={handleNextLesson}
      onPreviousLesson={handlePreviousLesson}
      onNavigateToLesson={handleNavigateToLesson}
    />
  );
};

// Legacy Course Preview Wrapper Component (kept for backward compatibility)
const CoursePreviewWrapper = ({ courseId, onBack, loadCourseData }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadCourse = async () => {
      // First try to get courseId from localStorage if not provided
      const targetCourseId = courseId || localStorage.getItem('selectedCourseId');
      
      if (targetCourseId) {
        setLoading(true);
        const courseData = await loadCourseData(targetCourseId);
        setCourse(courseData);
        setLoading(false);
      } else {
        console.error('No course ID provided for preview');
        onBack();
      }
    };

    loadCourse();
  }, [courseId, loadCourseData]); // Include loadCourseData dependency

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <CoursePreview
      course={course}
      isVisible={true}
      mode="student"
      onClose={onBack}
    />
  );
};

// Course Detail Wrapper Component (for enrolled courses)
const CourseDetailWrapper = ({ courseId, onBack, loadCourseData }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadCourse = async () => {
      // First try to get courseId from localStorage if not provided
      const targetCourseId = courseId || localStorage.getItem('selectedCourseId');
      
      if (targetCourseId) {
        setLoading(true);
        const courseData = await loadCourseData(targetCourseId);
        setCourse(courseData);
        setLoading(false);
      } else {
        console.error('No course ID provided for course detail');
        onBack();
      }
    };

    loadCourse();
  }, [courseId, loadCourseData]); // Include loadCourseData dependency

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <CoursePreview
      course={course}
      isVisible={true}
      mode="student"
      onClose={onBack}
    />
  );
};

export default App;
