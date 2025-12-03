import { Link } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { BookOpen, BarChart3, Upload, Layers, CheckCircle, FileText, Plus, TrendingUp, Users, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function TeacherDashboard() {
    const { getToken } = useAuth()
    const [stats, setStats] = useState({ courses: 0, sections: 0, lessons: 0, published: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const token = await getToken()
                const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                const res = await axios.get('/api/courses/instructor', cfg)
                const courses = res.data || []
                const sections = courses.reduce((acc, c) => acc + (c.sections?.length || 0), 0)
                const lessons = courses.reduce((acc, c) => acc + (c.sections?.reduce((a, s) => a + (s.lessons?.length || 0), 0) || 0), 0)
                const published = courses.filter(c => c.isPublished).length
                setStats({ courses: courses.length, sections, lessons, published })
            } catch (err) {
                console.error('Error fetching stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [getToken])

    const statCards = [
        { label: 'Total Courses', value: stats.courses, icon: Layers, color: 'blue', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'Lessons Created', value: stats.lessons, icon: BookOpen, color: 'indigo', bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { label: 'Total Sections', value: stats.sections, icon: FileText, color: 'purple', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
        { label: 'Published', value: stats.published, icon: CheckCircle, color: 'emerald', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' }
    ]

    const quickActions = [
        {
            title: 'My Courses',
            description: 'Manage your course library',
            icon: BookOpen,
            link: '/teacher/courses',
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:from-blue-600 hover:to-blue-700'
        },
        {
            title: 'Create Course',
            description: 'Build a new course',
            icon: Plus,
            link: '/teacher/course-builder',
            color: 'from-emerald-500 to-emerald-600',
            hoverColor: 'hover:from-emerald-600 hover:to-emerald-700'
        },
        {
            title: 'Upload Content',
            description: 'Add videos and materials',
            icon: Upload,
            link: '/teacher/content-upload',
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'hover:from-purple-600 hover:to-purple-700'
        },
        {
            title: 'AI Indexing',
            description: 'Index materials for AI tutor',
            icon: TrendingUp,
            link: '/teacher/content-ingestion',
            color: 'from-orange-500 to-orange-600',
            hoverColor: 'hover:from-orange-600 hover:to-orange-700'
        },
        {
            title: 'Analytics',
            description: 'View course performance',
            icon: BarChart3,
            link: '/teacher/analytics',
            color: 'from-slate-600 to-slate-700',
            hoverColor: 'hover:from-slate-700 hover:to-slate-800'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Instructor Studio</h1>
                                <p className="text-sm text-slate-500">Astralearn</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link 
                                to="/dashboard" 
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                            >
                                Student View
                            </Link>
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-10 h-10 border-2 border-slate-200 hover:border-primary transition-colors"
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back! 👋</h2>
                    <p className="text-slate-600">Here's what's happening with your courses today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statCards.map((stat, index) => (
                        <div 
                            key={index}
                            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {loading ? '...' : stat.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.link}
                                className={`group relative bg-gradient-to-br ${action.color} ${action.hoverColor} text-white rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-1 overflow-hidden`}
                            >
                                {/* Background decoration */}
                                <div className="absolute -right-8 -top-8 opacity-10">
                                    <action.icon className="h-32 w-32" />
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                            <action.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-1">{action.title}</h4>
                                    <p className="text-white/80 text-sm">{action.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
