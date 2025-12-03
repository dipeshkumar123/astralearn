import { useState, useEffect } from 'react'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { BookOpen, Clock, Trophy, LogOut, Mail, User, Shield } from 'lucide-react'
import axios from 'axios'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import Achievements from '../components/Achievements'

export default function ProfilePage() {
    const { user } = useUser()
    const { signOut } = useClerk()
    const { getToken } = useAuth()
    const [stats, setStats] = useState({
        avgScore: 0,
        hoursLearned: 0,
        completedCourses: 0,
        currentStreak: 0
    })
    const [enrolledCourses, setEnrolledCourses] = useState([])

    useEffect(() => {
        if (user) {
            fetchProfileData()
        }
    }, [user])

    const fetchProfileData = async () => {
        try {
            const token = await getToken()
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

            // 1. Get internal user ID
            const userRes = await axios.get('/api/users/me', config)
            const internalUserId = userRes.data.id

            // 2. Get Stats
            const statsRes = await axios.get(`/api/users/${internalUserId}/stats`, config)
            setStats(statsRes.data)

            // 3. Get Enrolled Courses
            const coursesRes = await axios.get(`/api/courses/my-courses`, config)
            setEnrolledCourses(coursesRes.data)

        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    if (!user) return null

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-500 mt-1">Manage your account and view your progress</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="text-center">
                        <div className="relative inline-block mb-4">
                            <img
                                src={user.imageUrl}
                                alt={user.fullName}
                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto"
                            />
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">{user.fullName}</h2>
                        <p className="text-sm text-slate-500 mb-6">{user.primaryEmailAddress?.emailAddress}</p>

                        <div className="flex justify-center gap-4 mb-6 py-4 border-t border-b border-slate-100">
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-900">{stats.completedCourses}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Courses</div>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-900">{stats.avgScore}%</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Avg Score</div>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() => signOut()}
                            className="w-full text-red-600 hover:bg-red-50 hover:border-red-200"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-slate-900 mb-4">Account Details</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{user.primaryEmailAddress?.emailAddress}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <User className="h-4 w-4" />
                                <span>Student Account</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Shield className="h-4 w-4" />
                                <span>Verified</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Achievements */}
                    <Achievements points={stats.points} streak={stats.currentStreak} badges={stats.badges} />
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: BookOpen, label: "Hours Learned", value: stats.hoursLearned, color: "text-blue-600", bg: "bg-blue-100" },
                            { icon: Trophy, label: "Certificates", value: stats.completedCourses, color: "text-yellow-600", bg: "bg-yellow-100" },
                            { icon: Clock, label: "Current Streak", value: `${stats.currentStreak} Days`, color: "text-green-600", bg: "bg-green-100" }
                        ].map((stat, idx) => (
                            <Card key={idx} className="flex items-center gap-4 p-5">
                                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                                    <div className="text-sm text-slate-500">{stat.label}</div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Enrolled Courses */}
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">My Courses</h3>
                            <Badge variant="primary">{enrolledCourses.length} Active</Badge>
                        </div>

                        <div className="space-y-4">
                            {enrolledCourses.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    No courses enrolled yet.
                                </div>
                            ) : (
                                enrolledCourses.map((course) => (
                                    <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors">
                                        <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0 overflow-hidden">
                                            {course.thumbnail && (
                                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-900 truncate">{course.title}</h4>
                                            <div className="text-xs text-slate-500 mt-1">In Progress</div>
                                        </div>
                                        <Button size="sm" variant="secondary" className="hidden sm:flex">
                                            Continue
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
