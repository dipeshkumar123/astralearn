import { useState } from 'react'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

// Safe text renderer — escapes HTML to prevent XSS
function SafeMessage({ content }) {
  // Convert newlines to <br> but escape all HTML
  const lines = content.split('\n')
  return (
    <div className="prose prose-sm max-w-none">
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  )
}

export default function AIChatbot({ courseId, context }) {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)

    try {
      const token = await getToken()
      const res = await axios.post('/api/ai/chat',
        {
          courseId,
          question: input,
          context
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const aiMessage = {
        role: 'ai',
        content: res.data.answer,
        sources: res.data.sources
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">AI Tutor</h3>
            <p className="text-xs text-slate-500">Ask questions about this course</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center mt-12 px-4">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium text-slate-900 mb-1">How can I help you learn?</p>
            <p className="text-sm text-slate-500">Ask me anything about the course material to get instant, contextual answers.</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div className={`max-w-[85%] ${msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm'
                    : msg.error
                      ? 'bg-red-50 text-red-900 border border-red-100 rounded-2xl rounded-tl-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm'
                  } p-4 leading-relaxed`}
                >
                  {/* SECURITY FIX: Use SafeMessage instead of dangerouslySetInnerHTML */}
                  <SafeMessage content={msg.content} />

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Sources:</p>
                      {msg.sources.map((source, i) => (
                        <div key={i} className="text-xs text-slate-500 mb-1">
                          • {source.contentType} ({(source.similarity * 100).toFixed(0)}%)
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-slate-500 font-medium">Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-5 pr-14 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:hover:bg-primary"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
