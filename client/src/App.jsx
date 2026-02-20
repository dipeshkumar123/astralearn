import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import MainLayout from './layouts/MainLayout'

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CoursePage = lazy(() => import('./pages/CoursePage'))
const MyLearningPage = lazy(() => import('./pages/MyLearningPage'))
const OnboardPage = lazy(() => import('./pages/OnboardPage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const CoursesListPage = lazy(() => import('./pages/CoursesListPage'))

// Teacher Pages
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'))
const TeacherCourses = lazy(() => import('./pages/teacher/TeacherCourses'))
const CourseBuilder = lazy(() => import('./pages/teacher/CourseBuilder'))
const LessonEditor = lazy(() => import('./pages/teacher/LessonEditor'))
const ContentIngestion = lazy(() => import('./pages/teacher/ContentIngestion'))
const Analytics = lazy(() => import('./pages/teacher/Analytics'))
import TeacherGuard from './components/TeacherGuard'
import RoleBasedRedirect from './components/RoleBasedRedirect'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const E2E_AUTH_BYPASS = import.meta.env.VITE_E2E_AUTH_BYPASS === '1'

function PageLoader() {
    return (
        <div className="min-h-[40vh] flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary mb-3"></div>
                <p className="text-slate-600">Loading page...</p>
            </div>
        </div>
    )
}

function App() {
    if (!PUBLISHABLE_KEY) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="max-w-lg text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuration Error</h1>
                    <p className="text-slate-600">
                        Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code>. Add it to <code>client/.env</code> and restart the dev server.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Toaster position="top-center" />
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={
                                <>
                                    <SignedOut>
                                        <LandingPage />
                                    </SignedOut>
                                    <SignedIn>
                                        <RoleBasedRedirect />
                                    </SignedIn>
                                </>
                            } />
                            <Route path="/login/*" element={<LoginPage />} />
                            <Route path="/signup/*" element={<SignupPage />} />
                            <Route path="/onboard" element={<OnboardPage />} />
                            <Route path="/courses" element={<CoursesListPage />} />
                        </Route>

                        {/* Protected Student Routes */}
                        <Route element={
                            E2E_AUTH_BYPASS ? (
                                <DashboardLayout />
                            ) : (
                                <SignedIn>
                                    <DashboardLayout />
                                </SignedIn>
                            )
                        }>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/courses/:courseId" element={<CoursePage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/learning" element={<MyLearningPage />} />
                            <Route path="/achievements" element={<AchievementsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>

                        {/* Teacher Routes */}
                        <Route path="/teacher" element={
                            E2E_AUTH_BYPASS ? (
                                <MainLayout />
                            ) : (
                                <SignedIn>
                                    <TeacherGuard>
                                        <MainLayout />
                                    </TeacherGuard>
                                </SignedIn>
                            )
                        }>
                            <Route index element={<TeacherDashboard />} />
                            <Route path="courses" element={<TeacherCourses />} />
                            <Route path="courses/:courseId" element={<CourseBuilder />} />
                            <Route path="courses/:courseId/lessons/:lessonId" element={<LessonEditor />} />
                            <Route path="content-upload" element={<ContentIngestion />} />
                            <Route path="content-ingestion" element={<ContentIngestion />} />
                            <Route path="analytics" element={<Analytics />} />
                        </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ClerkProvider>
    )
}

export default App
