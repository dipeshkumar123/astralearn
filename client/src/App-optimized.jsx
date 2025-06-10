/**
 * Optimized App Component with Lazy Loading and Code Splitting
 * Part of Phase 3 Step 3: Production Optimization & Advanced Features
 */

import { useState, useEffect } from 'react'
import './App.css'
import { createLazyComponent, preloadComponent, logBundleInfo } from './utils/lazyLoader'
import AuthProvider, { useAuth } from './components/auth/AuthProvider'
import AIContextProvider from './contexts/AIContextProvider'

// Lazy load major components with code splitting
const AIAssistant = createLazyComponent(
  () => import('./components/ai/AIAssistant'),
  {
    fallback: <div className="fixed bottom-4 right-4 w-16 h-16 bg-blue-600 rounded-full animate-pulse"></div>
  }
);

const DemoLearningEnvironment = createLazyComponent(
  () => import('./components/demo/DemoLearningEnvironment'),
  {
    fallback: <div className="min-h-screen bg-gray-50 animate-pulse"></div>
  }
);

const CourseManagementDashboard = createLazyComponent(
  () => import('./components/course/CourseManagementDashboard'),
  {
    fallback: <div className="min-h-screen bg-gray-50 animate-pulse"></div>
  }
);

const AdaptiveLearningDashboard = createLazyComponent(
  () => import('./components/adaptive/AdaptiveLearningDashboard'),
  {
    fallback: <div className="min-h-screen bg-gray-50 animate-pulse"></div>
  }
);

const LoginForm = createLazyComponent(
  () => import('./components/auth/LoginForm'),
  {
    fallback: <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg animate-pulse w-96 h-64"></div>
    </div>
  }
);

const RegisterForm = createLazyComponent(
  () => import('./components/auth/RegisterForm'),
  {
    fallback: <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg animate-pulse w-96 h-64"></div>
    </div>
  }
);

// Main App Content Component
function AppContent() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverInfo, setServerInfo] = useState(null);
  const [currentView, setCurrentView] = useState('status');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);
  const { user, logout, isDemoMode } = useAuth();

  useEffect(() => {
    checkServerStatus();
    initializeOptimizations();
  }, []);

  // Preload components based on user interaction patterns
  useEffect(() => {
    if (serverStatus === 'connected' && !preloadComplete) {
      preloadComponents();
    }
  }, [serverStatus, preloadComplete]);

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
  };

  const initializeOptimizations = () => {
    // Log bundle information in development
    logBundleInfo();

    // Initialize performance monitoring
    if (window.performanceObserver) {
      window.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    }

    // Cleanup old cache entries
    if (window.cdnService) {
      window.cdnService.cleanupCache();
    }
  };

  const preloadComponents = async () => {
    try {
      console.log('🚀 Preloading components for better UX...');
      
      // Preload components likely to be used next
      await Promise.all([
        preloadComponent(() => import('./components/demo/DemoLearningEnvironment')),
        preloadComponent(() => import('./components/course/CourseManagementDashboard')),
        preloadComponent(() => import('./components/auth/LoginForm'))
      ]);
      
      setPreloadComplete(true);
      console.log('✅ Component preloading complete');
    } catch (error) {
      console.warn('⚠️ Component preloading failed:', error);
    }
  };

  const handleViewChange = (view) => {
    // Track navigation for analytics
    if (window.analytics) {
      window.analytics.track('Navigation', {
        from: currentView,
        to: view,
        timestamp: new Date().toISOString()
      });
    }
    
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'demo':
        return <DemoLearningEnvironment onBackToStatus={() => handleViewChange('status')} />;
      case 'course-management':
        return <CourseManagementDashboard onBackToStatus={() => handleViewChange('status')} />;
      case 'adaptive-learning':
        return <AdaptiveLearningDashboard userId="demo-user" onBackToMain={() => handleViewChange('status')} />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md mx-auto text-center">
              <h1 className="text-4xl font-bold text-blue-600 mb-4">
                🌟 AstraLearn
              </h1>
              <p className="text-gray-600 mb-8">
                Advanced LMS with Context-Aware AI
              </p>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Development Server</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Server Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      serverStatus === 'connected' ? 'bg-green-100 text-green-800' :
                      serverStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {serverStatus === 'connected' ? '🟢 Connected' :
                       serverStatus === 'disconnected' ? '🔴 Disconnected' :
                       '🟡 Checking...'}
                    </span>
                  </div>
                  
                  {serverInfo && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Database:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          serverInfo.database === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {serverInfo.database}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Environment:</span>
                        <span className="text-gray-800 font-medium">{serverInfo.environment}</span>
                      </div>
                      {serverInfo.performance && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Response Time:</span>
                          <span className="text-gray-800 font-medium">{serverInfo.performance.responseTime}ms</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-3 mt-6">
                  <button 
                    onClick={checkServerStatus}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Refresh Status
                  </button>

                  {/* Authentication Buttons */}
                  {!isDemoMode && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setShowLogin(true)}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Login
                      </button>
                      <button 
                        onClick={() => setShowRegister(true)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Register
                      </button>
                    </div>
                  )}

                  {serverStatus === 'connected' && (
                    <>
                      <button 
                        onClick={() => handleViewChange('demo')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all"
                      >
                        🚀 Try AI Assistant Demo
                      </button>
                      <button 
                        onClick={() => handleViewChange('course-management')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-md hover:from-green-700 hover:to-teal-700 transition-all"
                      >
                        📚 Course Management Dashboard
                      </button>
                      
                      <button 
                        onClick={() => handleViewChange('adaptive-learning')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-md hover:from-orange-700 hover:to-red-700 transition-all"
                      >
                        🧠 Adaptive Learning Dashboard
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 text-sm text-gray-500">
                <p>Phase 3 Step 3: Production Optimization</p>
                <p>✅ Performance Monitoring</p>
                <p>✅ Redis Cache Integration</p>
                <p>✅ Code Splitting & Lazy Loading</p>
                <p>✅ CDN Integration Service</p>
                <p>🔄 Advanced ML Integration</p>
                {preloadComplete && <p className="text-green-600">⚡ Components Preloaded</p>}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AIContextProvider>
      <div className="min-h-screen bg-gray-50">
        {/* User Authentication Status */}
        {user && (
          <div className="bg-blue-600 text-white px-4 py-2 text-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <span>Welcome, {user.name}! {isDemoMode && '(Demo Mode)'}</span>
              <button
                onClick={logout}
                className="text-blue-200 hover:text-white underline"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {renderCurrentView()}
        
        {/* Authentication Forms - Only render when needed */}
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
        
        {/* AI Assistant - Always available but lazy loaded */}
        <AIAssistant />
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
