import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Search, Flame, Target, BookOpen } from 'lucide-react'
import axios from 'axios'
import CourseCard from '../components/CourseCard'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import Leaderboard from '../components/Leaderboard'
import { Button } from '../components/ui/Button'

export default function Dashboard() {
    const { getToken } = useAuth()
    const { user } = useUser()
    const [courses, setCourses] = useState([])
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('browse')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedLevel, setSelectedLevel] = useState('All')
    const [stats, setStats] = useState({ points: 0, currentStreak: 0, hoursLearned: 0 })

    useEffect(() => {
        fetchCourses()
        fetchUserData()
    }, [searchQuery, selectedCategory, selectedLevel])

    const fetchCourses = async () => {
        try {
            const params = {}
            if (searchQuery) params.search = searchQuery
            if (selectedCategory !== 'All') params.category = selectedCategory
            if (selectedLevel !== 'All') params.level = selectedLevel

            const res = await axios.get('/api/courses', { params })
            setCourses(res.data)
        } catch (error) {
            console.error('Failed to fetch courses:', error)
        } finally {
            setLoading(false)
        }
    }

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

    const calculateProgress = () => 0

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    const categories = ['All', 'Development', 'Business', 'Design', 'Marketing', 'Lifestyle']
    const quickStats = [
        {
            label: 'Study streak',
            value: `${stats.currentStreak || 0} days`,
            icon: Flame,
            tone: 'from-secondary/25 to-secondary/10 text-secondary-dark border-secondary/30',
        },
        {
            label: 'Total points',
            value: `${stats.points || 0} pts`,
            icon: Target,
            tone: 'from-primary/20 to-accent/10 text-primary border-primary/30',
        },
        {
            label: 'Hours learned',
            value: `${stats.hoursLearned || 0} hrs`,
            icon: BookOpen,
            tone: 'from-accent/20 to-primary/10 text-accent-dark border-accent/30',
        },
        {
            label: 'Active courses',
            value: `${enrolledCourses.length}`,
            icon: Search,
            tone: 'from-slate-100 to-slate-50 text-slate-700 border-slate-200',
        },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            <section className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7">
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.28),transparent_70%)]" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.24),transparent_70%)]" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Welcome back, {user?.firstName || 'Learner'}</p>
                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">Let&apos;s keep your momentum going.</h1>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                            You have already studied {stats.hoursLearned || 0} hours. Pick your next step and keep your streak alive.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:max-w-xl">
                        {quickStats.map((item) => (
                            <div key={item.label} className={`rounded-2xl border bg-gradient-to-br p-3 sm:p-4 ${item.tone}`}>
                                <item.icon className="mb-2 h-4 w-4 sm:h-5 sm:w-5" />
                                <p className="text-xs font-semibold uppercase tracking-wide">{item.label}</p>
                                <p className="mt-1 text-base font-bold sm:text-lg">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-6">
                    {enrolledCourses.length > 0 && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
                                <Link to="/learning" className="text-sm font-semibold text-primary hover:underline">View all</Link>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {enrolledCourses.slice(0, 2).map((course) => (
                                    <CourseCard key={course.id} course={course} progress={calculateProgress(course)} compact />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="glass-panel rounded-3xl p-4 sm:p-6">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Explore Courses</h2>

                            <div className="inline-flex w-fit items-center rounded-full bg-slate-100 p-1">
                                <button
                                    onClick={() => setActiveTab('browse')}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'browse' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Browse
                                </button>
                                <button
                                    onClick={() => setActiveTab('my-courses')}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === 'my-courses' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    My Courses
                                </button>
                            </div>
                        </div>

                        {activeTab === 'browse' && (
                            <div className="space-y-5">
                                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px]">
                                    <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by title or keyword" />
                                    <select
                                        value={selectedLevel}
                                        onChange={(event) => setSelectedLevel(event.target.value)}
                                        className="h-11 rounded-xl border border-slate-200/80 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                    >
                                        <option value="All">All Levels</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>

                                <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

                                {courses.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-slide-up">
                                        {courses.map((course) => (
                                            <CourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-12 text-center">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                            <Search className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">No courses found</h3>
                                        <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'my-courses' && (
                            enrolledCourses.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-slide-up">
                                    {enrolledCourses.map((course) => (
                                        <CourseCard key={course.id} course={course} progress={calculateProgress(course)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-12 text-center">
                                    <h3 className="text-lg font-semibold text-slate-900">No enrollments yet</h3>
                                    <p className="mb-6 mt-2 text-sm text-slate-500">Start your learning journey today.</p>
                                    <Button onClick={() => setActiveTab('browse')}>Browse Courses</Button>
                                </div>
                            )
                        )}
                    </section>
                </div>

                <div className="space-y-6">
                    <Leaderboard />
                </div>
            </div>
        </div>
    )
}