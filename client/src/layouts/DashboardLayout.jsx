import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar' // We might want a different Topbar later, but Navbar works for now

export default function DashboardLayout() {
    return (
        <div className="min-h-screen">
            <Sidebar />

            {/* Main Content Area */}
            <div className="md:ml-64 min-h-screen flex flex-col">
                {/* Mobile Header (Navbar handles mobile menu) */}
                <div className="md:hidden">
                    <Navbar />
                </div>

                <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
