import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
    'Programming', 'Web Development', 'Data Science', 'Machine Learning',
    'Design', 'Business', 'Marketing', 'Mathematics', 'Science', 'Other'
]
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

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
    const [category, setCategory] = useState('')
    const [level, setLevel] = useState('')

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
            setCategory(res.data.category || '')
            setLevel(res.data.level || '')
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

    const updateCategory = async (newCategory) => {
        setCategory(newCategory)
        try {
            const token = await getToken()
            await axios.patch(`/api/courses/${courseId}`, { category: newCategory }, { headers: { Authorization: `Bearer ${token}` } })
            setCourse({ ...course, category: newCategory })
            toast.success('Category updated')
        } catch {
            toast.error('Failed to update category')
            setCategory(course.category || '')
        }
    }

    const updateLevel = async (newLevel) => {
        setLevel(newLevel)
        try {
            const token = await getToken()
            await axios.patch(`/api/courses/${courseId}`, { level: newLevel }, { headers: { Authorization: `Bearer ${token}` } })
            setCourse({ ...course, level: newLevel })
            toast.success('Level updated')
        } catch {
            toast.error('Failed to update level')
            setLevel(course.level || '')
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
                    <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:h-16 sm:py-0">
                        <div className="flex items-center gap-4">
                            <Link to="/teacher/courses" className="text-slate-600 hover:text-slate-900">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-lg font-bold sm:text-xl">Course Builder</h1>
                        </div>
                        <button
                            onClick={togglePublish}
                            className={`rounded-lg px-4 py-2 text-sm font-medium sm:text-base ${course.isPublished ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                            {course.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
                <div className="card p-5 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-sm font-medium text-slate-500">Course Title</h2>
                        <button onClick={() => setEditingTitle(!editingTitle)} className="text-slate-600 hover:text-slate-900">
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                    {editingTitle ? (
                        <div>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg mb-2" />
                            <div className="flex flex-wrap gap-2">
                                <button onClick={updateTitle} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                                <button onClick={() => { setTitle(course.title); setEditingTitle(false) }} className="bg-slate-200 px-4 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xl font-bold sm:text-2xl">{course.title}</p>
                    )}
                </div>

                <div className="card p-5 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-sm font-medium text-slate-500">Description</h2>
                        <button onClick={() => setEditingDescription(!editingDescription)} className="text-slate-600 hover:text-slate-900">
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                    {editingDescription ? (
                        <div>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg mb-2 h-32" placeholder="Course description..." />
                            <div className="flex flex-wrap gap-2">
                                <button onClick={updateDescription} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
                                <button onClick={() => { setDescription(course.description || ''); setEditingDescription(false) }} className="bg-slate-200 px-4 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-700">{course.description || 'No description yet'}</p>
                    )}
                </div>

                {/* Category & Level */}
                <div className="card p-5 sm:p-6">
                    <h2 className="text-sm font-medium text-slate-500 mb-4">Course Settings</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                            <select
                                value={category}
                                onChange={(e) => updateCategory(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Level</label>
                            <select
                                value={level}
                                onChange={(e) => updateLevel(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            >
                                <option value="">Select level</option>
                                {LEVELS.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card p-5 sm:p-6">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-bold sm:text-xl">Course Sections</h2>
                        <button onClick={addSection} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:text-base">
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
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-3 py-1 border rounded" />
                            <button onClick={updateTitle} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
                            <button onClick={() => { setTitle(section.title); setEditing(false) }} className="bg-slate-200 px-3 py-1 rounded text-sm">Cancel</button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold truncate">{section.title}</h3>
                            <span className="text-sm text-slate-500">({lessons.length} lessons)</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setEditing(!editing)} className="p-2 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4 text-slate-600" /></button>
                    <button onClick={onDelete} className="p-2 hover:bg-slate-100 rounded"><Trash2 className="h-4 w-4 text-red-600" /></button>
                    <button onClick={() => setShowLessons(!showLessons)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">{showLessons ? 'Hide' : 'Show'} Lessons</button>
                </div>
            </div>

            {showLessons && (
                <div className="mt-4 space-y-2 sm:ml-8">
                    <button onClick={addLesson} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                        <Plus className="h-4 w-4" />
                        Add Lesson
                    </button>
                    {lessons.map((lesson) => (
                        <Link key={lesson.id} to={`/teacher/courses/${section.courseId}/lessons/${lesson.id}`} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                            <span className="flex-1 truncate">{lesson.title}</span>
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
