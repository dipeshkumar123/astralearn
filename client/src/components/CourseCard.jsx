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
            <Card className="h-full p-0 overflow-hidden flex flex-col group" hover>
                {/* Thumbnail */}
                <div className={`relative ${compact ? 'h-32' : 'h-48'} bg-slate-100 overflow-hidden`}>
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-primary/40" />
                        </div>
                    )}

                    {/* Overlay Play Button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <PlayCircle className="h-6 w-6 text-primary ml-1" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <Badge variant="primary">Course</Badge>
                        {stats.count > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span>{stats.average.toFixed(1)}</span>
                                <span className="text-slate-400">({stats.count})</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                    </h3>

                    {!compact && (
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                            {course.description || "No description available."}
                        </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-50">
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
