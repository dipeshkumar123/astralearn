import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { Trophy, Award, Star, Target, Flame, Book } from 'lucide-react'
import { Card } from '../components/ui/Card'

export default function AchievementsPage() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken()
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        const userRes = await axios.get('/api/users/me', config)
        const userId = userRes.data.id

        const statsRes = await axios.get(`/api/users/${userId}/stats`, config)
        setStats(statsRes.data)
      } catch (e) {
        console.error('Failed to fetch stats:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [getToken])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  const badges = [
    { id: 'first-course', name: 'First Course', desc: 'Enrolled in your first course', icon: Book, earned: stats?.completedCourses > 0 },
    { id: 'quiz-master', name: 'Quiz Master', desc: 'Scored 100% on a quiz', icon: Star, earned: stats?.avgScore === 100 },
    { id: 'consistent', name: 'Consistent Learner', desc: '7 day learning streak', icon: Flame, earned: (stats?.currentStreak || 0) >= 7 },
    { id: 'achiever', name: 'Achiever', desc: 'Completed 5 courses', icon: Trophy, earned: stats?.completedCourses >= 5 },
    { id: 'dedicated', name: 'Dedicated', desc: 'Spent 50+ hours learning', icon: Target, earned: parseFloat(stats?.hoursLearned || 0) >= 50 },
    { id: 'overachiever', name: 'Overachiever', desc: 'Completed 10 courses', icon: Award, earned: stats?.completedCourses >= 10 },
  ]

  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Achievements</h1>
        <p className="text-slate-600 mt-1">Your learning milestones and badges</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Points</p>
              <p className="text-3xl font-bold text-primary mt-1">{stats?.points || 0}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Star className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats?.currentStreak || 0} days</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Badges Earned</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{earnedBadges.length}/{badges.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Courses Done</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats?.completedCourses || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Earned Badges</h2>
        {earnedBadges.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-slate-500">No badges earned yet. Keep learning to unlock achievements!</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map(badge => (
              <Card key={badge.id} className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <badge.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{badge.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{badge.desc}</p>
                    <p className="text-xs text-primary font-medium mt-2">Unlocked</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {lockedBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Locked Badges</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lockedBadges.map(badge => (
              <Card key={badge.id} className="p-6 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-full">
                    <badge.icon className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-700">{badge.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{badge.desc}</p>
                    <p className="text-xs text-slate-400 font-medium mt-2">Locked</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
