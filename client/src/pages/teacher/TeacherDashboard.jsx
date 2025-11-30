import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { BookOpen, BarChart3, Upload } from 'lucide-react'

export default function TeacherDashboard() {
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

                    <div className="bg-gray-200 p-6 rounded-lg flex items-center gap-4 opacity-75">
                        <BarChart3 className="h-8 w-8 text-gray-500" />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700">Analytics</h3>
                            <p className="text-gray-500">Coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
