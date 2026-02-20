import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Trophy, Settings, LogOut, User } from 'lucide-react'
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
        <div className="h-screen w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200 fixed left-0 top-0 flex flex-col z-40 hidden md:flex">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                        A
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-secondary-dark">
                        Astralearn
                    </span>
                </Link>
            </div>

            {/* Nav Links */}
            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <link.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                            {link.name}
                        </Link>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
