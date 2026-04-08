import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlayCircle, Clock, BookOpen, CheckCircle, Star } from 'lucide-react'
import axios from 'axios'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

export default function CourseCard({ course, progress, compact = false }) {
    const [stats, setStats] = useState({ average: 0, count: 0 })
    const completedLessons = progress?.completedLessons?.length || 0
    const totalLessons = course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0
    const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`/api/reviews/stats/${course.id}`)
                setStats(res.data)
            } catch (error) {
                console.error('Error fetching stats:', error)
            }
        }
        fetchStats()
    }, [course.id])

    return (
        <Link to={`/courses/${course.id}`} className="block h-full">
            <Card className="group flex h-full flex-col overflow-hidden border-white/90 p-0" hover>
                <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'h-32 sm:h-36' : 'h-44 sm:h-48'}`}>
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                            <BookOpen className="h-12 w-12 text-primary/40" />
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                        <div className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <PlayCircle className="h-6 w-6 text-primary ml-1" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <Badge variant="primary">Course</Badge>
                        {stats.count > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span>{stats.average.toFixed(1)}</span>
                                <span className="text-slate-400">({stats.count})</span>
                            </div>
                        )}
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-primary sm:text-lg">
                        {course.title}
                    </h3>

                    {!compact && (
                        <p className="mb-4 flex-1 line-clamp-2 text-sm text-slate-500">
                            {course.description || "No description available."}
                        </p>
                    )}

                    <div className="mt-auto border-t border-slate-100 pt-4">
                        {progress ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-600">{percentComplete}% Complete</span>
                                    {percentComplete === 100 && <span className="text-green-600">Completed</span>}
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                                        style={{ width: `${percentComplete}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-slate-900">
                                    {course.price === 0 ? 'Free' : `$${course.price}`}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                    <BookOpen className="h-3 w-3" />
                                    {totalLessons} Lessons
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    )
}
