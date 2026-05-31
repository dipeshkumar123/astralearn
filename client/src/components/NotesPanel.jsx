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

  const handleExport = () => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes-${courseId}-${lessonId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">My Notes</h3>
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <FileText className="h-4 w-4 mr-2" />
          Export Notes
        </Button>
      </div>
      <textarea
        className="h-56 sm:h-64 w-full p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none font-mono text-sm text-slate-700"
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
