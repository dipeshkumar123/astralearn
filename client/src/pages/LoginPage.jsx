import { SignIn } from '@clerk/clerk-react'

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
                        <p className="mt-2 text-slate-600">Please sign in to your account</p>
                    </div>
                    <div className="flex justify-center">
                        <SignIn routing="path" path="/login" signUpUrl="/signup" />
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Pattern */}
            <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
                <div className="relative z-10 text-center px-12 max-w-lg">
                    <h2 className="text-4xl font-bold text-white mb-6">Continue your learning journey</h2>
                    <p className="text-lg text-slate-300">
                        "The beautiful thing about learning is that no one can take it away from you."
                    </p>
                </div>
            </div>
        </div>
    )
}
