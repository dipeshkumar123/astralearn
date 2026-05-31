import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import { hydrateCoursesWithProgress } from '../lib/courseProgress'
import { BookOpen, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react'

export default function MyLearningPage() {
  const { getToken } = useAuth()
  const [courses, setCourses] = useState([])
  const [progressByCourse, setProgressByCourse] = useState({})
  const [savedCourses, setSavedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken()
        const cfg = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        
        const [myCoursesRes, savedCoursesRes] = await Promise.all([
            axios.get('/api/courses/my-courses', cfg),
            axios.get('/api/saved-courses', cfg).catch(() => ({ data: [] }))
        ])

        setCourses(myCoursesRes.data)
        setSavedCourses(savedCoursesRes.data)
        setProgressByCourse(await hydrateCoursesWithProgress(myCoursesRes.data, token, axios))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-80'>
        <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-4 md:p-6 sm:space-y-8'>
      <div className='surface-panel soft-grid overflow-hidden p-5 sm:p-7'>
        <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center'>
          <div>
            <p className='mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary'>
              <Sparkles className='h-3.5 w-3.5' />
              Study queue
            </p>
            <h1 className='text-3xl font-bold text-slate-950 sm:text-4xl'>My Learning</h1>
            <p className='mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base'>Pick up exactly where you left off and keep every course moving forward.</p>
          </div>

          <div className='rounded-3xl border border-white/80 bg-white/75 p-4 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <BookOpen className='h-6 w-6' />
              </div>
              <div>
                <p className='text-2xl font-bold text-slate-950'>{courses.length}</p>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Active courses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {courses.length === 0 && (
        <Card className='overflow-hidden p-0 text-center'>
          <div className='learning-visual px-6 py-14 text-white'>
            <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md'>
              <BookOpen className='h-8 w-8' />
            </div>
            <h2 className='text-2xl font-bold'>Build your first learning path</h2>
            <p className='mx-auto mt-2 max-w-md text-sm text-white/80'>Enroll in a course and your lessons, notes, progress, and reviews will stay organized here.</p>
            <Button className='mt-6 bg-white text-primary hover:bg-white' onClick={() => navigate('/dashboard')}>Browse Courses</Button>
          </div>
        </Card>
      )}

      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {courses.map(c => {
          const totalLessons = c.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0
          const progress = progressByCourse[c.id] || { completedLessons: [], percentComplete: 0 }
          return (
            <Card key={c.id} className='group flex flex-col overflow-hidden p-0'>
              <div className='course-fallback-visual relative h-28'>
                {c.thumbnail && <img src={c.thumbnail} alt={c.title} className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105' />}
                <div className='absolute inset-0 bg-slate-950/10' />
                <div className='absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm'>{c.level || 'Beginner'}</div>
              </div>
              <div className='flex flex-1 flex-col p-5'>
              <div className='flex-1'>
                <h3 className='font-semibold text-slate-900 mb-1 truncate'>{c.title}</h3>
                <p className='text-xs text-slate-500 mb-3'>{c.category} | {c.level}</p>
                <p className='text-sm text-slate-600 line-clamp-3'>{c.description || 'No description.'}</p>
              </div>
              <div className='mt-5 space-y-2'>
                <div className='flex items-center justify-between text-xs font-medium text-slate-500'>
                  <span>{progress.completedLessons.length} of {totalLessons} lessons complete</span>
                  <span>{progress.percentComplete}%</span>
                </div>
                <ProgressBar value={progress.percentComplete} />
              </div>
              <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-4'>
                <div className='flex items-center gap-3 text-xs text-slate-500'>
                  <span className='inline-flex items-center gap-1'><Clock className='h-3.5 w-3.5' /> {totalLessons} lessons</span>
                  {progress.percentComplete === 100 && <span className='inline-flex items-center gap-1 text-green-600'><CheckCircle2 className='h-3.5 w-3.5' /> Done</span>}
                </div>
                <Button size='sm' variant='secondary' onClick={() => navigate(`/courses/${c.id}`)}>
                  Continue
                  <ArrowRight className='h-3.5 w-3.5' />
                </Button>
              </div>
              </div>
            </Card>
          )
        })}
      </div>

      {savedCourses.length > 0 && (
        <div className='mt-12'>
          <h2 className='text-2xl font-bold text-slate-900 mb-6'>Saved for Later</h2>
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
            {savedCourses.map(({ course }) => (
              <Card key={course.id} className='group flex flex-col overflow-hidden p-0 card-shine'>
                <div className='course-fallback-visual relative h-32'>
                  {course.thumbnail && <img src={course.thumbnail} alt={course.title} className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105' />}
                  <div className='absolute inset-0 bg-slate-950/10' />
                </div>
                <div className='flex flex-1 flex-col p-4'>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-slate-900 mb-1 truncate text-sm'>{course.title}</h3>
                    <p className='text-xs text-slate-500'>{course.category} | {course.level}</p>
                  </div>
                  <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-3'>
                    <span className='text-lg font-bold text-primary'>${course.price || 0}</span>
                    <Button size='sm' onClick={() => navigate(`/courses/${course.id}`)}>
                      View
                      <ArrowRight className='h-3 w-3 ml-1' />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
