import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { BookOpen, Trophy, Clock, Search, Flame, Target } from 'lucide-react'
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
    const [activeTab, setActiveTab] = useState('browse') // 'browse' or 'my-courses'
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedLevel, setSelectedLevel] = useState('All')
    const [stats, setStats] = useState({ points: 0, streak: 0, hoursLearned: 0 })

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
                const enrolled = res.data.enrollments.map(e => e.course)
                setEnrolledCourses(enrolled)
            }

            // Fetch stats
            if (res.data.id) {
                const statsRes = await axios.get(`/api/users/${res.data.id}/stats`)
                setStats(statsRes.data)
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error)
        }
    }

    const calculateProgress = (course) => {
        return 0 // Placeholder
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const categories = ['All', 'Development', 'Business', 'Design', 'Marketing', 'Lifestyle']

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="text-slate-500 mt-1">You've learned for {stats.hoursLearned} hours. Keep it up!</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
                        <Flame className="h-5 w-5" />
                        <span className="font-bold">{stats.currentStreak} Day Streak</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                        <Target className="h-5 w-5" />
                        <span className="font-bold">{stats.points} Points</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Continue Learning (if enrolled) */}
                    {enrolledCourses.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
                                <Link to="/dashboard/courses" className="text-primary font-medium hover:underline text-sm">
                                    View all
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {enrolledCourses.slice(0, 2).map(course => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        progress={calculateProgress(course)}
                                        compact
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Browse Section */}
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Explore Courses</h2>

                            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                                <button
                                    onClick={() => setActiveTab('browse')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'browse' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    Browse
                                </button>
                                <button
                                    onClick={() => setActiveTab('my-courses')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'my-courses' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    My Courses
                                </button>
                            </div>
                        </div>

                        {activeTab === 'browse' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <SearchBar onSearch={setSearchQuery} />
                                    </div>
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-slate-700 min-w-[150px]"
                                    >
                                        <option value="All">All Levels</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>

                                <CategoryFilter
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={setSelectedCategory}
                                />

                                {courses.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up">
                                        {courses.map(course => (
                                            <CourseCard
                                                key={course.id}
                                                course={course}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                        <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <Search className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
                                        <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'my-courses' && (
                            enrolledCourses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up">
                                    {enrolledCourses.map(course => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            progress={calculateProgress(course)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <h3 className="text-lg font-medium text-slate-900">No enrollments yet</h3>
                                    <p className="text-slate-500 mt-2 mb-6">Start your learning journey today!</p>
                                    <Button
                                        onClick={() => setActiveTab('browse')}
                                    >
                                        Browse Courses
                                    </Button>
                                </div>
                            )
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <Leaderboard />

                    {/* Quick Actions or other sidebar content could go here */}
                </div>
            </div>
        </div>
    )
}
