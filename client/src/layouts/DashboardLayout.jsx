import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default function DashboardLayout() {
    return (
        <div className="app-shell-bg min-h-screen">
            <Sidebar />

            <div className="min-h-screen flex flex-col md:ml-72">
                <div className="md:hidden">
                    <Navbar />
                </div>

                <main className="flex-1 px-3 pb-6 pt-24 sm:px-4 sm:pb-10 sm:pt-28 md:px-8 md:pt-8 lg:px-10">
                    <div className="mx-auto w-full max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
