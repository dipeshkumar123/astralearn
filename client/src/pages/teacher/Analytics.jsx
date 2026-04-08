import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Users, TrendingUp, Award } from 'lucide-react'
import axios from 'axios'
import TeacherHeader from '../../components/TeacherHeader'

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
            const coursesRes = await axios.get('/api/courses')
            setCourses(coursesRes.data)

            const totalCourses = coursesRes.data.length
            const totalEnrollments = coursesRes.data.reduce((sum, course) =>
                sum + (course.enrollments?.length || 0), 0
            )

            setStats({
                totalCourses,
                totalEnrollments,
                avgCompletion: 0,
                avgQuizScore: 0
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            label: 'Total Courses',
            value: stats.totalCourses,
            icon: BarChart3,
            tone: 'from-primary/15 to-accent/10 border-primary/25 text-primary',
        },
        {
            label: 'Total Enrollments',
            value: stats.totalEnrollments,
            icon: Users,
            tone: 'from-secondary/20 to-secondary/10 border-secondary/30 text-secondary-dark',
        },
        {
            label: 'Avg Completion',
            value: `${stats.avgCompletion}%`,
            icon: TrendingUp,
            tone: 'from-accent/20 to-primary/10 border-accent/30 text-accent-dark',
        },
        {
            label: 'Avg Quiz Score',
            value: `${stats.avgQuizScore}%`,
            icon: Award,
            tone: 'from-slate-100 to-slate-50 border-slate-200 text-slate-700',
        },
    ]

    return (
        <div className="min-h-screen">
            <TeacherHeader title="Analytics" subtitle="Track course performance and publishing health" backLink="/teacher" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
                        <p className="mt-3 text-sm text-slate-600">Loading analytics...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {statCards.map((item) => (
                                <div key={item.label} className={`rounded-2xl border bg-gradient-to-br p-5 ${item.tone}`}>
                                    <item.icon className="mb-3 h-5 w-5" />
                                    <p className="text-xs font-semibold uppercase tracking-wide">{item.label}</p>
                                    <p className="mt-1 text-2xl font-bold">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <section className="glass-panel rounded-3xl overflow-hidden">
                            <div className="border-b border-slate-200/70 px-5 py-4">
                                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Course Performance</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">Course</th>
                                            <th className="px-5 py-3 font-semibold">Sections</th>
                                            <th className="px-5 py-3 font-semibold">Lessons</th>
                                            <th className="px-5 py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white/70 text-sm">
                                        {courses.map((course) => {
                                            const sectionCount = course.sections?.length || 0
                                            const lessonCount = course.sections?.reduce((sum, section) =>
                                                sum + (section.lessons?.length || 0), 0
                                            ) || 0

                                            return (
                                                <tr key={course.id} className="transition-colors hover:bg-slate-50/80">
                                                    <td className="px-5 py-4">
                                                        <Link to={`/teacher/courses/${course.id}`} className="font-semibold text-primary hover:underline">
                                                            {course.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">{sectionCount}</td>
                                                    <td className="px-5 py-4 text-slate-600">{lessonCount}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${course.isPublished
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
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
                                    <div className="py-12 text-center text-slate-500">No courses yet</div>
                                )}
                            </div>
                        </section>

                        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                            <p className="text-sm text-slate-700">
                                <strong>Tip:</strong> As student activity grows, this dashboard will include richer metrics like engagement, completion trends, and quiz outcomes.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}