export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
