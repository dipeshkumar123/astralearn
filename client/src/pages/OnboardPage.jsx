import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

export default function OnboardPage() {
  const navigate = useNavigate()
  const { getToken } = useAuth()

  useEffect(() => {
    const run = async () => {
      try {
        const token = await getToken()
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        const res = await axios.get('/api/users/me', cfg)
        if (res.data?.role === 'ADMIN') navigate('/admin', { replace: true })
        else if (res.data?.role === 'TEACHER') navigate('/teacher', { replace: true })
        else navigate('/dashboard', { replace: true })
      } catch (e) {
        navigate('/dashboard', { replace: true })
      }
    }
    run()
  }, [getToken, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  )
}
