export default function CourseRoadmap({ course }) {
  const modules = course.modules || []
  return (
    <div className="relative p-4">
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-200" />
      <ul className="space-y-6">
        {modules.map((m, mi) => (
          <li key={m.id || mi} className="relative">
            <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-primary" />
            <div className="ml-10">
              <h4 className="font-semibold text-slate-900 mb-2">{m.title}</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {m.lessons?.map((l, li) => (
                  <div key={l.id || li} className="p-3 rounded-lg border border-slate-200 bg-white hover:border-primary/40 transition-all">
                    <p className="text-sm font-medium text-slate-800">{l.title}</p>
                    <p className="text-xs text-slate-500">{l.duration ? `${Math.floor(l.duration/60)} min` : '10 min'}</p>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
