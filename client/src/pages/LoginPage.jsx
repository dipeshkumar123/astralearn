import { SignIn } from '@clerk/clerk-react'
import { Sparkles, CalendarCheck2 } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl gap-4 px-4 pb-8 sm:gap-6 sm:px-6 lg:grid-cols-2 lg:items-stretch lg:px-8">
            <div className="order-1 rounded-3xl bg-gradient-to-br from-primary to-accent p-6 text-white shadow-[0_24px_45px_-24px_rgba(14,116,144,0.85)] lg:order-2 lg:p-10">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                    <Sparkles className="h-3.5 w-3.5" />
                    Keep your streak alive
                </p>
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">Welcome back to your learning space</h2>
                <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
                    Continue lessons, review with AI support, and finish this week stronger than the last.
                </p>

                <div className="mt-6 rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-sm sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/90">Study prompt</p>
                    <p className="mt-2 text-sm leading-relaxed sm:text-base">
                        "Small daily sessions beat long occasional cramming. Keep your 20-minute routine today."
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/90">
                        <CalendarCheck2 className="h-4 w-4" />
                        Suggested focus time: 15-25 mins
                    </div>
                </div>
            </div>

            <div className="order-2 flex items-center justify-center lg:order-1">
                <div className="glass-panel w-full max-w-xl rounded-3xl p-5 sm:p-7">
                    <div className="mb-5 text-center sm:mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Sign in</h2>
                        <p className="mt-2 text-sm text-slate-600 sm:text-base">Access your dashboard and continue learning.</p>
                    </div>

                    <div className="flex justify-center">
                        <SignIn
                            routing="path"
                            path="/login"
                            signUpUrl="/signup"
                            afterSignInUrl="/"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
