import { SignUp } from '@clerk/clerk-react'
import { useState } from 'react'
import { GraduationCap, UserCircle } from 'lucide-react'

export default function SignupPage() {
    const [selectedRole, setSelectedRole] = useState('STUDENT')

    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900">Create an account</h2>
                        <p className="mt-2 text-slate-600">Choose your role and start your journey</p>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 mb-2">I want to:</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('STUDENT')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    selectedRole === 'STUDENT'
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <UserCircle className={`h-8 w-8 ${selectedRole === 'STUDENT' ? 'text-primary' : 'text-slate-400'}`} />
                                    <span className={`font-medium ${selectedRole === 'STUDENT' ? 'text-primary' : 'text-slate-700'}`}>
                                        Learn
                                    </span>
                                    <span className="text-xs text-slate-500">Student</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole('TEACHER')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    selectedRole === 'TEACHER'
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <GraduationCap className={`h-8 w-8 ${selectedRole === 'TEACHER' ? 'text-primary' : 'text-slate-400'}`} />
                                    <span className={`font-medium ${selectedRole === 'TEACHER' ? 'text-primary' : 'text-slate-700'}`}>
                                        Teach
                                    </span>
                                    <span className="text-xs text-slate-500">Teacher</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <SignUp 
                            routing="path" 
                            path="/signup" 
                            signInUrl="/login"
                            unsafeMetadata={{ role: selectedRole }}
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Pattern */}
            <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20" />
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
                <div className="relative z-10 text-center px-12 max-w-lg">
                    <h2 className="text-4xl font-bold text-white mb-6">Join our community</h2>
                    <p className="text-lg text-slate-300 mb-4">
                        {selectedRole === 'TEACHER' 
                            ? 'Share your knowledge and inspire thousands of learners worldwide.'
                            : 'Connect with thousands of learners and mentors from around the world.'
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}
