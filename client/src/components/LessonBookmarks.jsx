import { useEffect, useState } from 'react'
import { Bookmark, BookmarkPlus } from 'lucide-react'
import { Button } from './ui/Button'

export default function LessonBookmarks({ courseId, lessonId, onJump, lessons = [] }) {
  const key = `bookmarks:${courseId}`
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [key])

  const addBookmark = () => {
    const next = [...items, { lessonId, at: Date.now() }]
    setItems(next)
    localStorage.setItem(key, JSON.stringify(next))
  }

  const removeBookmark = (at) => {
    const next = items.filter(i => i.at !== at)
    setItems(next)
    localStorage.setItem(key, JSON.stringify(next))
  }

  const getLessonTitle = (id) => {
    const lesson = lessons.find(l => (l.id || l._id) === id)
    return lesson?.title || `Lesson ${id}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900">Bookmarks</h4>
        <Button size="sm" variant="secondary" onClick={addBookmark}><BookmarkPlus className="h-4 w-4 mr-2" />Add</Button>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-6">
          <Bookmark className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-500">No bookmarks yet. Bookmark lessons to quickly jump back to them later.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map(i => (
            <li key={i.at} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white">
              <div className="min-w-0 mr-2">
                <p className="text-sm font-medium text-slate-800 truncate">{getLessonTitle(i.lessonId)}</p>
                <p className="text-xs text-slate-400">{new Date(i.at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="secondary" onClick={() => onJump && onJump(i.lessonId)}>Go</Button>
                <Button size="sm" variant="secondary" onClick={() => removeBookmark(i.at)}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
