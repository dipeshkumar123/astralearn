import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { BarChart3, Users, TrendingUp, Award } from 'lucide-react'
import axios from 'axios'

export default function Analytics() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalEnrollments: 0,
        avgCompletion: 0,
        avgQuizScore: 0
    })

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            // Fetch all courses
            const coursesRes = await axios.get('/api/courses')
            setCourses(coursesRes.data)

            // Calculate basic stats
            const totalCourses = coursesRes.data.length
            const totalEnrollments = coursesRes.data.reduce((sum, course) =>
                sum + (course.enrollments?.length || 0), 0
            )

            setStats({
                totalCourses,
                totalEnrollments,
                avgCompletion: 0, // Placeholder
                avgQuizScore: 0 // Placeholder
            })

            setLoading(false)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/teacher" className="text-gray-600 hover:text-gray-900">
                                ← Back
                            </Link>
                            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                        </div>
                        <UserButton />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">Loading analytics...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <BarChart3 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Courses</p>
                                        <p className="text-2xl font-bold">{stats.totalCourses}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Enrollments</p>
                                        <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Completion</p>
                                        <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-100 p-3 rounded-lg">
                                        <Award className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Quiz Score</p>
                                        <p className="text-2xl font-bold">{stats.avgQuizScore}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Course List with Basic Stats */}
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold">Course Performance</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Course</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Sections</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Lessons</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {courses.map(course => {
                                            const sectionCount = course.sections?.length || 0
                                            const lessonCount = course.sections?.reduce((sum, section) =>
                                                sum + (section.lessons?.length || 0), 0
                                            ) || 0

                                            return (
                                                <tr key={course.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            to={`/teacher/courses/${course.id}`}
                                                            className="font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            {course.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{sectionCount}</td>
                                                    <td className="px-6 py-4 text-gray-600">{lessonCount}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-sm ${course.isPublished
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {course.isPublished ? 'Published' : 'Draft'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>

                                {courses.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        No courses yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Advanced analytics including student engagement, quiz performance,
                                and completion rates will be available once you have active enrollments and student activity.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
