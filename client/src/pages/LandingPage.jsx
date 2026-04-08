import { Link } from 'react-router-dom'
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
    },
    {
        icon: BookOpenCheck,
        title: 'Short lessons with real progress',
        description: 'Micro-lessons, quick checks, and recap moments help you retain more in less time.',
    },
    {
        icon: Trophy,
        title: 'Motivation that feels rewarding',
        description: 'Track streaks, celebrate milestones, and stay focused with goals that feel achievable.',
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

export default function LandingPage() {
    return (
        <div className="pb-12 sm:pb-16">
            <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_50%),radial-gradient(circle_at_80%_8%,rgba(245,158,11,0.22),transparent_42%)]" />

                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div className="animate-fade-in space-y-6">
                        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            Built for students, powered by AI
                        </p>

                        <h1 className="text-balance text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            Learn faster with a study space that actually keeps you engaged
                        </h1>

                        <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                            Astralearn combines guided lessons, clear explanations, and motivation tools so you can study without feeling overwhelmed.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link to="/signup" className="btn-primary group text-base sm:text-lg">
                                Start Learning Free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link to="/courses" className="btn-secondary text-base sm:text-lg">
                                Explore Courses
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {learningTracks.map((track) => (
                                <span key={track} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {track}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="animate-slide-up">
                        <div className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-7">
                            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />

                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-500">Today&apos;s plan</p>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">On Track</span>
                            </div>

                            <div className="space-y-3">
                                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-900">Linear Equations Sprint</h3>
                                        <span className="text-xs font-semibold text-primary">15 min</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-accent" />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-900">Quick AI recap quiz</h3>
                                        <span className="text-xs font-semibold text-secondary-dark">5 min</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-secondary to-secondary-dark" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Streak</p>
                                    <p className="mt-1 text-xl font-bold text-slate-900">18 days</p>
                                </div>
                                <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-dark">Skill XP</p>
                                    <p className="mt-1 text-xl font-bold text-slate-900">+320</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    {stats.map((item) => (
                        <div key={item.label} className="glass-panel rounded-2xl px-4 py-3 text-center sm:px-5 sm:py-4">
                            <p className="text-xl font-bold text-slate-900 sm:text-2xl">{item.value}</p>
                            <p className="text-xs font-medium text-slate-500 sm:text-sm">{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 max-w-2xl sm:mb-10">
                        <h2 className="section-heading">What makes Astralearn student-friendly</h2>
                        <p className="muted-copy mt-3 text-sm sm:text-base">
                            We remove friction from studying so your energy goes into learning, not figuring out what to do next.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {featureCards.map((item) => (
                            <article key={item.title} className="card p-5 sm:p-6">
                                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/20 text-primary">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm sm:p-8 lg:p-10">
                    <div className="mb-8 max-w-2xl">
                        <h2 className="section-heading">How learning flow works</h2>
                        <p className="muted-copy mt-3 text-sm sm:text-base">A focused loop that keeps you progressing every week.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 md:gap-5">
                        {learningFlow.map((item, index) => (
                            <article key={item.title} className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                                <span className="absolute right-4 top-4 text-xs font-bold text-slate-400">0{index + 1}</span>
                                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-7 text-white shadow-[0_26px_48px_-26px_rgba(14,116,144,0.75)] sm:p-10 lg:p-14">
                    <div className="max-w-2xl">
                        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                            <CalendarCheck2 className="h-3.5 w-3.5" />
                            Your next learning streak starts now
                        </p>
                        <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Build confident study habits in under 20 minutes a day</h2>
                        <p className="mt-4 text-sm text-white/90 sm:text-base">
                            Join thousands of students who use Astralearn to stay consistent, prepare smarter, and grow faster.
                        </p>
                        <Link to="/signup" className="btn mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary hover:bg-slate-100 sm:text-base">
                            Create Free Account
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}