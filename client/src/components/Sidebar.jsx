import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Trophy, Settings, LogOut, User, Sparkles } from 'lucide-react'
import { useClerk } from '@clerk/clerk-react'

export default function Sidebar() {
    const location = useLocation()
    const { signOut } = useClerk()

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Courses', path: '/learning', icon: BookOpen },
        { name: 'Achievements', path: '/achievements', icon: Trophy },
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
    ]

    return (
        <aside className="hidden h-screen w-72 flex-col border-r border-white/70 bg-white/70 backdrop-blur-2xl md:fixed md:left-0 md:top-0 md:z-40 md:flex">
            <div className="border-b border-slate-100 px-5 pb-4 pt-5">
                <Link to="/" className="group flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block text-lg font-extrabold tracking-tight text-slate-900">Astralearn</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Student Space</span>
                    </div>
                </Link>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Focus mode on. Keep your learning streak alive today.
                </p>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
                {links.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-primary/12 to-accent/12 text-primary shadow-sm'
                                : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                }`}
                        >
                            <link.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                            {link.name}
                        </Link>
                    )
                })}
            </div>

            <div className="mx-4 mb-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/12 to-accent/12 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Daily Tip</p>
                <p className="mt-2 text-sm text-slate-700">Complete one short lesson before noon to build consistency.</p>
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
