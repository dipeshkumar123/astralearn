import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function CoursesListPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/courses')
        setCourses(res.data)
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">All Courses</h1>
        <p className="text-slate-600 mt-1">Browse published courses</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(c => (
          <Card key={c.id} className="p-5 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1 truncate">{c.title}</h3>
              <p className="text-xs text-slate-500 mb-3">{c.category} · {c.level}</p>
              <p className="text-sm text-slate-600 line-clamp-3">{c.description || 'No description.'}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">${'{'}c.price || 0{'}'}</span>
              <Button size='sm' variant='secondary' onClick={() => navigate(`/courses/${c.id}`)}>View</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
