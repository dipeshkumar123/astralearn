import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Flame, Target, BookOpen, ArrowRight, Sparkles, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import CourseCard from '../components/CourseCard'
import Leaderboard from '../components/Leaderboard'
import { Button } from '../components/ui/Button'
import { hydrateCoursesWithProgress } from '../lib/courseProgress'
import StudyPlanner from '../components/StudyPlanner'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
}

export default function Dashboard() {
    const { getToken } = useAuth()
    const { user } = useUser()
    const [courses, setCourses] = useState([])
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('enrolled')
    const [stats, setStats] = useState({ points: 0, currentStreak: 0, hoursLearned: 0 })
    const [progressByCourse, setProgressByCourse] = useState({})

    // Fetch user data once on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await getToken()
                if (!token) return

                const res = await axios.get('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (res.data.enrollments) {
                    const enrolled = res.data.enrollments.map((enrollment) => enrollment.course)
                    setEnrolledCourses(enrolled)
                    setProgressByCourse(await hydrateCoursesWithProgress(enrolled, token, axios))
                }

                if (res.data.id) {
                    const statsRes = await axios.get(`/api/users/${res.data.id}/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setStats(statsRes.data)
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error)
            }
        }

        fetchUserData()
    }, [getToken])

    // Fetch browse courses separately
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get('/api/courses')
                const courseData = Array.isArray(res.data) ? res.data : (res.data.courses || [])
                setCourses(courseData)
            } catch (error) {
                console.error('Failed to fetch courses:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [])

    const calculateProgress = useCallback((course) => progressByCourse[course.id], [progressByCourse])
    const completedLessonsThisWeek = Object.values(progressByCourse).reduce((total, progress) => total + (progress?.completedLessons?.length || 0), 0)

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    const quickStats = [
        { label: 'Streak', value: `${stats.currentStreak || 0}d`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Points', value: stats.points || 0, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Hours', value: `${stats.hoursLearned || 0}h`, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Courses', value: enrolledCourses.length, icon: Search, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ]

    const nextCourse = enrolledCourses[0]

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            {/* Compact welcome hero + stats ribbon */}
            <motion.section variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Welcome back, {user?.firstName || 'Learner'}
                        </p>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                            Ready to pick up where you left off?
                        </h1>
                    </div>
                    <Link to={nextCourse ? `/courses/${nextCourse.id}` : '/courses'} className="btn-primary shrink-0 self-start">
                        {nextCourse ? 'Continue learning' : 'Find a course'}
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>

                {/* Stats ribbon */}
                <div className="relative z-10 mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-5">
                    {quickStats.map((item) => (
                        <div key={item.label} className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 leading-tight">{item.value}</p>
                                <p className="text-xs text-slate-500">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Courses section with tabs */}
                    <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Courses</h2>
                            <div className="inline-flex bg-slate-100 rounded-lg p-1">
                                {['enrolled', 'browse'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                            activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab === 'enrolled' ? 'Enrolled' : 'Browse'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'enrolled' && (
                            enrolledCourses.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {enrolledCourses.map((course) => (
                                        <CourseCard key={course.id} course={course} progress={calculateProgress(course)} compact />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-slate-900">Not enrolled in any courses</h3>
                                    <p className="text-slate-500 mb-4">Start your learning journey today!</p>
                                    <Button onClick={() => setActiveTab('browse')}>Browse Courses</Button>
                                </div>
                            )
                        )}

                        {activeTab === 'browse' && (
                            <>
                                {courses.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {courses.slice(0, 6).map((course) => (
                                            <CourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-slate-900">No courses available</h3>
                                        <p className="text-slate-500">Check back soon for new content.</p>
                                    </div>
                                )}
                                <div className="mt-5 text-center">
                                    <Link to="/courses" className="text-primary font-semibold hover:text-primary-dark inline-flex items-center gap-1">
                                        View all courses <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </>
                        )}
                    </section>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <StudyPlanner completedLessonsThisWeek={completedLessonsThisWeek} />
                    <Leaderboard />
                </motion.div>
            </div>
        </motion.div>
    )
}
