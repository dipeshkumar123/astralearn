import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-white/90 border-t border-slate-200 pt-16 pb-8 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4 w-fit">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                                A
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-secondary-dark">Astralearn</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Empowering the next generation of learners with AI-driven education. Master any skill, anytime, anywhere.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Platform</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Browse Courses</Link></li>
                            <li><Link to="/signup" className="hover:text-primary transition-colors">Get Started</Link></li>
                            <li><Link to="/login" className="hover:text-primary transition-colors">Log In</Link></li>
                            <li><Link to="/onboard" className="hover:text-primary transition-colors">Onboarding</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
                            <li><Link to="/signup" className="hover:text-primary transition-colors">Create Account</Link></li>
                            <li><Link to="/login" className="hover:text-primary transition-colors">Log In</Link></li>
                            <li><Link to="/onboard" className="hover:text-primary transition-colors">Onboarding</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Stay Updated</h3>
                        <p className="text-sm text-slate-500 mb-4">Get the latest course updates and AI learning tips.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                            />
                            <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} Astralearn. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
                        <a href="https://x.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
