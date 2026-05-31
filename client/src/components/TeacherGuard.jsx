import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

const DEFAULT_ALLOWED_ROLES = ['TEACHER', 'ADMIN']

export default function TeacherGuard({ children, allowedRoles = DEFAULT_ALLOWED_ROLES, fallbackPath = '/dashboard' }) {
  const { getToken } = useAuth()
  const [allowed, setAllowed] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const check = async () => {
      try {
        const token = await getToken()
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        const res = await axios.get('/api/users/me', cfg)
        if (allowedRoles.includes(res.data?.role)) {
          setAllowed(true)
        } else {
          setAllowed(false)
          navigate(fallbackPath, { replace: true })
        }
      } catch {
        setAllowed(false)
        navigate(fallbackPath, { replace: true })
      }
    }
    check()
  }, [allowedRoles, fallbackPath, getToken, navigate])

  if (allowed === null) {
    return <div className="p-6">Checking permissions...</div>
  }
  if (!allowed) return null
  return children
}
