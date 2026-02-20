import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { Menu, X, Search, BookOpen, LayoutDashboard } from 'lucide-react'
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

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-panel border-b-0' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div 
                        onClick={() => navigate(isSignedIn ? getDashboardPath() : '/')}
                        className="flex items-center gap-2 group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                            A
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-secondary-dark">
                            Astralearn
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* Search Bar */}
                        <form onSubmit={submitSearch} className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search courses..."
                                className="pl-10 pr-4 py-2 rounded-full bg-slate-100/50 border border-transparent focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/20 w-64 transition-all outline-none text-sm"
                            />
                        </form>

                        {/* Links */}
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${location.pathname === link.path
                                        ? 'text-primary bg-primary/10'
                                        : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Auth Buttons */}
                        {isSignedIn ? (
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 border-2 border-primary/20 hover:border-primary transition-colors"
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                                    Log in
                                </Link>
                                <Link to="/signup" className="btn-primary py-2 px-4 text-sm shadow-lg shadow-primary/20">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass-panel border-t border-slate-200 absolute w-full animate-slide-up">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <form onSubmit={submitSearch} className="mb-4 mt-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search courses..."
                                className="w-full pl-4 pr-4 py-2 rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-primary/30 outline-none"
                            />
                        </form>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${location.pathname === link.path
                                    ? 'text-primary bg-primary/10'
                                    : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className="h-5 w-5" />
                                    {link.name}
                                </div>
                            </Link>
                        ))}
                        {!isSignedIn && (
                            <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="btn-secondary text-center py-2 text-sm"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="btn-primary text-center py-2 text-sm"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
