import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Compass, BookOpen, Trophy, User } from 'lucide-react'

const links = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse', path: '/courses', icon: Compass },
    { name: 'Courses', path: '/learning', icon: BookOpen },
    { name: 'Wins', path: '/achievements', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
]

export default function StudentMobileNav() {
    const location = useLocation()

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] md:hidden">
            <div className="mx-3 mb-3 grid grid-cols-5 gap-1 rounded-2xl border border-white/80 bg-white/90 p-1.5 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.6)] backdrop-blur-2xl">
                {links.map((link) => {
                    const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`)
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/25'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <link.icon className="h-4 w-4" />
                            <span>{link.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
