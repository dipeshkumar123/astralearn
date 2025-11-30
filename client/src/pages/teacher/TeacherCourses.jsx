import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { Plus } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

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

    const fetchCourses = () => {
        axios.get('/api/courses')
            .then(res => {
                setCourses(res.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }

    const handleCreateCourse = async (e) => {
        e.preventDefault()
        if (!newCourseTitle.trim()) return

        try {
            const token = await getToken()
            const res = await axios.post('/api/courses', 
                { title: newCourseTitle },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            toast.success('Course created!')
            navigate(`/teacher/courses/${res.data.id}`)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create course')
            console.error(error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/teacher" className="text-2xl font-bold text-gray-900">
                            Nexus LMS - Instructor
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-gray-600 hover:text-gray-900">
                                Student View
                            </Link>
                            <UserButton />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <button
                        onClick={() => setCreating(!creating)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="h-5 w-5" />
                        New Course
                    </button>
                </div>

                {creating && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
                        <form onSubmit={handleCreateCourse} className="flex gap-4">
                            <input
                                type="text"
                                value={newCourseTitle}
                                onChange={(e) => setNewCourseTitle(e.target.value)}
                                placeholder="Course title (e.g., 'Introduction to React')"
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreating(false)}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">Loading courses...</div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                        <p className="text-lg">No courses yet</p>
                        <p className="text-sm mt-2">Click "New Course" to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <Link
                                key={course.id}
                                to={`/teacher/courses/${course.id}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                            >
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{course.description || 'No description'}</p>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">{course.sections?.length || 0} sections</span>
                                        <span className={`px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
