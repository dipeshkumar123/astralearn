import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { BookOpen, BarChart3, Upload, Layers, CheckCircle, FileText, Plus, TrendingUp, ArrowRight } from 'lucide-react'
import axios from 'axios'
import TeacherHeader from '../../components/TeacherHeader'

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
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [getToken])

    const statCards = [
        { label: 'Total Courses', value: stats.courses, icon: Layers, bgColor: 'bg-primary/10', iconColor: 'text-primary' },
        { label: 'Lessons Created', value: stats.lessons, icon: BookOpen, bgColor: 'bg-accent/10', iconColor: 'text-accent-dark' },
        { label: 'Total Sections', value: stats.sections, icon: FileText, bgColor: 'bg-secondary/15', iconColor: 'text-secondary-dark' },
        { label: 'Published', value: stats.published, icon: CheckCircle, bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' }
    ]

    const quickActions = [
        { title: 'My Courses', description: 'Manage your course library', icon: BookOpen, link: '/teacher/courses', color: 'from-primary to-accent', hoverColor: 'hover:from-primary-dark hover:to-accent-dark' },
        { title: 'Create Course', description: 'Build a new course', icon: Plus, link: '/teacher/courses', color: 'from-emerald-500 to-emerald-600', hoverColor: 'hover:from-emerald-600 hover:to-emerald-700' },
        { title: 'Upload Content', description: 'Add videos and materials', icon: Upload, link: '/teacher/content-upload', color: 'from-secondary to-secondary-dark', hoverColor: 'hover:from-secondary-dark hover:to-amber-700' },
        { title: 'Analytics', description: 'View course performance', icon: BarChart3, link: '/teacher/analytics', color: 'from-slate-600 to-slate-700', hoverColor: 'hover:from-slate-700 hover:to-slate-800' },
        { title: 'AI Ingestion', description: 'Index content for tutoring', icon: TrendingUp, link: '/teacher/content-ingestion', color: 'from-orange-500 to-orange-600', hoverColor: 'hover:from-orange-600 hover:to-orange-700' }
    ]

    return (
        <div className="min-h-screen">
            <TeacherHeader title="Instructor Studio" subtitle="Overview of your course workspace" backLink="/teacher" showStudentView />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-8 glass-panel rounded-2xl p-5 sm:p-6">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                    <p className="text-slate-600">Here is what is happening with your courses today.</p>
                </div>

                <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900">{loading ? '...' : stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                        {quickActions.map((action, index) => (
                            <Link key={index} to={action.link} className={`group relative bg-gradient-to-br ${action.color} ${action.hoverColor} text-white rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-1 overflow-hidden`}>
                                <div className="absolute -right-8 -top-8 opacity-10">
                                    <action.icon className="h-32 w-32" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                            <action.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-1">{action.title}</h4>
                                    <p className="text-white/90 text-sm">{action.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
