import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from './ui/Button'

export default function NotesPanel({ courseId, lessonId }) {
  const key = `notes:${courseId}:${lessonId}`
  const [value, setValue] = useState('')
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    const v = localStorage.getItem(key)
    if (v) setValue(v)
  }, [key])

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(key, value)
      setSavedAt(new Date())
    }, 500)
    return () => clearTimeout(handler)
  }, [value, key])

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">My Notes</h3>
        <Button size="sm" variant="secondary">
          <FileText className="h-4 w-4 mr-2" />
          Export Notes
        </Button>
      </div>
      <textarea
        className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none font-sans text-slate-700"
        placeholder="Take notes here... (Auto-saved)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {savedAt && (
        <p className="text-xs text-slate-400 mt-2">Saved {savedAt.toLocaleTimeString()}</p>
      )}
    </div>
  )
}
