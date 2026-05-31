import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowRight,
    BrainCircuit,
    BookOpenCheck,
    Sparkles,
    Rocket,
    CalendarCheck2,
    Clock3,
    Trophy,
    ShieldCheck,
} from 'lucide-react'

const featureCards = [
    {
        icon: BrainCircuit,
        title: 'AI tutor that explains clearly',
        description: 'Ask anything while you study. Get simple, step-by-step support matched to your pace and level.',
        gradient: 'from-primary to-accent',
    },
    {
        icon: BookOpenCheck,
        title: 'Short lessons with real progress',
        description: 'Micro-lessons, quick checks, and recap moments help you retain more in less time.',
        gradient: 'from-secondary to-amber-400',
    },
    {
        icon: Trophy,
        title: 'Motivation that feels rewarding',
        description: 'Track streaks, celebrate milestones, and stay focused with goals that feel achievable.',
        gradient: 'from-emerald-500 to-teal-400',
    },
]

const learningFlow = [
    {
        title: 'Pick your path',
        description: 'Choose a course goal and Astralearn builds your personalized week plan.',
        icon: Rocket,
    },
    {
        title: 'Learn in focused sessions',
        description: 'Study in short sprints with checkpoints and quick AI support whenever you need it.',
        icon: Clock3,
    },
    {
        title: 'Review and level up',
        description: 'Use smart recap prompts to strengthen memory and turn practice into confidence.',
        icon: ShieldCheck,
    },
]

const stats = [
    { label: 'Active students', value: '10k+' },
    { label: 'Lessons completed weekly', value: '120k+' },
    { label: 'Average completion', value: '94%' },
    { label: 'Daily study streak users', value: '72%' },
]

const learningTracks = ['Exam prep', 'Coding fundamentals', 'Design basics', 'Business skills', 'Language growth']

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function LandingPage() {
    return (
        <div className="pb-12 sm:pb-16 bg-slate-50 min-h-screen selection:bg-primary/20">
            <section className="hero-gradient-mesh relative px-4 pb-12 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 overflow-hidden">
                {/* Floating geometric decorations */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
                <div className="pointer-events-none absolute top-20 right-1/4 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />

                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-4xl space-y-8"
                        >
                            <motion.div variants={itemVariants}>
                                <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Built for students, powered by AI
                                </p>
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-balance text-5xl font-bold leading-tight text-slate-900 sm:text-6xl lg:text-7xl">
                                Learn faster with a study space that keeps you engaged
                            </motion.h1>

                            <motion.p variants={itemVariants} className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                                Astralearn combines guided lessons, clear explanations, and motivation tools so you can study without feeling overwhelmed.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start w-full sm:w-auto pt-4">
                                <Link to="/signup" className="btn-primary group text-lg px-8 py-4">
                                    Start Learning Free
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link to="/courses" className="btn-secondary text-lg px-8 py-4">
                                    Explore Courses
                                </Link>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-2 pt-6">
                                <span className="text-sm font-semibold text-slate-500 mr-2 flex items-center">Popular:</span>
                                {learningTracks.map((track) => (
                                    <Link key={track} to={`/courses?category=${encodeURIComponent(track)}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                                        {track}
                                    </Link>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Dashboard preview card mockup */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="hidden lg:block"
                        >
                            <div className="glass-panel relative w-80 rounded-3xl p-6 shadow-2xl shadow-primary/10">
                                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-accent/20 blur-2xl" />
                                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />

                                <div className="relative z-10 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900">Study Session</h4>
                                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">Live</span>
                                    </div>

                                    <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-800">Linear Equations</span>
                                            <span className="text-xs font-semibold text-primary">Lesson 4</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-accent" />
                                        </div>
                                        <p className="text-xs text-slate-500">75% complete</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-primary/5 p-3 text-center">
                                            <p className="text-lg font-bold text-primary">24m</p>
                                            <p className="text-[11px] text-slate-500">Time today</p>
                                        </div>
                                        <div className="rounded-xl bg-secondary/10 p-3 text-center">
                                            <p className="text-lg font-bold text-secondary-dark">7 🔥</p>
                                            <p className="text-[11px] text-slate-500">Day streak</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/80 p-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                                            <BrainCircuit className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700">AI Tutor</p>
                                            <p className="text-[11px] text-slate-500">Ready to help</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="soft-grid px-4 py-12 sm:px-6 lg:px-8 border-y border-slate-200/60 bg-white/50">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8 divide-x divide-slate-200/60">
                        {stats.map((item) => (
                            <div key={item.label} className="text-center px-4">
                                <p className="text-3xl font-bold text-slate-900 mb-1">{item.value}</p>
                                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">What makes Astralearn student-friendly</h2>
                        <p className="text-lg text-slate-600">
                            We remove friction from studying so your energy goes into learning, not figuring out what to do next.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {featureCards.map((item, index) => (
                            <motion.article 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.1 }}
                                key={item.title} 
                                className="card-shine bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.description}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
                <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">How learning flow works</h2>
                            <p className="text-lg text-slate-600 mb-10">A focused loop that keeps you progressing every week without burnout.</p>
                            
                            <div className="space-y-8">
                                {learningFlow.map((item, index) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        key={item.title} 
                                        className="flex gap-5"
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold text-sm shadow-lg shadow-primary/25">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                            <p className="text-slate-600">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative"
                        >
                            <div className="absolute -top-6 -right-6 h-24 w-24 bg-accent/20 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-primary/20 rounded-full blur-3xl"></div>
                            
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-bold text-slate-900">Today's Focus</h4>
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">On Track</span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold text-slate-800">Linear Equations</span>
                                            <span className="text-primary text-sm font-semibold">15 min</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-3/4 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold text-slate-800">AI Recap Quiz</span>
                                            <span className="text-secondary text-sm font-semibold">5 min</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-secondary w-1/3 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl bg-slate-900 p-10 sm:p-16 text-center shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20"></div>
                        
                        <div className="relative z-10">
                            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                                <CalendarCheck2 className="h-4 w-4" />
                                Your next learning streak starts now
                            </p>
                            <h2 className="text-3xl font-bold text-white sm:text-5xl mb-6 leading-tight">
                                Build confident study habits in under 20 minutes a day
                            </h2>
                            <Link to="/signup" className="animate-glow inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors text-lg">
                                Create Free Account
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}