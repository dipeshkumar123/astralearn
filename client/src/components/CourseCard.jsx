import { Link } from 'react-router-dom'
import { PlayCircle, Star, Users, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CourseCard({ course, progress, compact = false, stats = { average: 0, count: 0 } }) {
    const completedLessons = progress?.completedLessons?.length || 0
    const totalLessons = course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0
    const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const moduleCount = course.sections?.length || 0
    const learnerCount = course._count?.enrollments || 0

    const firstLetter = (course.title || 'C').charAt(0).toUpperCase()

    return (
        <Link to={`/courses/${course.id}`} className="block h-full group focus:outline-none">
            <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="card-shine bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
            >
                <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'h-36' : 'h-48'}`}>
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="course-fallback-visual flex h-full w-full items-center justify-center">
                            <span className="text-5xl font-bold text-white/80 select-none">{firstLetter}</span>
                        </div>
                    )}

                    <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                            {course.level || 'Beginner'}
                        </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors duration-300 group-hover:bg-slate-900/20">
                        <div className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <PlayCircle className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {course.category || 'Course'}
                        </span>
                        {stats.count > 0 && (
                            <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span>{stats.average.toFixed(1)}</span>
                                <span className="text-slate-400">({stats.count})</span>
                            </div>
                        )}
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {course.title}
                    </h3>

                    {!compact && (
                        <p className="mb-4 flex-1 line-clamp-2 text-sm text-slate-500">
                            {course.description || "No description available."}
                        </p>
                    )}

                    <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <Layers className="h-4 w-4 text-slate-400" />
                            <span>{moduleCount} modules</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span>{learnerCount} joined</span>
                        </div>
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-4">
                        {progress ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-slate-600">{completedLessons} of {totalLessons} complete</span>
                                    <span className={percentComplete === 100 ? "text-emerald-600" : "text-primary"}>
                                        {percentComplete === 100 ? 'Done' : `${percentComplete}%`}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                        style={{ width: `${percentComplete}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-slate-900">
                                    {course.price === 0 ? 'Free' : `$${course.price}`}
                                </span>
                                <span className="text-sm font-semibold text-primary flex items-center gap-1">
                                    View course <PlayCircle className="h-4 w-4" />
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
