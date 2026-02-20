import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Star, Search, SlidersHorizontal } from 'lucide-react'

export default function CoursesListPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const searchParam = searchParams.get('search') || ''
    const categoryParam = searchParams.get('category') || 'All'
    const levelParam = searchParams.get('level') || 'All'
    setSearch(searchParam)
    setCategory(categoryParam)
    setLevel(levelParam)
  }, [searchParams])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = {}
        const searchParam = searchParams.get('search')
        const categoryParam = searchParams.get('category')
        const levelParam = searchParams.get('level')

        if (searchParam) params.search = searchParam
        if (categoryParam && categoryParam !== 'All') params.category = categoryParam
        if (levelParam && levelParam !== 'All') params.level = levelParam

        const res = await axios.get('/api/courses', { params })
        const published = res.data.filter(c => c.isPublished)
        setCourses(published)

        const reviewPromises = published.map(c =>
          axios.get(`/api/reviews/stats/${c.id}`).then(r => ({ id: c.id, ...r.data })).catch(() => ({ id: c.id, average: 0, count: 0 }))
        )
        const reviewData = await Promise.all(reviewPromises)
        const reviewMap = {}
        reviewData.forEach(r => { reviewMap[r.id] = r })
        setReviews(reviewMap)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [searchParams])

  const applyFilters = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (category !== 'All') params.set('category', category)
    if (level !== 'All') params.set('level', level)
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setLevel('All')
    setSearchParams({})
  }

  const categories = ['All', ...new Set([
    ...courses.map(c => c.category).filter(Boolean),
    ...(category !== 'All' ? [category] : []),
  ])]
  const levels = ['All', ...new Set([
    ...courses.map(c => c.level).filter(Boolean),
    ...(level !== 'All' ? [level] : []),
  ])]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      <div className="glass-panel rounded-2xl p-6 text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Explore Courses</h1>
        <p className="text-lg text-slate-600">Discover your next learning adventure</p>
      </div>

      <form onSubmit={applyFilters} className="glass-panel rounded-2xl p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1.6fr,1fr,1fr,auto] items-end">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
            >
              {categories.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
            >
              {levels.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Apply
            </Button>
            <Button type="button" variant="secondary" onClick={clearFilters}>Reset</Button>
          </div>
        </div>
      </form>

      {courses.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No courses match the current filters.</p>
          <Button className="mt-4" variant="secondary" onClick={clearFilters}>Clear filters</Button>
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
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur">{c.category}</Badge>
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
                    <Button size="sm" onClick={() => navigate(`/courses/${c.id}`)}>View Course</Button>
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
