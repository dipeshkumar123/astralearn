import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default function TeacherHeader({ title, subtitle, backLink, showStudentView = true }) {
    return (
        <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {backLink && (
                            <Link
                                to={backLink}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/30">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">{title}</h1>
                                {subtitle && <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 sm:gap-3">
                        {showStudentView && (
                            <Link
                                to="/dashboard"
                                className="btn-secondary px-3 py-2 text-sm"
                            >
                                Student View
                            </Link>
                        )}

                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: 'w-10 h-10 border-2 border-slate-200 hover:border-primary transition-colors'
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
