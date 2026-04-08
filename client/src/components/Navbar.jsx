import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { Menu, X, Search, BookOpen, LayoutDashboard, Sparkles } from 'lucide-react'
import { useUserRole } from '../hooks/useUserRole'

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const { isSignedIn } = useAuth()
    const { isTeacher } = useUserRole()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    useEffect(() => {
        if (location.pathname !== '/courses') {
            setSearchQuery('')
            return
        }

        const params = new URLSearchParams(location.search)
        setSearchQuery(params.get('search') || '')
    }, [location.pathname, location.search])

    const getDashboardPath = () => {
        return isTeacher ? '/teacher' : '/dashboard'
    }

    const submitSearch = (event) => {
        event.preventDefault()
        const trimmed = searchQuery.trim()
        if (!trimmed) {
            navigate('/courses')
            return
        }
        navigate(`/courses?search=${encodeURIComponent(trimmed)}`)
    }

    const navLinks = [
        { name: 'Browse Courses', path: '/courses', icon: BookOpen },
        ...(isSignedIn ? [{ name: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard }] : []),
    ]

    const isActivePath = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`)
    }

    return (
        <nav className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-3">
            <div className="mx-auto max-w-7xl">
                <div className={`glass-panel rounded-2xl border transition-all duration-300 ${isScrolled ? 'shadow-[0_22px_40px_-26px_rgba(15,23,42,0.55)]' : 'shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)]'}`}>
                    <div className="flex h-16 items-center justify-between px-3 sm:px-5">
                        <button
                            type="button"
                            onClick={() => navigate(isSignedIn ? getDashboardPath() : '/')}
                            className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-white/60"
                            aria-label="Go to home"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/30">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <span className="text-lg font-extrabold tracking-tight text-slate-900">Astralearn</span>
                        </button>

                        <div className="hidden items-center gap-3 md:flex lg:gap-5">
                            <form onSubmit={submitSearch} className="relative hidden lg:block">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search courses"
                                    className="h-10 w-64 rounded-full border border-slate-200/80 bg-white/80 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                />
                            </form>

                            <div className="flex items-center gap-1 rounded-full bg-slate-100/70 p-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all ${isActivePath(link.path)
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-slate-600 hover:bg-white/80 hover:text-primary'
                                            }`}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            {isSignedIn ? (
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: 'w-10 h-10 border-2 border-primary/20 hover:border-primary transition-colors'
                                        }
                                    }}
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="btn-secondary px-4 py-2 text-sm">Log in</Link>
                                    <Link to="/signup" className="btn-primary px-4 py-2 text-sm">Sign up</Link>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen((open) => !open)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 transition-colors hover:bg-white md:hidden"
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="animate-slide-up border-t border-slate-200/80 px-3 pb-4 pt-3 md:hidden">
                            <form onSubmit={submitSearch} className="relative mb-3">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search courses"
                                    className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                                />
                            </form>

                            <div className="space-y-1.5">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActivePath(link.path)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                                            }`}
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            {isSignedIn ? (
                                <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5">
                                    <p className="text-sm font-semibold text-slate-700">Account</p>
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox: 'w-9 h-9 border-2 border-primary/20 hover:border-primary transition-colors'
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="btn-secondary text-sm"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="btn-primary text-sm"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
