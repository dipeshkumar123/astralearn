import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

export function useUserRole() {
    const { getToken, isSignedIn } = useAuth()
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRole = async () => {
            if (!isSignedIn) {
                setRole(null)
                setLoading(false)
                return
            }

            try {
                const token = await getToken()
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                const res = await axios.get('/api/users/me', config)
                setRole(res.data.role)
            } catch (error) {
                console.error('Error fetching user role:', error)
                setRole(null)
            } finally {
                setLoading(false)
            }
        }

        fetchRole()
    }, [isSignedIn, getToken])

    return { role, loading, isTeacher: role === 'TEACHER', isStudent: role === 'STUDENT' }
}
