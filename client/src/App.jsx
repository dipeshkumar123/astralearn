import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import MainLayout from './layouts/MainLayout'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import Dashboard from './pages/Dashboard'
import CoursePage from './pages/CoursePage'
import MyLearningPage from './pages/MyLearningPage'
import AchievementsPage from './pages/AchievementsPage'

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherCourses from './pages/teacher/TeacherCourses'
import CourseBuilder from './pages/teacher/CourseBuilder'
import LessonEditor from './pages/teacher/LessonEditor'
import ContentIngestion from './pages/teacher/ContentIngestion'
import Analytics from './pages/teacher/Analytics'
import TeacherGuard from './components/TeacherGuard'

const PUBLISHABLE_KEY = 'pk_test_YWRlcXVhdGUtdGFkcG9sZS03Ny5jbGVyay5hY2NvdW50cy5kZXYk'

function App() {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Toaster position="top-center" />
                <Routes>
                    {/* Public Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={
                            <>
                                <SignedOut>
                                    <LandingPage />
                                </SignedOut>
                                <SignedIn>
                                    <Navigate to="/dashboard" replace />
                                </SignedIn>
                            </>
                        } />
                        <Route path="/login/*" element={<LoginPage />} />
                        <Route path="/signup/*" element={<SignupPage />} />
                    </Route>

                    {/* Protected Student Routes */}
                    <Route element={
                        <SignedIn>
                            <DashboardLayout />
                        </SignedIn>
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
                        <SignedIn>
                            <TeacherGuard>
                                <MainLayout />
                            </TeacherGuard>
                        </SignedIn>
                    }>
                        <Route index element={<TeacherDashboard />} />
                        <Route path="courses" element={<TeacherCourses />} />
                        <Route path="courses/:courseId" element={<CourseBuilder />} />
                        <Route path="courses/:courseId/lessons/:lessonId" element={<LessonEditor />} />
                        <Route path="content-upload" element={<ContentIngestion />} />
                        <Route path="analytics" element={<Analytics />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ClerkProvider>
    )
}

export default App
