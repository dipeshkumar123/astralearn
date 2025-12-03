import { Link } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { BookOpen, ArrowLeft } from 'lucide-react'

export default function TeacherHeader({ title, subtitle, backLink, showStudentView = true }) {
    return (
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-4">
                        {backLink && (
                            <Link 
                                to={backLink}
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {showStudentView && (
                            <Link 
                                to="/dashboard" 
                                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors rounded-lg hover:bg-slate-50"
                            >
                                Student View
                            </Link>
                        )}
                        <UserButton 
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10 border-2 border-slate-200 hover:border-primary transition-colors"
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
