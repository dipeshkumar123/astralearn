import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserRole } from '../hooks/useUserRole'

export default function RoleBasedRedirect() {
    const navigate = useNavigate()
    const { role, loading } = useUserRole()

    useEffect(() => {
        if (!loading && role) {
            if (role === 'TEACHER') {
                navigate('/teacher', { replace: true })
            } else {
                navigate('/dashboard', { replace: true })
            }
        }
    }, [role, loading, navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        )
    }

    return null
}
