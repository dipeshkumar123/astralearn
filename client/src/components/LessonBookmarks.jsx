import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from './ui/Button'

export default function LessonBookmarks({ courseId, lessonId, onJump }) {
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900">Bookmarks</h4>
        <Button size="sm" variant="secondary" onClick={addBookmark}><Bookmark className="h-4 w-4 mr-2" />Add</Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No bookmarks yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(i => (
            <li key={i.at} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white">
              <span className="text-sm">Lesson #{String(i.lessonId).slice(0,4)} · {new Date(i.at).toLocaleString()}</span>
              <div className="flex gap-2">
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
