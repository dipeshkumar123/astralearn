import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Plus, Edit, Eye, EyeOff, Layers, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import TeacherHeader from '../../components/TeacherHeader'

export default function TeacherCourses() {
    const { getToken } = useAuth()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [newCourseTitle, setNewCourseTitle] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const token = await getToken()
            const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            const res = await axios.get('/api/courses/instructor', cfg)
            setCourses(res.data)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCourse = async (e) => {
        e.preventDefault()
        if (!newCourseTitle.trim()) return

        try {
            const token = await getToken()
            const res = await axios.post('/api/courses', { title: newCourseTitle }, { headers: { Authorization: `Bearer ${token}` } })
            toast.success('Course created')
            navigate(`/teacher/courses/${res.data.id}`)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create course')
        }
    }

    return (
        <div className="min-h-screen">
            <TeacherHeader title="My Courses" subtitle="Create and manage your courses" backLink="/teacher" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="glass-panel rounded-2xl p-6 mb-8 flex justify-between items-center gap-4 flex-wrap">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Course Library</h2>
                        <p className="text-slate-600 mt-1">Manage your course content and settings</p>
                    </div>
                    <button
                        onClick={() => setCreating(!creating)}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-medium"
                    >
                        {creating ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        {creating ? 'Cancel' : 'New Course'}
                    </button>
                </div>

                {creating && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8 animate-slide-up">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Course</h3>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <input
                                type="text"
                                value={newCourseTitle}
                                onChange={(e) => setNewCourseTitle(e.target.value)}
                                placeholder="Course title"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button type="submit" disabled={!newCourseTitle.trim()} className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed">Create Course</button>
                                <button type="button" onClick={() => { setCreating(false); setNewCourseTitle('') }} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary"></div>
                        <p className="text-slate-600 mt-4">Loading courses...</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses yet</h3>
                        <p className="text-slate-600 mb-6">Get started by creating your first course</p>
                        <button onClick={() => setCreating(true)} className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium">Create Your First Course</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden group">
                                <div className="h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Layers className="h-16 w-16 text-white opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.isPublished ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900/50 backdrop-blur-sm text-white'}`}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem]">{course.title}</h3>
                                        <p className="text-sm text-slate-600 line-clamp-2">{course.description || 'No description provided'}</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Layers className="h-4 w-4" />
                                            {course.sections?.length || 0} sections
                                        </span>
                                        <span className="text-slate-300">|</span>
                                        <span>{course.category || 'Uncategorized'}</span>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-medium text-sm flex items-center justify-center gap-2" onClick={() => navigate(`/teacher/courses/${course.id}`)}>
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            className={`flex-1 px-4 py-2.5 rounded-xl transition font-medium text-sm flex items-center justify-center gap-2 ${course.isPublished ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                            onClick={async () => {
                                                try {
                                                    const token = await getToken()
                                                    const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                                                    await axios.put(`/api/courses/${course.id}`, { isPublished: !course.isPublished }, cfg)
                                                    toast.success(course.isPublished ? 'Course unpublished' : 'Course published')
                                                    fetchCourses()
                                                } catch {
                                                    toast.error('Failed to update')
                                                }
                                            }}
                                        >
                                            {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            {course.isPublished ? 'Unpublish' : 'Publish'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
