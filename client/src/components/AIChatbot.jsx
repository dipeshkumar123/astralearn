import { useState } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

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
          context // Pass context if available (e.g., current lesson)
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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Tutor</h3>
            <p className="text-xs text-white/80">Ask questions about this course</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-12">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium text-slate-900">Ask me anything!</p>
            <p className="text-sm mt-1">I can help you understand the course material.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}

              <div className={`max-w-[85%] ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                  : msg.error
                    ? 'bg-red-50 text-red-900 border border-red-100 rounded-2xl rounded-tl-sm'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm'
                } p-4`}>
                <div className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }}
                />

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100/20">
                    <p className="text-xs font-semibold opacity-70 mb-1">Sources:</p>
                    {msg.sources.map((source, i) => (
                      <div key={i} className="text-xs opacity-70">
                        • {source.contentType} ({(source.similarity * 100).toFixed(0)}%)
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            isLoading={loading}
            variant="primary"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
