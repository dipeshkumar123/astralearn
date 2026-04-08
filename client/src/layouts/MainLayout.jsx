import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function MainLayout() {
    return (
        <div className="app-shell-bg min-h-screen flex flex-col font-sans text-slate-900">
            <Navbar />
            <main className="flex-grow pt-20 sm:pt-24">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
