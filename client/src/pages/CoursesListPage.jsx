import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Star } from 'lucide-react'

export default function CoursesListPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/courses')
        const published = res.data.filter(c => c.isPublished)
        setCourses(published)
        
        // Fetch reviews for each course
        const reviewPromises = published.map(c => 
          axios.get(`/api/reviews/stats/${c.id}`).then(r => ({ id: c.id, ...r.data })).catch(() => ({ id: c.id, average: 0, count: 0 }))
        )
        const reviewData = await Promise.all(reviewPromises)
        const reviewMap = {}
        reviewData.forEach(r => { reviewMap[r.id] = r })
        setReviews(reviewMap)
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Explore Courses</h1>
        <p className="text-lg text-slate-600">Discover your next learning adventure</p>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(c => {
            const review = reviews[c.id] || { average: 0, count: 0 }
            return (
              <Card key={c.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary to-secondary relative">
                  {c.thumbnail && <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur">
                      {c.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-xl text-slate-900 line-clamp-2">{c.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3">{c.description || 'No description available.'}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{c.sections?.length || 0} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{review.average.toFixed(1)} ({review.count})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-2xl font-bold text-primary">${c.price || 0}</span>
                    <Button size="sm" onClick={() => navigate(`/courses/${c.id}`)}>
                      View Course
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
