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
            <Card className="p-6 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </Card>
        )
    }

    return (
        <Card className="p-6 h-full bg-white border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                    <Trophy className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Leaderboard</h2>
            </div>

            <div className="space-y-4">
                {users.map((user, index) => (
                    <div
                        key={user.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${index === 0 ? 'bg-yellow-50 border border-yellow-100' : index === 1 ? 'bg-slate-50 border border-slate-100' : index === 2 ? 'bg-orange-50 border border-orange-100' : 'hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-slate-400 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'text-slate-500'}`}>
                                {index + 1}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || '')}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <div className="flex gap-2 text-xs text-slate-500">
                                        <span>{user.streak} day streak</span>
                                        {user.badges && user.badges.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                {user.badges.length} badges
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="block font-bold text-primary">{user.points}</span>
                            <span className="text-xs text-slate-500">pts</span>
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        No active learners yet. Be the first!
                    </div>
                )}
            </div>
        </Card>
    )
}
