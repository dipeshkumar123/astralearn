import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Shield, Users, GraduationCap, UserCircle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

const roleOptions = ['STUDENT', 'TEACHER', 'ADMIN']

function roleIcon(role) {
    if (role === 'ADMIN') return Shield
    if (role === 'TEACHER') return GraduationCap
    return UserCircle
}

export default function AdminPage() {
    const { getToken } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingUserId, setUpdatingUserId] = useState(null)

    const fetchUsers = async () => {
        try {
            const token = await getToken()
            const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            const res = await axios.get('/api/users', cfg)
            setUsers(res.data)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Unable to load users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const updateRole = async (userId, role) => {
        setUpdatingUserId(userId)
        try {
            const token = await getToken()
            const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            const res = await axios.patch(`/api/users/${userId}/role`, { role }, cfg)
            setUsers((current) => current.map((user) => user.id === userId ? { ...user, role: res.data.role } : user))
            toast.success('Role updated')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Role update failed')
        } finally {
            setUpdatingUserId(null)
        }
    }

    const counts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
    }, {})

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
            <section className="glass-panel rounded-3xl p-5 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Admin Console</p>
                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">User and Role Management</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Promote trusted users to teacher or admin roles. Student accounts cannot self-upgrade.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {roleOptions.map((role) => {
                            const Icon = roleIcon(role)
                            return (
                                <div key={role} className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-center">
                                    <Icon className="mx-auto mb-1 h-4 w-4 text-primary" />
                                    <p className="text-lg font-bold text-slate-900">{counts[role] || 0}</p>
                                    <p className="text-xs font-semibold text-slate-500">{role}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <Card className="overflow-hidden p-0">
                <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-slate-900">Users</h2>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {users.map((user) => {
                        const Icon = roleIcon(user.role)
                        const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email

                        return (
                            <div key={user.id} className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_150px_190px] lg:items-center">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                                        <p className="truncate font-semibold text-slate-900">{displayName}</p>
                                        <Badge variant={user.role === 'STUDENT' ? 'secondary' : 'primary'}>{user.role}</Badge>
                                    </div>
                                    <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
                                </div>

                                <div className="text-sm text-slate-500">
                                    {user._count?.courses || 0} courses / {user._count?.enrollments || 0} enrollments
                                </div>

                                <select
                                    value={user.role}
                                    disabled={updatingUserId === user.id}
                                    onChange={(event) => updateRole(user.id, event.target.value)}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                >
                                    {roleOptions.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    )
}
