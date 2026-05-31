import { lazy, Suspense, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Video, ClipboardList } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import VideoUpload from '../../components/VideoUpload'
import TeacherHeader from '../../components/TeacherHeader'

const RichTextEditor = lazy(() => import('../../components/RichTextEditor'))
const QuizBuilder = lazy(() => import('../../components/QuizBuilder'))
const QuizPlayer = lazy(() => import('../../components/QuizPlayer'))

function InlineLoader({ text }) {
    return <div className="text-sm text-slate-500 py-4">{text}</div>
}

export default function LessonEditor() {
    const { courseId, lessonId } = useParams()
    const { getToken } = useAuth()
    const [lesson, setLesson] = useState(null)
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editingTitle, setEditingTitle] = useState(false)
    const [editingDescription, setEditingDescription] = useState(false)
    const [showQuizBuilder, setShowQuizBuilder] = useState(false)
    const [quizzes, setQuizzes] = useState([])
    const [activeQuizId, setActiveQuizId] = useState(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        fetchLesson()
        fetchCourse()
    }, [lessonId])

    const fetchLesson = async () => {
        try {
            const res = await axios.get(`/api/lessons/${lessonId}`)
            setLesson(res.data)
            setTitle(res.data.title)
            setDescription(res.data.description || '')
            setQuizzes(res.data.quizzes || [])
            setLoading(false)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load lesson')
        }
    }

    const fetchCourse = async () => {
        try {
            const res = await axios.get(`/api/courses/${courseId}`)
            setCourse(res.data)
        } catch {
            // non-critical
        }
    }

    const updateTitle = async () => {
        try {
            const token = await getToken()
            await axios.patch(`/api/lessons/${lessonId}`, { title }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setLesson({ ...lesson, title })
            setEditingTitle(false)
            toast.success('Title updated')
        } catch (error) {
            toast.error('Failed to update title')
        }
    }

    const updateDescription = async () => {
        try {
            const token = await getToken()
            await axios.patch(`/api/lessons/${lessonId}`, { description }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setLesson({ ...lesson, description })
            setEditingDescription(false)
            toast.success('Description updated')
        } catch (error) {
            toast.error('Failed to update description')
        }
    }

    const handleVideoUpload = async (uploadId) => {
        try {
            const token = await getToken()
            await axios.patch(`/api/lessons/${lessonId}`, {
                muxAssetId: uploadId,
                muxPlaybackId: uploadId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchLesson()
        } catch (error) {
            toast.error('Failed to save video')
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <TeacherHeader
                title={lesson?.title || 'Lesson Editor'}
                subtitle={course?.title || ''}
                backLink={`/teacher/courses/${courseId}`}
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Title */}
                <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 mb-6">
                    <h2 className="text-sm font-medium text-slate-500 mb-4">Lesson Title</h2>
                    {editingTitle ? (
                        <div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg mb-2"
                            />
                            <div className="flex flex-wrap gap-2">
                                <button onClick={updateTitle} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                                <button onClick={() => { setTitle(lesson.title); setEditingTitle(false) }} className="bg-slate-200 px-4 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-between items-center gap-3">
                            <h3 className="text-xl font-bold sm:text-2xl">{lesson.title}</h3>
                            <button onClick={() => setEditingTitle(true)} className="text-blue-600 hover:text-blue-800">Edit</button>
                        </div>
                    )}
                </div>

                {/* Video */}
                <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Video className="h-5 w-5 text-slate-600" />
                        <h2 className="text-lg font-semibold">Video Content</h2>
                    </div>
                    <VideoUpload lesson={lesson} onUploadComplete={handleVideoUpload} />
                </div>

                {/* Quiz Section */}
                <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-slate-600" />
                            <h2 className="text-lg font-semibold">Quizzes</h2>
                        </div>
                        <button
                            onClick={() => setShowQuizBuilder(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm sm:text-base"
                        >
                            {quizzes.length > 0 ? 'Manage Quiz' : 'Add Quiz'}
                        </button>
                    </div>
                    {quizzes.length === 0 && (
                        <p className="text-sm text-slate-500">No quiz yet. Click "Add Quiz" to create one.</p>
                    )}
                    {quizzes.length > 0 && (
                        <div className="space-y-3">
                            {quizzes.map(q => (
                                <div key={q.id} className="flex flex-col gap-3 p-3 rounded-lg border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-medium">{q.title}</p>
                                        <p className="text-xs text-slate-500">{q._count?.questions || 0} question(s) · {q.passingScore}% pass</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setActiveQuizId(q.id)}
                                            className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                        >Preview</button>
                                        <button
                                            onClick={() => setShowQuizBuilder(true)}
                                            className="text-sm px-3 py-1 rounded bg-slate-200 hover:bg-slate-300"
                                        >Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
                    <h2 className="text-sm font-medium text-slate-500 mb-4">Description</h2>
                    {editingDescription ? (
                        <div>
                            <Suspense fallback={<InlineLoader text="Loading editor..." />}>
                                <RichTextEditor content={description} onChange={setDescription} />
                            </Suspense>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <button onClick={updateDescription} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                                <button onClick={() => { setDescription(lesson.description || ''); setEditingDescription(false) }} className="bg-slate-200 px-4 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="prose max-w-none text-slate-700 mb-4" dangerouslySetInnerHTML={{ __html: lesson.description || 'No description yet' }} />
                            <button onClick={() => setEditingDescription(true)} className="text-blue-600 hover:text-blue-800">Edit Description</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Quiz Builder Modal */}
            {showQuizBuilder && (
                <Suspense fallback={<InlineLoader text="Loading quiz builder..." />}>
                    <QuizBuilder
                        lessonId={lessonId}
                        onClose={() => {
                            setShowQuizBuilder(false)
                            fetchLesson()
                        }}
                    />
                </Suspense>
            )}
            {activeQuizId && !showQuizBuilder && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-semibold">Quiz Preview</h3>
                            <button
                                onClick={() => setActiveQuizId(null)}
                                className="text-slate-500 hover:text-slate-700 text-sm"
                            >Close</button>
                        </div>
                        <div className="p-4">
                            <Suspense fallback={<InlineLoader text="Loading quiz preview..." />}>
                                <QuizPlayer quizId={activeQuizId} />
                            </Suspense>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
