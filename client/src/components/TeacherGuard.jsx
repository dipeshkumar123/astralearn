import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

export default function TeacherGuard({ children }) {
  const { getToken } = useAuth()
  const [allowed, setAllowed] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const check = async () => {
      try {
        const token = await getToken()
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        const res = await axios.get('/api/users/me', cfg)
        if (res.data?.role === 'TEACHER') {
          setAllowed(true)
        } else {
          setAllowed(false)
          navigate('/dashboard', { replace: true })
        }
      } catch {
        setAllowed(false)
        navigate('/dashboard', { replace: true })
      }
    }
    check()
  }, [])

  if (allowed === null) {
    return <div className="p-6">Checking permissions...</div>
  }
  if (!allowed) return null
  return children
}
