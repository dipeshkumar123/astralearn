import { SignUp } from '@clerk/clerk-react'

export default function SignupPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900">Create an account</h2>
                        <p className="mt-2 text-slate-600">Start your 14-day free trial today</p>
                    </div>
                    <div className="flex justify-center">
                        <SignUp routing="path" path="/signup" signInUrl="/login" />
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Pattern */}
            <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20" />
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
                <div className="relative z-10 text-center px-12 max-w-lg">
                    <h2 className="text-4xl font-bold text-white mb-6">Join our community</h2>
                    <p className="text-lg text-slate-300">
                        Connect with thousands of learners and mentors from around the world.
                    </p>
                </div>
            </div>
        </div>
    )
}
