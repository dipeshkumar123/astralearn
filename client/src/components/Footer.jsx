import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Sparkles } from 'lucide-react'

export default function Footer() {
    const linkGroups = [
        {
            title: 'Learn',
            links: [
                { to: '/courses', label: 'Browse Courses' },
                { to: '/dashboard', label: 'Student Dashboard' },
                { to: '/teacher', label: 'Teacher Studio' },
            ]
        },
        {
            title: 'Account',
            links: [
                { to: '/signup', label: 'Create Account' },
                { to: '/login', label: 'Log In' },
                { to: '/onboard', label: 'Onboarding' },
            ]
        },
        {
            title: 'Explore',
            links: [
                { to: '/', label: 'Home' },
                { to: '/courses', label: 'Trending Courses' },
                { to: '/learning', label: 'My Learning' },
            ]
        },
    ]

    return (
        <footer className="relative mt-14 overflow-hidden border-t border-slate-200/70 bg-white/80 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(14,165,233,0.12),transparent_42%),radial-gradient(circle_at_88%_2%,rgba(245,158,11,0.16),transparent_38%)]" />

            <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8">
                <div className="glass-panel mb-10 rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                Weekly Learning Boost
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900">Get one smart study tip every Friday</h3>
                            <p className="mt-2 text-sm text-slate-600 sm:text-base">Short, practical, and made for busy students.</p>
                        </div>
                        <div className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="input-field h-11"
                            />
                            <button className="btn-primary h-11 whitespace-nowrap px-5">Subscribe</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <Link to="/" className="mb-4 flex w-fit items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/30">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900">Astralearn</span>
                        </Link>
                        <p className="max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                            Astralearn helps students build momentum with focused lessons, AI tutoring, and measurable progress in every session.
                        </p>
                    </div>

                    {linkGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-800">{group.title}</h3>
                            <ul className="space-y-2.5 text-sm text-slate-600">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.to} className="transition-colors hover:text-primary">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} Astralearn. Crafted for curious minds.
                    </p>
                    <div className="flex items-center gap-4 text-slate-500">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="rounded-full p-2 transition-colors hover:bg-slate-100 hover:text-primary"><Github className="h-4 w-4" /></a>
                        <a href="https://x.com" target="_blank" rel="noreferrer" className="rounded-full p-2 transition-colors hover:bg-slate-100 hover:text-primary"><Twitter className="h-4 w-4" /></a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="rounded-full p-2 transition-colors hover:bg-slate-100 hover:text-primary"><Linkedin className="h-4 w-4" /></a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
