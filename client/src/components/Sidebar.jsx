import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Trophy, Settings, LogOut, User, Sparkles, Compass } from 'lucide-react'
import { useClerk } from '@clerk/clerk-react'

export default function Sidebar() {
    const location = useLocation()
    const { signOut } = useClerk()

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, hint: 'Your study hub' },
        { name: 'Browse Courses', path: '/courses', icon: Compass, hint: 'Discover new courses' },
        { name: 'My Courses', path: '/learning', icon: BookOpen, hint: 'Continue lessons' },
        { name: 'Achievements', path: '/achievements', icon: Trophy, hint: 'Badges and points' },
        { name: 'Profile', path: '/profile', icon: User, hint: 'Progress summary' },
        { name: 'Settings', path: '/settings', icon: Settings, hint: 'Preferences' },
    ]

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-white/70 bg-white/80 backdrop-blur-2xl md:fixed md:left-0 md:top-0 md:z-40 md:flex">
            <div className="border-b border-slate-100 px-5 pb-5 pt-5">
                <Link to="/" className="group flex items-center gap-2.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block text-lg font-extrabold tracking-tight text-slate-900">Astralearn</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student Studio</span>
                    </div>
                </Link>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
                {links.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20'
                                : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                                }`}
                        >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                <link.icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                                <span className="block">{link.name}</span>
                                <span className={`block text-xs font-medium ${isActive ? 'text-white/75' : 'text-slate-400'}`}>{link.hint}</span>
                            </span>
                        </Link>
                    )
                })}
            </div>

            <div className="border-t border-slate-100 p-4">
                <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
