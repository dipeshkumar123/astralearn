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
                const published = res.data.filter((course) => course.isPublished)
                setCourses(published)

                const reviewPromises = published.map((course) =>
                    axios
                        .get(`/api/reviews/stats/${course.id}`)
                        .then((response) => ({ id: course.id, ...response.data }))
                        .catch(() => ({ id: course.id, average: 0, count: 0 }))
                )
                const reviewData = await Promise.all(reviewPromises)
                const reviewMap = {}
                reviewData.forEach((review) => { reviewMap[review.id] = review })
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
        ...courses.map((course) => course.category).filter(Boolean),
        ...(category !== 'All' ? [category] : []),
    ])]
    const levels = ['All', ...new Set([
        ...courses.map((course) => course.level).filter(Boolean),
        ...(level !== 'All' ? [level] : []),
    ])]

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 sm:space-y-8 sm:px-6 sm:pb-12 lg:px-8">
            <section className="glass-panel overflow-hidden rounded-3xl p-5 sm:p-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Course Discovery</p>
                <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Find your next learning path</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                    Search published courses, match your level, and jump straight into lessons that fit your goals.
                </p>
            </section>

            <form onSubmit={applyFilters} className="glass-panel rounded-3xl p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_auto] lg:items-end">
                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by title or description"
                                className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Category</label>
                        <select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        >
                            {categories.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Level</label>
                        <select
                            value={level}
                            onChange={(event) => setLevel(event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        >
                            {levels.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" className="h-11 px-4">
                            <SlidersHorizontal className="h-4 w-4" />
                            Apply
                        </Button>
                        <Button type="button" variant="secondary" onClick={clearFilters} className="h-11 px-4">Reset</Button>
                    </div>
                </div>
            </form>

            {courses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/70 py-14 text-center text-slate-500">
                    <p className="text-lg font-semibold text-slate-700">No courses match these filters.</p>
                    <Button className="mt-4" variant="secondary" onClick={clearFilters}>Clear filters</Button>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => {
                        const review = reviews[course.id] || { average: 0, count: 0 }
                        return (
                            <Card key={course.id} className="group overflow-hidden p-0">
                                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary to-accent sm:h-48">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-white/60" />
                                        </div>
                                    )}
                                    <div className="absolute right-3 top-3">
                                        <Badge variant="secondary" className="bg-white/90 text-slate-800">{course.category || 'General'}</Badge>
                                    </div>
                                </div>

                                <div className="space-y-3 p-5">
                                    <h3 className="line-clamp-2 text-lg font-bold text-slate-900 sm:text-xl">{course.title}</h3>
                                    <p className="line-clamp-3 text-sm text-slate-600">{course.description || 'No description available.'}</p>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 sm:text-sm">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{course.sections?.length || 0} modules</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-secondary-dark" />
                                            <span>{review.average.toFixed(1)} ({review.count})</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                        <span className="text-2xl font-bold text-primary">${course.price || 0}</span>
                                        <Button onClick={() => navigate(`/courses/${course.id}`)} className="px-4 py-2 text-sm">View Course</Button>
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