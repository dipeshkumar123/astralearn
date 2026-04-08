import { useState, useEffect } from 'react'
import axios from 'axios'
import { Trophy } from 'lucide-react'
import { Card } from './ui/Card'

export default function Leaderboard() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get('/api/users/leaderboard')
                setUsers(res.data)
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [])

    if (loading) {
        return (
            <Card className="h-full p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </Card>
        )
    }

    return (
        <Card className="glass-panel h-full border-white/80 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-secondary/20 p-2 text-secondary-dark">
                        <Trophy className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Leaderboard</h2>
                </div>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-500">Top Learners</span>
            </div>

            <div className="space-y-3">
                {users.map((user, index) => (
                    <div
                        key={user.id}
                        className={`rounded-2xl border p-3 transition-all ${index === 0
                            ? 'border-secondary/40 bg-secondary/10'
                            : index === 1
                                ? 'border-slate-200 bg-white/80'
                                : index === 2
                                    ? 'border-amber-200 bg-amber-50/80'
                                    : 'border-slate-200/70 bg-white/70 hover:bg-white'
                            }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0
                                    ? 'bg-secondary text-slate-900'
                                    : index === 1
                                        ? 'bg-slate-300 text-slate-700'
                                        : index === 2
                                            ? 'bg-amber-300 text-amber-900'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {index + 1}
                                </div>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || '')}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                        <span>{user.streak} day streak</span>
                                        {user.badges && user.badges.length > 0 && <span>{user.badges.length} badges</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="block text-base font-bold text-primary sm:text-lg">{user.points}</span>
                                <span className="text-xs text-slate-500">pts</span>
                            </div>
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="py-8 text-center text-slate-500">
                        No active learners yet. Be the first!
                    </div>
                )}
            </div>
        </Card>
    )
}