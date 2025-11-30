import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function MyLearningPage() {
  const { getToken } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken()
        const res = await axios.get('/api/courses/my-courses', token ? { headers: { Authorization: `Bearer ${token}` } } : {})
        setCourses(res.data)
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return <div className='p-6'>Loading...</div>
  }

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-slate-900'>My Learning</h1>
        <p className='text-slate-600 mt-1'>Continue where you left off</p>
      </div>

      {courses.length === 0 && (
        <Card className='p-10 text-center'>
          <p className='text-slate-500 mb-4'>You have not enrolled in any courses yet.</p>
          <Button onClick={() => navigate('/dashboard')}>Browse Courses</Button>
        </Card>
      )}

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {courses.map(c => {
          const totalLessons = c.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0
          return (
            <Card key={c.id} className='p-5 flex flex-col'>
              <div className='flex-1'>
                <h3 className='font-semibold text-slate-900 mb-1 truncate'>{c.title}</h3>
                <p className='text-xs text-slate-500 mb-3'>{c.category} · {c.level}</p>
                <p className='text-sm text-slate-600 line-clamp-3'>{c.description || 'No description.'}</p>
              </div>
              <div className='mt-4 flex items-center justify-between'>
                <span className='text-xs text-slate-500'>{totalLessons} lesson(s)</span>
                <Button size='sm' variant='secondary' onClick={() => navigate(`/courses/${c.id}`)}>Continue</Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
