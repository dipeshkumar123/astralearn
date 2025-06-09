import { useState, useEffect } from 'react'
import './App.css'
import AIAssistant from './components/ai/AIAssistant'
import AIContextProvider from './contexts/AIContextProvider'
import DemoLearningEnvironment from './components/demo/DemoLearningEnvironment'

function App() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverInfo, setServerInfo] = useState(null);
  const [showDemo, setShowDemo] = useState(false);

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
  };

  return (
    <AIContextProvider>
      <div className="min-h-screen bg-gray-50">
        {showDemo ? (
          <DemoLearningEnvironment onBackToStatus={() => setShowDemo(false)} />
        ) : (
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
                  
                  {serverStatus === 'connected' && (
                    <button 
                      onClick={() => setShowDemo(true)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      🚀 Try AI Assistant Demo
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-8 text-sm text-gray-500">
                <p>Phase 2: AI Integration Complete</p>
                <p>✅ User Profile Management</p>
                <p>✅ AI Orchestration Layer</p>
                <p>✅ Frontend AI Interface</p>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Assistant - Always available */}
        <AIAssistant />
      </div>
    </AIContextProvider>
  )
}

export default App
