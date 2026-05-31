import { SignUp } from '@clerk/clerk-react'
import { UserCircle, Sparkles } from 'lucide-react'

export default function SignupPage() {
    return (
        <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl gap-4 px-4 pb-8 sm:gap-6 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="order-2 flex items-center justify-center lg:order-1">
                <div className="glass-panel w-full max-w-xl space-y-6 rounded-3xl p-5 sm:p-7">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Create your account</h2>
                        <p className="mt-2 text-sm text-slate-600 sm:text-base">Start learning today. Teacher and admin access is granted by an administrator.</p>
                    </div>

                    <div className="rounded-2xl border-2 border-primary/60 bg-primary/10 p-4 shadow-md shadow-primary/20">
                        <div className="flex flex-col items-center gap-2">
                            <UserCircle className="h-8 w-8 text-primary" />
                            <span className="font-medium text-primary">Learner account</span>
                            <span className="text-xs text-slate-500">Student</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <SignUp
                            routing="path"
                            path="/signup"
                            signInUrl="/login"
                            afterSignUpUrl="/onboard"
                        />
                    </div>
                </div>
            </div>

            <div className="order-1 rounded-3xl bg-gradient-to-br from-secondary to-primary p-6 text-slate-900 shadow-[0_24px_45px_-24px_rgba(180,83,9,0.75)] lg:order-2 lg:p-10">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-800">
                    <Sparkles className="h-3.5 w-3.5" />
                    Join the community
                </p>
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                    Build the skills that open real opportunities
                </h2>
                <p className="mt-3 max-w-md text-sm text-slate-900/80 sm:text-base">
                    Track progress, learn in focused sessions, and stay motivated with a clear study plan.
                </p>

                <div className="mt-6 rounded-2xl border border-white/50 bg-white/45 p-4 backdrop-blur-sm sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Role selected</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">Student Mode</p>
                    <p className="mt-1 text-sm text-slate-700">Staff roles are assigned from the admin console.</p>
                </div>
            </div>
        </div>
    )
}
