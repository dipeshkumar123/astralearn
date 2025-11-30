import { useState, useEffect } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

import { useAuth } from '@clerk/clerk-react'

export default function QuizBuilder({ lessonId, onClose }) {
    const { getToken } = useAuth()
    const [quiz, setQuiz] = useState(null)
    const [saving, setSaving] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [passingScore, setPassingScore] = useState(70)
    const [timeLimit, setTimeLimit] = useState('')
    const [questions, setQuestions] = useState([])
    const [editingQuestion, setEditingQuestion] = useState(null)

    useEffect(() => {
        fetchQuizzes()
    }, [lessonId])

    const fetchQuizzes = async () => {
        try {
            const token = await getToken()
            const res = await axios.get(`/api/quizzes/lesson/${lessonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.length > 0) {
                const existingQuiz = res.data[0]
                setQuiz(existingQuiz)
                loadQuiz(existingQuiz.id)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const loadQuiz = async (quizId) => {
        try {
            const token = await getToken()
            const res = await axios.get(`/api/quizzes/${quizId}?includeAnswers=true`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTitle(res.data.title)
            setDescription(res.data.description || '')
            setPassingScore(res.data.passingScore)
            setTimeLimit(res.data.timeLimit || '')
            setQuestions(res.data.questions || [])
        } catch (error) {
            console.error(error)
        }
    }

    const handleSaveQuiz = async () => {
        if (!title.trim()) {
            toast.error('Quiz title is required')
            return
        }

        setSaving(true)
        try {
            const token = await getToken()
            const headers = { Authorization: `Bearer ${token}` }

            if (quiz) {
                // Update existing quiz
                await axios.patch(`/api/quizzes/${quiz.id}`, {
                    title,
                    description,
                    passingScore,
                    timeLimit: timeLimit ? parseInt(timeLimit) : null
                }, { headers })
                toast.success('Quiz updated!')
            } else {
                // Create new quiz
                const res = await axios.post('/api/quizzes', {
                    lessonId,
                    title,
                    description,
                    passingScore,
                    timeLimit: timeLimit ? parseInt(timeLimit) : null
                }, { headers })
                setQuiz(res.data)
                toast.success('Quiz created!')
            }
        } catch (error) {
            toast.error('Failed to save quiz')
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    const addQuestion = () => {
        const newQuestion = {
            id: `new-${Date.now()}`,
            type: 'multiple_choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            explanation: '',
            order: questions.length,
            points: 1
        }
        setQuestions([...questions, newQuestion])
        setEditingQuestion(newQuestion.id)
    }

    const saveQuestion = async (question) => {
        if (!quiz) {
            toast.error('Please save the quiz first')
            return
        }

        if (!question.question.trim()) {
            toast.error('Question text is required')
            return
        }

        if (!question.correctAnswer) {
            toast.error('Please select the correct answer')
            return
        }

        try {
            const token = await getToken()
            const headers = { Authorization: `Bearer ${token}` }

            if (question.id.startsWith('new-')) {
                // Create new question
                const res = await axios.post(`/api/quizzes/${quiz.id}/questions`, {
                    ...question,
                    id: undefined
                }, { headers })

                setQuestions(questions.map(q =>
                    q.id === question.id ? res.data : q
                ))
            } else {
                // Update existing question
                await axios.patch(`/api/quizzes/questions/${question.id}`, question, { headers })
                setQuestions(questions.map(q =>
                    q.id === question.id ? question : q
                ))
            }

            setEditingQuestion(null)
            toast.success('Question saved!')
        } catch (error) {
            toast.error('Failed to save question')
            console.error(error)
        }
    }

    const deleteQuestion = async (questionId) => {
        if (!window.confirm('Delete this question?')) return

        try {
            if (!questionId.startsWith('new-')) {
                const token = await getToken()
                await axios.delete(`/api/quizzes/questions/${questionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
            setQuestions(questions.filter(q => q.id !== questionId))
            toast.success('Question deleted')
        } catch (error) {
            toast.error('Failed to delete question')
            console.error(error)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Quiz Builder</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Quiz Settings */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Quiz Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                                placeholder="e.g., Chapter 1 Quiz"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                                rows="2"
                                placeholder="Optional quiz description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                                <input
                                    type="number"
                                    value={passingScore}
                                    onChange={(e) => setPassingScore(parseInt(e.target.value))}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                                <input
                                    type="number"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(e.target.value)}
                                    min="1"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="No limit"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveQuiz}
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : quiz ? 'Update Quiz Settings' : 'Create Quiz'}
                        </button>
                    </div>

                    {/* Questions */}
                    {quiz && (
                        <div className="border-t pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Questions ({questions.length})</h3>
                                <button
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Question
                                </button>
                            </div>

                            <div className="space-y-4">
                                {questions.map((question, idx) => (
                                    <QuestionEditor
                                        key={question.id}
                                        question={question}
                                        number={idx + 1}
                                        isEditing={editingQuestion === question.id}
                                        onEdit={() => setEditingQuestion(question.id)}
                                        onSave={saveQuestion}
                                        onDelete={() => deleteQuestion(question.id)}
                                        onChange={(updated) => {
                                            setQuestions(questions.map(q =>
                                                q.id === question.id ? updated : q
                                            ))
                                        }}
                                    />
                                ))}

                                {questions.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No questions yet</p>
                                        <p className="text-sm">Click "Add Question" to get started</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function QuestionEditor({ question, number, isEditing, onEdit, onSave, onDelete, onChange }) {
    const handleOptionChange = (index, value) => {
        const newOptions = [...question.options]
        newOptions[index] = value
        onChange({ ...question, options: newOptions })
    }

    if (!isEditing) {
        return (
            <div className="border rounded-lg p-4 hover:border-blue-300 transition">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <p className="font-semibold mb-2">Q{number}: {question.question || 'Untitled question'}</p>
                        <p className="text-sm text-gray-600">
                            {question.points} point(s) · {question.type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEdit}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Question {number} *</label>
                    <textarea
                        value={question.question}
                        onChange={(e) => onChange({ ...question, question: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows="2"
                        placeholder="Enter your question"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Type</label>
                        <select
                            value={question.type}
                            onChange={(e) => onChange({ ...question, type: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Points</label>
                        <input
                            type="number"
                            value={question.points}
                            onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) })}
                            min="1"
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                </div>

                {question.type === 'multiple_choice' ? (
                    <div>
                        <label className="block text-sm font-medium mb-2">Answer Options *</label>
                        <div className="space-y-2">
                            {question.options.map((option, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={question.correctAnswer === option}
                                        onChange={() => onChange({ ...question, correctAnswer: option })}
                                        className="w-4 h-4"
                                    />
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-lg"
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium mb-2">Correct Answer *</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={question.correctAnswer === 'true'}
                                    onChange={() => onChange({ ...question, correctAnswer: 'true' })}
                                />
                                <span>True</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={question.correctAnswer === 'false'}
                                    onChange={() => onChange({ ...question, correctAnswer: 'false' })}
                                />
                                <span>False</span>
                            </label>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2">Explanation (Optional)</label>
                    <textarea
                        value={question.explanation || ''}
                        onChange={(e) => onChange({ ...question, explanation: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows="2"
                        placeholder="Explain the correct answer"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onSave(question)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        <Check className="h-4 w-4" />
                        Save Question
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
