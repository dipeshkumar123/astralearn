import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Brain, Trophy, Users, Zap } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-slide-up">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-slate-600">New: AI-Powered Tutoring Available</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-tight">
                            Master Any Skill with <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                AI-Driven Learning
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            Astralearn combines world-class content with an intelligent AI tutor to help you learn faster, retain more, and achieve your goals.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center gap-2 group">
                                Start Learning Free
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/courses" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4">
                                Explore Courses
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
                            {/* Logos/Social Proof placeholders */}
                            <div className="font-bold text-xl">Google</div>
                            <div className="font-bold text-xl">Microsoft</div>
                            <div className="font-bold text-xl">Spotify</div>
                            <div className="font-bold text-xl">Amazon</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Astralearn?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            We've reimagined the learning experience from the ground up, putting you and your goals at the center.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Brain,
                                title: "AI Personal Tutor",
                                description: "Get instant answers, personalized explanations, and study tips from your dedicated AI companion."
                            },
                            {
                                icon: Zap,
                                title: "Interactive Content",
                                description: "Engage with high-quality videos, quizzes, and hands-on projects that make learning stick."
                            },
                            {
                                icon: Trophy,
                                title: "Earn Certificates",
                                description: "Showcase your achievements with verified certificates upon course completion."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/20 to-secondary-dark/20" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Active Learners", value: "10k+" },
                            { label: "Video Lessons", value: "1,500+" },
                            { label: "Expert Instructors", value: "50+" },
                            { label: "Course Completion", value: "94%" }
                        ].map((stat, idx) => (
                            <div key={idx}>
                                <div className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light">
                                    {stat.value}
                                </div>
                                <div className="text-slate-400 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-secondary p-12 md:p-20 text-center text-white shadow-2xl shadow-primary/30">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to start your journey?</h2>
                        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto relative z-10">
                            Join thousands of learners who are transforming their careers with Astralearn.
                        </p>
                        <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors shadow-lg relative z-10">
                            Get Started for Free
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
