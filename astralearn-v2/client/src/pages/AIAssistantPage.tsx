import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowLeft, Send, MessageCircle, Lightbulb, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const AIAssistantPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI learning assistant. How can I help you with your studies today?',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    // Simulate AI response
    const aiResponse = {
      id: messages.length + 2,
      type: 'assistant',
      content: 'I\'m currently in development mode. This AI assistant feature will soon provide personalized learning recommendations, answer questions about your courses, and help you with study planning. Stay tuned for updates!',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage, aiResponse]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft />}>
                  Back to Dashboard
                </Button>
              </Link>
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                AI Learning Assistant
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Learning Assistant
            </h1>
            <p className="text-gray-600">
              Get personalized help with your learning journey
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t">
            <div className="flex space-x-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about your learning..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} leftIcon={<Send />}>
                Send
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
            <p className="text-sm text-gray-600">
              Get personalized course and learning path recommendations based on your progress.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Study Help</h3>
            <p className="text-sm text-gray-600">
              Ask questions about course content and get instant explanations and clarifications.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Learning Analytics</h3>
            <p className="text-sm text-gray-600">
              Track your progress and get insights on how to improve your learning efficiency.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
