import { useState, useEffect } from 'react'
import './App.css'
import AIAssistant from './components/ai/AIAssistant'
import AIContextProvider from './contexts/AIContextProvider'
import DemoLearningEnvironment from './components/demo/DemoLearningEnvironment'
import CourseManagementDashboard from './components/course/CourseManagementDashboard'
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
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, logout, isAuthenticated, loading, isDemoMode } = useAuth();
  useEffect(() => {
    checkServerStatus();
  }, []);

  // Show login modal if not authenticated and not loading
  useEffect(() => {
    if (!loading && !isAuthenticated && !showLogin && !showRegister) {
      setShowLogin(true);
    }
  }, [loading, isAuthenticated, showLogin, showRegister]);

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
  };  const renderCurrentView = () => {
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
    if (!isAuthenticated) {
      return (
        <LandingPage 
          onShowLogin={() => setShowLogin(true)}
          onShowRegister={() => setShowRegister(true)}
        />
      );
    }    // Authenticated user views
    switch (currentView) {
      case 'demo':
        return <DemoLearningEnvironment onBackToStatus={() => setCurrentView('dashboard')} />;
      case 'course-management':
        return <CourseManagementDashboard onBackToStatus={() => setCurrentView('dashboard')} />;
      case 'adaptive-learning':
        return <AdaptiveLearningDashboard userId={user.id} onBackToMain={() => setCurrentView('dashboard')} />;
      case 'gamification':
        return <GamificationDashboard onBackToMain={() => setCurrentView('dashboard')} />;
      case 'social-learning':
        return <SocialDashboard onBackToMain={() => setCurrentView('dashboard')} />;
      case 'dashboard':
      default:
        return <RoleBasedDashboard />;
    }
  };  return (
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
                  </div>
                  
                  {/* Navigation for specific views */}
                  {currentView !== 'dashboard' && (
                    <nav className="hidden md:flex space-x-6">
                      <button
                        onClick={() => setCurrentView('dashboard')}
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => setCurrentView('demo')}
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        AI Demo
                      </button>
                      {(user.role === 'instructor' || user.role === 'admin') && (
                        <button
                          onClick={() => setCurrentView('course-management')}
                          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Course Management
                        </button>
                      )}
                      <button
                        onClick={() => setCurrentView('adaptive-learning')}
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Adaptive Learning
                      </button>
                      <button
                        onClick={() => setCurrentView('gamification')}
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Gamification
                      </button>
                      <button
                        onClick={() => setCurrentView('social-learning')}
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Social Learning
                      </button>
                    </nav>
                  )}
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
            onClose={() => setShowLogin(false)}
            switchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}

        {showRegister && (
          <RegisterForm
            onClose={() => setShowRegister(false)}
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
