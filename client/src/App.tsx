import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🌟 AstraLearn
        </h1>
        <p className="text-gray-600 mb-8">
          Advanced LMS with Context-Aware AI
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Development Server</h2>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            onClick={() => setCount((count) => count + 1)}
          >
            Count: {count}
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>🚀 Frontend: React + Vite + TypeScript</p>
          <p>⚡ Backend: Node.js + Express + MongoDB</p>
          <p>🤖 AI: OpenRouter Integration</p>
        </div>
      </div>
    </div>
  )
}

export default App