import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { CalendarDays, Clock, Target, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

const focusOptions = ['Frontend', 'Backend', 'AI', 'Design', 'Business', 'Career']
const timeOptions = ['Morning', 'Afternoon', 'Evening', 'Night']

export default function StudyPlanner({ completedLessonsThisWeek = 0 }) {
    const { getToken, isSignedIn } = useAuth()
    const [goal, setGoal] = useState({
        weeklyTargetLessons: 5,
        targetMinutesPerDay: 25,
        focusAreas: [],
        preferredStudyTime: 'Evening'
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchGoal = async () => {
            if (!isSignedIn) {
                setLoading(false)
                return
            }

            try {
                const token = await getToken()
                const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                const res = await axios.get('/api/study-goals/me', cfg)
                setGoal({
                    weeklyTargetLessons: res.data.weeklyTargetLessons || 5,
                    targetMinutesPerDay: res.data.targetMinutesPerDay || 25,
                    focusAreas: Array.isArray(res.data.focusAreas) ? res.data.focusAreas : [],
                    preferredStudyTime: res.data.preferredStudyTime || 'Evening'
                })
            } catch (error) {
                console.error('Failed to fetch study goal:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchGoal()
    }, [getToken, isSignedIn])

    const saveGoal = async () => {
        setSaving(true)
        try {
            const token = await getToken()
            const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            const res = await axios.patch('/api/study-goals/me', goal, cfg)
            setGoal({
                weeklyTargetLessons: res.data.weeklyTargetLessons,
                targetMinutesPerDay: res.data.targetMinutesPerDay,
                focusAreas: Array.isArray(res.data.focusAreas) ? res.data.focusAreas : [],
                preferredStudyTime: res.data.preferredStudyTime
            })
            toast.success('Study plan updated')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not save study plan')
        } finally {
            setSaving(false)
        }
    }

    const toggleFocus = (area) => {
        setGoal((current) => ({
            ...current,
            focusAreas: current.focusAreas.includes(area)
                ? current.focusAreas.filter((item) => item !== area)
                : [...current.focusAreas, area]
        }))
    }

    const progress = Math.min(100, Math.round((completedLessonsThisWeek / Math.max(goal.weeklyTargetLessons, 1)) * 100))

    if (loading) {
        return (
            <Card className="p-5">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </Card>
        )
    }

    return (
        <Card className="surface-panel p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">Study planner</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">Your weekly goal</h2>
                    <p className="mt-1 text-sm text-slate-500">Tune the plan around how you actually study.</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Target className="h-5 w-5" />
                </div>
            </div>

            <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{completedLessonsThisWeek} of {goal.weeklyTargetLessons} lessons</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Lessons / week
                    </span>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={goal.weeklyTargetLessons}
                        onChange={(event) => setGoal((current) => ({ ...current, weeklyTargetLessons: Number(event.target.value) }))}
                        className="input-field py-2.5"
                    />
                </label>

                <label className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        Minutes / day
                    </span>
                    <input
                        type="number"
                        min="5"
                        max="240"
                        value={goal.targetMinutesPerDay}
                        onChange={(event) => setGoal((current) => ({ ...current, targetMinutesPerDay: Number(event.target.value) }))}
                        className="input-field py-2.5"
                    />
                </label>
            </div>

            <div className="mt-4">
                <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Focus areas
                </p>
                <div className="flex flex-wrap gap-2">
                    {focusOptions.map((area) => (
                        <button
                            type="button"
                            key={area}
                            onClick={() => toggleFocus(area)}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${goal.focusAreas.includes(area) ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {area}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Best study time</p>
                <div className="grid grid-cols-2 gap-2">
                    {timeOptions.map((time) => (
                        <button
                            type="button"
                            key={time}
                            onClick={() => setGoal((current) => ({ ...current, preferredStudyTime: time }))}
                            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${goal.preferredStudyTime === time ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            <Button className="mt-5 w-full" onClick={saveGoal} isLoading={saving}>
                Save study plan
            </Button>
        </Card>
    )
}
