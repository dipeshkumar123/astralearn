import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import StudentMobileNav from '../components/StudentMobileNav'

export default function DashboardLayout() {
    const location = useLocation()
    const isImmersiveCoursePage = location.pathname.startsWith('/courses/')

    return (
        <div className="app-shell-bg min-h-screen">
            <Sidebar />

            <div className="min-h-screen flex flex-col md:ml-64">
                <div className="md:hidden">
                    <Navbar />
                </div>

                <main className={`flex-1 pb-24 md:pb-0 ${isImmersiveCoursePage ? 'px-0 pb-0 pt-20 sm:pt-24 md:pt-0' : 'px-3 pb-28 pt-24 sm:px-4 sm:pt-28 md:px-8 md:pb-10 md:pt-8 lg:px-10'}`}>
                    {isImmersiveCoursePage ? (
                        <Outlet />
                    ) : (
                        <div className="mx-auto w-full max-w-7xl">
                            <Outlet />
                        </div>
                    )}
                </main>
                {!isImmersiveCoursePage && <StudentMobileNav />}
            </div>
        </div>
    )
}
