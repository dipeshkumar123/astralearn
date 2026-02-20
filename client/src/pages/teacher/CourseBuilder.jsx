import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function CourseBuilder() {
    const { courseId } = useParams()
    const { getToken } = useAuth()
    const [course, setCourse] = useState(null)
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingTitle, setEditingTitle] = useState(false)
    const [editingDescription, setEditingDescription] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        fetchCourse()
        fetchSections()
    }, [courseId])

    const fetchCourse = async () => {
        try {
            const res = await axios.get(`/api/courses/${courseId}`)
            setCourse(res.data)
            setTitle(res.data.title)
            setDescription(res.data.description || '')
            setLoading(false)
        } catch {
            toast.error('Failed to load course')
        }
    }

    const fetchSections = async () => {
        try {
            const res = await axios.get(`/api/sections/course/${courseId}`)
            setSections(res.data)
        } catch {
            // noop
        }
    }

    const updateTitle = async () => {
        try {
            const token = await getToken()
            await axios.patch(`/api/courses/${courseId}`, { title }, { headers: { Authorization: `Bearer ${token}` } })
            setCourse({ ...course, title })
            setEditingTitle(false)
            toast.success('Title updated')
        } catch {
            toast.error('Failed to update title')
        }
    }

    const updateDescription = async () => {
        try {
            const token = await getToken()
            await axios.patch(`/api/courses/${courseId}`, { description }, { headers: { Authorization: `Bearer ${token}` } })
            setCourse({ ...course, description })
            setEditingDescription(false)
            toast.success('Description updated')
        } catch {
            toast.error('Failed to update description')
        }
    }

    const addSection = async () => {
        try {
            const token = await getToken()
            const res = await axios.post('/api/sections', { title: 'New Section', courseId }, { headers: { Authorization: `Bearer ${token}` } })
            setSections([...sections, res.data])
            toast.success('Section added')
        } catch {
            toast.error('Failed to add section')
        }
    }

    const deleteSection = async (sectionId) => {
        if (!confirm('Delete this section and all its lessons?')) return

        try {
            const token = await getToken()
            await axios.delete(`/api/sections/${sectionId}`, { headers: { Authorization: `Bearer ${token}` } })
            setSections(sections.filter(s => s.id !== sectionId))
            toast.success('Section deleted')
        } catch {
            toast.error('Failed to delete section')
        }
    }

    const togglePublish = async () => {
        try {
            const token = await getToken()
            await axios.patch(`/api/courses/${courseId}`, { isPublished: !course.isPublished }, { headers: { Authorization: `Bearer ${token}` } })
            setCourse({ ...course, isPublished: !course.isPublished })
            toast.success(course.isPublished ? 'Course unpublished' : 'Course published')
        } catch {
            toast.error('Failed to update publish status')
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen">
            <div className="glass-panel border-b rounded-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/teacher/courses" className="text-slate-600 hover:text-slate-900">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-xl font-bold">Course Builder</h1>
                        </div>
                        <button
                            onClick={togglePublish}
                            className={`px-4 py-2 rounded-lg font-medium ${course.isPublished ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                            {course.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-sm font-medium text-slate-500">Course Title</h2>
                        <button onClick={() => setEditingTitle(!editingTitle)} className="text-slate-600 hover:text-slate-900">
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                    {editingTitle ? (
                        <div>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg mb-2" />
                            <div className="flex gap-2">
                                <button onClick={updateTitle} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                                <button onClick={() => { setTitle(course.title); setEditingTitle(false) }} className="bg-slate-200 px-4 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold">{course.title}</p>
                    )}
                </div>

                <div className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-sm font-medium text-slate-500">Description</h2>
                        <button onClick={() => setEditingDescription(!editingDescription)} className="text-slate-600 hover:text-slate-900">
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                    {editingDescription ? (
                        <div>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg mb-2 h-32" placeholder="Course description..." />
                            <div className="flex gap-2">
                                <button onClick={updateDescription} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                                <button onClick={() => { setDescription(course.description || ''); setEditingDescription(false) }} className="bg-slate-200 px-4 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-700">{course.description || 'No description yet'}</p>
                    )}
                </div>

                <div className="card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Course Sections</h2>
                        <button onClick={addSection} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Add Section
                        </button>
                    </div>

                    {sections.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No sections yet. Click "Add Section" to get started.</div>
                    ) : (
                        <div className="space-y-4">
                            {sections.map((section) => (
                                <SectionItem key={section.id} section={section} onDelete={() => deleteSection(section.id)} onUpdate={fetchSections} getToken={getToken} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function SectionItem({ section, onDelete, onUpdate, getToken }) {
    const [editing, setEditing] = useState(false)
    const [title, setTitle] = useState(section.title)
    const [lessons, setLessons] = useState(section.lessons || [])
    const [showLessons, setShowLessons] = useState(false)

    const updateTitle = async () => {
        try {
            const token = await getToken()
            await axios.patch(`/api/sections/${section.id}`, { title }, { headers: { Authorization: `Bearer ${token}` } })
            setEditing(false)
            toast.success('Section updated')
            onUpdate()
        } catch {
            toast.error('Failed to update section')
        }
    }

    const addLesson = async () => {
        try {
            const token = await getToken()
            const res = await axios.post('/api/lessons', { title: 'New Lesson', sectionId: section.id, courseId: section.courseId }, { headers: { Authorization: `Bearer ${token}` } })
            setLessons([...lessons, res.data])
            toast.success('Lesson added')
        } catch {
            toast.error('Failed to add lesson')
        }
    }

    const deleteLesson = async (lessonId) => {
        if (!confirm('Delete this lesson?')) return

        try {
            const token = await getToken()
            await axios.delete(`/api/lessons/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } })
            setLessons(lessons.filter(l => l.id !== lessonId))
            toast.success('Lesson deleted')
        } catch {
            toast.error('Failed to delete lesson')
        }
    }

    return (
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                <div className="flex-1">
                    {editing ? (
                        <div className="flex gap-2">
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-3 py-1 border rounded" />
                            <button onClick={updateTitle} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
                            <button onClick={() => { setTitle(section.title); setEditing(false) }} className="bg-slate-200 px-3 py-1 rounded text-sm">Cancel</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{section.title}</h3>
                            <span className="text-sm text-slate-500">({lessons.length} lessons)</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setEditing(!editing)} className="p-2 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4 text-slate-600" /></button>
                    <button onClick={onDelete} className="p-2 hover:bg-slate-100 rounded"><Trash2 className="h-4 w-4 text-red-600" /></button>
                    <button onClick={() => setShowLessons(!showLessons)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">{showLessons ? 'Hide' : 'Show'} Lessons</button>
                </div>
            </div>

            {showLessons && (
                <div className="mt-4 ml-8 space-y-2">
                    <button onClick={addLesson} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                        <Plus className="h-4 w-4" />
                        Add Lesson
                    </button>
                    {lessons.map((lesson) => (
                        <Link key={lesson.id} to={`/teacher/courses/${section.courseId}/lessons/${lesson.id}`} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                            <GripVertical className="h-4 w-4 text-slate-400" />
                            <span className="flex-1">{lesson.title}</span>
                            <button onClick={(e) => { e.preventDefault(); deleteLesson(lesson.id) }} className="p-1 hover:bg-slate-100 rounded">
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
