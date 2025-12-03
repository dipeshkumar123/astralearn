import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

export default function OnboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getToken } = useAuth()

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(location.search)
      const role = params.get('role') || 'STUDENT'
      try {
        const token = await getToken()
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        await axios.patch('/api/users/me/role', { role }, cfg)
      } catch (e) {
        // ignore; fallback to default role
      }
      // Always redirect based on selected role
      if (role === 'TEACHER') navigate('/teacher', { replace: true })
      else navigate('/dashboard', { replace: true })
    }
    run()
  }, [location.search])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  )
}
