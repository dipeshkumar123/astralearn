import { useState, useEffect } from 'react'
import { Clock, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

export default function QuizPlayer({ quizId, onComplete, quiz: propQuiz }) {
  const { getToken } = useAuth()
  const [quiz, setQuiz] = useState(propQuiz || null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(!propQuiz)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [pastAttempts, setPastAttempts] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(null)

  useEffect(() => {
    if (!propQuiz && quizId) {
      fetchQuiz()
    }
  }, [quizId, propQuiz])

  useEffect(() => {
    if (quizId) {
      fetchAttempts()
    }
  }, [quizId])

  useEffect(() => {
    if (quiz?.timeLimit && !result) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quiz, result])

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`/api/quizzes/${quizId}`)
      setQuiz(res.data)
      if (res.data.timeLimit) {
        setTimeRemaining(res.data.timeLimit * 60) // Convert to seconds
      }
      setLoading(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load quiz')
      setLoading(false)
    }
  }

  const fetchAttempts = async () => {
    try {
      const token = await getToken()
      const res = await axios.get(`/api/quizzes/${quizId}/results`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      setPastAttempts(res.data || [])
    } catch (e) {
      // ignore silently for now
    }
  }

  const handleSubmit = async () => {
    // Check if all questions answered
    const unanswered = quiz.questions.filter(q => !answers[q.id])
    if (unanswered.length > 0 && !window.confirm(`${unanswered.length} question(s) unanswered. Submit anyway?`)) {
      return
    }

    setSubmitting(true)
    try {
      const token = await getToken()
      // If we have a quizId, submit to backend. If it's passed as prop (e.g. embedded in lesson), we might handle it differently
      // Assuming standard submission for now
      const targetId = quizId || quiz.id;

      const res = await axios.post(
        `/api/quizzes/${targetId}/attempt`,
        {
          answers,
          timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60 - timeRemaining) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setResult(res.data)
      toast.success(`Quiz submitted! Score: ${res.data.score.toFixed(1)}%`)

      if (onComplete) {
        onComplete(res.data)
      }
      // refresh attempts list
      fetchAttempts()
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12 text-slate-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <p>Quiz not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card className="p-6 bg-white border-l-4 border-l-primary">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{quiz.title}</h2>
            {quiz.description && (
              <p className="text-slate-600 mb-4">{quiz.description}</p>
            )}
          </div>
          {quiz.timeLimit && !result && (
            <Badge variant="warning" className="flex items-center gap-2 text-lg px-3 py-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeRemaining)}</span>
            </Badge>
          )}
        </div>

        <div className="flex gap-6 text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Questions:</span> {quiz.questions.length}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Passing Score:</span> {quiz.passingScore}%
          </div>
        </div>
      </Card>

      {/* Questions */}
      {!result ? (
        <div className="space-y-6">
          {quiz.questions.map((question, idx) => (
            <Card key={question.id} className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Question {idx + 1}</span>
                  <Badge variant="neutral">{question.points} pts</Badge>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{question.question}</h3>
              </div>

              {question.type === 'multiple_choice' ? (
                <div className="space-y-3">
                  {question.options.map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[question.id] === option
                        ? 'border-primary bg-primary-50 ring-1 ring-primary/20'
                        : 'border-slate-100 hover:border-primary/50 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[question.id] === option ? 'border-primary' : 'border-slate-300'
                        }`}>
                        {answers[question.id] === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => setAnswers({ ...answers, [question.id]: option })}
                        className="hidden"
                      />
                      <span className="text-slate-700 font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4">
                  {['true', 'false'].map((val) => (
                    <label
                      key={val}
                      className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all text-center capitalize font-medium ${answers[question.id] === val
                        ? 'border-primary bg-primary-50 text-primary ring-1 ring-primary/20'
                        : 'border-slate-100 hover:border-primary/50 hover:bg-slate-50 text-slate-600'
                        }`}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={val}
                        checked={answers[question.id] === val}
                        onChange={() => setAnswers({ ...answers, [question.id]: val })}
                        className="hidden"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {/* Submit Button */}
          <Card className="p-6 sticky bottom-6 shadow-xl border-t-4 border-t-primary z-10">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 font-medium">
                {Object.keys(answers).length} of {quiz.questions.length} questions answered
              </p>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                isLoading={submitting}
                variant="primary"
                size="lg"
                className="px-8"
                data-testid="quiz-submit"
              >
                <Send className="h-5 w-5 mr-2" />
                Submit Quiz
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* Results */
        <div className="space-y-6 animate-fade-in">
          <Card className={`p-8 text-center border-2 ${result.passed ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
            <div className="mb-6">
              {result.passed ? (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              )}
            </div>
            <h3 className={`text-3xl font-bold mb-2 ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
              {result.passed ? 'Congratulations! You Passed!' : 'Not Passed'}
            </h3>
            <div className="text-5xl font-black mb-4 text-slate-900 tracking-tight">
              {result.score.toFixed(1)}%
            </div>
            <Badge variant={result.passed ? 'success' : 'error'} size="lg">
              {result.earnedPoints} / {result.totalPoints} points
            </Badge>
            {result.passed && (
              <p className="text-sm text-green-700 mt-4 font-medium">
                You scored above the {quiz.passingScore}% passing threshold
              </p>
            )}
          </Card>

          {/* Question Review */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 px-2">Review Your Answers</h3>
            {quiz.questions.map((question, idx) => {
              const questionResult = result.results[question.id]
              const isCorrect = questionResult?.correct

              return (
                <Card
                  key={question.id}
                  className={`p-6 border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-lg">Q{idx + 1}: {question.question}</p>
                    </div>
                  </div>

                  <div className="ml-10 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-500">Your answer: </span>
                      <Badge variant={isCorrect ? 'success' : 'error'}>
                        {questionResult?.userAnswer || 'Not answered'}
                      </Badge>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-500">Correct answer: </span>
                        <Badge variant="success">{questionResult?.correctAnswer}</Badge>
                      </div>
                    )}
                    {question.explanation && (
                      <div className="mt-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="font-bold text-blue-800 block mb-1">Explanation: </span>
                        <span className="text-blue-700 leading-relaxed">{question.explanation}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
          {/* Past Attempts */}
          {pastAttempts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-slate-800 px-2">Past Attempts</h4>
              <ul className="px-2 text-sm text-slate-600 space-y-1" data-testid="past-attempts">
                {pastAttempts.map(a => (
                  <li key={a.id} className="flex justify-between border-b border-slate-100 py-1">
                    <span>{new Date(a.completedAt).toLocaleString()}</span>
                    <span className="font-medium">{a.score.toFixed(1)}% {a.passed ? '✅' : '❌'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
