import { useState, useEffect, useCallback } from 'react'
import './App.css'
import AIAssistant from './components/ai/AIAssistant'
import AIContextProvider from './contexts/AIContextProvider'
import DemoLearningEnvironment from './components/demo/DemoLearningEnvironment'
import CourseManagementDashboard from './components/course/CourseManagementDashboard'
import CoursePreview from './components/course/CoursePreview'
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
  const { user, logout, isAuthenticated, loading, isDemoMode, token } = useAuth();
  useEffect(() => {
    checkServerStatus();
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
  };  // Load course data when needed for preview/detail views
  const loadCourseData = useCallback(async (courseId) => {
    try {
      console.log('Loading course data for:', courseId);
        // Try course-management endpoint first for full hierarchy
      let response = await fetch(`/api/course-management/${courseId}/hierarchy?includeContent=true`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Course hierarchy loaded:', data.course?.title);
        setSelectedCourse(data.course);
        return data.course;
      }
      
      // Fallback to basic courses endpoint
      console.log('Falling back to basic course endpoint');
      response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both response formats
        const courseData = data.course || data;
        console.log('Basic course loaded:', courseData?.title);
        setSelectedCourse(courseData);
        return courseData;
      } else {
        console.error('Failed to load course:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error loading course:', error);
      return null;
    }
  }, [token]);const renderCurrentView = () => {
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
      case 'demo':
        return <DemoLearningEnvironment onBackToStatus={() => setCurrentView('dashboard')} />;
      case 'course-management':
        return <CourseManagementDashboard onBackToStatus={() => setCurrentView('dashboard')} />;
      case 'course-preview':
        return (
          <CoursePreviewWrapper 
            courseId={selectedCourseId} 
            onBack={() => setCurrentView('dashboard')}
            loadCourseData={loadCourseData}
          />
        );
      case 'course-detail':
        return (
          <CourseDetailWrapper 
            courseId={selectedCourseId} 
            onBack={() => setCurrentView('dashboard')}
            loadCourseData={loadCourseData}
          />
        );      case 'adaptive-learning':
        // Pass userRole for student, instructor, admin access levels
        return <AdaptiveLearningDashboard userId={user.id} userRole={user.role} onBackToMain={() => setCurrentView('dashboard')} />;case 'gamification':
        return <GamificationDashboard userRole={user.role} onBackToMain={() => setCurrentView('dashboard')} />;      case 'social-learning':
        return <SocialDashboard userRole={user.role} onBackToMain={() => setCurrentView('dashboard')} />;      case 'dashboard':
      default:
        // Pass setCurrentView as prop for navigation functionality
        return <RoleBasedDashboard setCurrentView={(view) => {
          // Extract course ID from localStorage when navigating to course views
          if (view === 'course-preview' || view === 'course-detail') {
            const courseId = localStorage.getItem('selectedCourseId');
            setSelectedCourseId(courseId);
          }
          setCurrentView(view);
        }} />;
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
                      
                      {/* AI Demo - Available to all roles */}
                      <button
                        onClick={() => setCurrentView('demo')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentView === 'demo' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        AI Demo
                      </button>                      {/* Course Management - Only for instructors and admins */}
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
                    {isDemoMode && (
                      <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Demo
                      </span>
                    )}
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
        
        {/* AI Assistant - Always available for authenticated users */}
        {isAuthenticated && <AIAssistant />}
      </div>
    </AIContextProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App

// Course Preview Wrapper Component
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
  }, [courseId]); // Removed loadCourseData and onBack from dependencies

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
  }, [courseId]); // Removed loadCourseData and onBack from dependencies

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
