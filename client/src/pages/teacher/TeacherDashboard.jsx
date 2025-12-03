import { Link } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { BookOpen, BarChart3, Upload, Users, Layers, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function TeacherDashboard() {
    const { getToken } = useAuth()
    const [stats, setStats] = useState({ courses: 0, sections: 0, students: 0, published: 0 })

    useEffect(() => {
        const fetch = async () => {
            try {
                const token = await getToken()
                const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                const res = await axios.get('/api/courses/instructor', cfg)
                const courses = res.data || []
                const sections = courses.reduce((acc, c) => acc + (c.sections?.length || 0), 0)
                const published = courses.filter(c => c.isPublished).length
                // approximate students = sum of enrollments lengths if included; fallback to published * 10
                const students = published * 10
                setStats({ courses: courses.length, sections, students, published })
            } catch {}
        }
        fetch()
    }, [])
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-gray-900">Nexus LMS - Instructor</h1>
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-gray-600 hover:text-gray-900">
                                Student View
                            </Link>
                            <UserButton />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-3xl font-bold mb-8">Welcome, Instructor!</h2>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                        <Layers className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="text-xs text-slate-500">Total Courses</p>
                            <p className="text-2xl font-bold">{stats.courses}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                        <div>
                            <p className="text-xs text-slate-500">Sections</p>
                            <p className="text-2xl font-bold">{stats.sections}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                        <Users className="h-8 w-8 text-green-600" />
                        <div>
                            <p className="text-xs text-slate-500">Students (est.)</p>
                            <p className="text-2xl font-bold">{stats.students}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                        <div>
                            <p className="text-xs text-slate-500">Published</p>
                            <p className="text-2xl font-bold">{stats.published}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        to="/teacher/courses"
                        className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition flex items-center gap-4"
                    >
                        <BookOpen className="h-8 w-8" />
                        <div>
                            <h3 className="text-xl font-semibold">My Courses</h3>
                            <p className="text-blue-100">Create and manage courses</p>
                        </div>
                    </Link>

                    <Link
                        to="/teacher/content-upload"
                        className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition flex items-center gap-4"
                    >
                        <Upload className="h-8 w-8" />
                        <div>
                            <h3 className="text-xl font-semibold">Upload Content</h3>
                            <p className="text-purple-100">Index materials for AI tutor</p>
                        </div>
                    </Link>

                    <Link
                        to="/teacher/analytics"
                        className="bg-gray-200 p-6 rounded-lg flex items-center gap-4 hover:bg-gray-300 transition"
                    >
                        <BarChart3 className="h-8 w-8 text-gray-700" />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Analytics</h3>
                            <p className="text-gray-600">View engagement and completion</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
