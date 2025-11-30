import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { MessageSquare, Send, User, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DiscussionBoard({ lessonId, currentUser }) {
    const { getToken } = useAuth();
    const [discussions, setDiscussions] = useState([])
    const [loading, setLoading] = useState(true)
    const [newQuestionTitle, setNewQuestionTitle] = useState('')
    const [newQuestionContent, setNewQuestionContent] = useState('')
    const [replyContent, setReplyContent] = useState({}) // Map discussionId -> content
    const [expandedDiscussion, setExpandedDiscussion] = useState(null)

    useEffect(() => {
        if (lessonId) {
            fetchDiscussions()
        }
    }, [lessonId])

    const fetchDiscussions = async () => {
        try {
            const res = await axios.get(`/api/discussions/lesson/${lessonId}`)
            setDiscussions(res.data)
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch discussions:', error)
            setLoading(false)
        }
    }

    const handlePostQuestion = async (e) => {
        e.preventDefault()
        if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return

        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await axios.post('/api/discussions', {
                title: newQuestionTitle,
                content: newQuestionContent,
                lessonId
            }, config)
            setDiscussions([res.data, ...discussions])
            setNewQuestionTitle('')
            setNewQuestionContent('')
            toast.success('Question posted!')
        } catch (error) {
            toast.error('Failed to post question')
        }
    }

    const handlePostReply = async (discussionId) => {
        const content = replyContent[discussionId]
        if (!content?.trim()) return

        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await axios.post(`/api/discussions/${discussionId}/reply`, {
                content
            }, config)

            // Update local state
            setDiscussions(discussions.map(d => {
                if (d.id === discussionId) {
                    return { ...d, replies: [...d.replies, res.data] }
                }
                return d
            }))

            setReplyContent({ ...replyContent, [discussionId]: '' })
            toast.success('Reply posted!')
        } catch (error) {
            toast.error('Failed to post reply')
        }
    }

    const handleDelete = async (discussionId) => {
        if (!window.confirm('Are you sure you want to delete this discussion?')) return

        try {
            const token = await getToken();
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.delete(`/api/discussions/${discussionId}`, config)
            setDiscussions(discussions.filter(d => d.id !== discussionId))
            toast.success('Discussion deleted')
        } catch (error) {
            toast.error('Failed to delete discussion')
        }
    }

    if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-lg"></div>

    return (
        <div className="space-y-8">
            {/* New Question Form */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Ask a Question
                </h3>
                <form onSubmit={handlePostQuestion} className="space-y-4">
                    <input
                        type="text"
                        placeholder="What's your question about?"
                        value={newQuestionTitle}
                        onChange={(e) => setNewQuestionTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <textarea
                        placeholder="Describe your question in detail..."
                        value={newQuestionContent}
                        onChange={(e) => setNewQuestionContent(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!newQuestionTitle.trim() || !newQuestionContent.trim()}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            Post Question
                        </button>
                    </div>
                </form>
            </div>

            {/* Discussions List */}
            <div className="space-y-4">
                {discussions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No discussions yet. Be the first to ask!
                    </div>
                ) : (
                    discussions.map(discussion => (
                        <div key={discussion.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedDiscussion(expandedDiscussion === discussion.id ? null : discussion.id)}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">{discussion.title}</h4>
                                    <span className="text-xs text-gray-500">
                                        {new Date(discussion.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-2">{discussion.content}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <User className="h-4 w-4" />
                                        <span>{discussion.user.firstName} {discussion.user.lastName}</span>
                                        {discussion.user.role === 'TEACHER' && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Instructor</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" />
                                            {discussion.replies.length} replies
                                        </span>
                                        {currentUser && (currentUser.id === discussion.userId || currentUser.role === 'TEACHER') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(discussion.id)
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded View (Replies) */}
                            {expandedDiscussion === discussion.id && (
                                <div className="bg-gray-50 p-6 border-t border-gray-200">
                                    <div className="space-y-4 mb-6">
                                        {/* Original Post Full Content */}
                                        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                                            <p className="text-gray-800 whitespace-pre-wrap">{discussion.content}</p>
                                        </div>

                                        {discussion.replies.map(reply => (
                                            <div key={reply.id} className="flex gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reply.user.role === 'TEACHER' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                                                        }`}>
                                                        <span className="text-xs font-bold">{reply.user.firstName[0]}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-sm font-semibold ${reply.user.role === 'TEACHER' ? 'text-blue-700' : 'text-gray-900'
                                                            }`}>
                                                            {reply.user.firstName} {reply.user.lastName}
                                                            {reply.user.role === 'TEACHER' && ' (Instructor)'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(reply.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Form */}
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Write a reply..."
                                            value={replyContent[discussion.id] || ''}
                                            onChange={(e) => setReplyContent({ ...replyContent, [discussion.id]: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                        <button
                                            onClick={() => handlePostReply(discussion.id)}
                                            disabled={!replyContent[discussion.id]?.trim()}
                                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
