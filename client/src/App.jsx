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

// Main App Content Component
function AppContent() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverInfo, setServerInfo] = useState(null);
  const [currentView, setCurrentView] = useState('status');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, logout, isDemoMode } = useAuth();

  useEffect(() => {
    checkServerStatus();
  }, []);

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
    switch (currentView) {
      case 'demo':
        return <DemoLearningEnvironment onBackToStatus={() => setCurrentView('status')} />;
      case 'course-management':
        return <CourseManagementDashboard onBackToStatus={() => setCurrentView('status')} />;
      case 'adaptive-learning':
        return <AdaptiveLearningDashboard userId="demo-user" onBackToMain={() => setCurrentView('status')} />;
      case 'gamification':
        return <GamificationDashboard onBackToMain={() => setCurrentView('status')} />;
      case 'social-learning':
        return <SocialDashboard onBackToMain={() => setCurrentView('status')} />;
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
                        onClick={() => setCurrentView('demo')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all"
                      >
                        🚀 Try AI Assistant Demo
                      </button>
                      <button 
                        onClick={() => setCurrentView('course-management')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-md hover:from-green-700 hover:to-teal-700 transition-all"
                      >
                        📚 Course Management Dashboard
                      </button>
                        <button 
                        onClick={() => setCurrentView('adaptive-learning')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-md hover:from-orange-700 hover:to-red-700 transition-all"
                      >
                        🧠 Adaptive Learning Dashboard
                      </button>
                      
                      <button 
                        onClick={() => setCurrentView('gamification')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all"
                      >
                        🎮 Gamification Dashboard
                      </button>
                      
                      <button 
                        onClick={() => setCurrentView('social-learning')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-md hover:from-blue-700 hover:to-cyan-700 transition-all"
                      >
                        🤝 Social Learning Hub
                      </button>
                    </>
                  )}
                </div>
              </div>              <div className="mt-8 text-sm text-gray-500">
                <p>Phase 4 Step 3: Gamification & Social Learning</p>
                <p>✅ User Profile Management</p>
                <p>✅ AI Orchestration Layer</p>
                <p>✅ Frontend AI Interface</p>
                <p>✅ Course Management System</p>
                <p>✅ Adaptive Learning & Assessment</p>
                <p>✅ Real-time Integration System</p>
                <p>🔄 Gamification & Achievement System</p>
              </div></div>
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
        
        {/* AI Assistant - Always available */}
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
