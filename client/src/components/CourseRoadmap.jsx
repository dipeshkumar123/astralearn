import { CheckCircle, Circle } from 'lucide-react'

export default function CourseRoadmap({ course, completedLessons = [] }) {
  const modules = course.modules || []

  return (
    <div className="relative pl-8 py-4">
      {/* Vertical timeline line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-200" />

      <ul className="space-y-8">
        {modules.map((m, mi) => {
          const moduleLessonIds = (m.lessons || []).map(l => l.id || l._id)
          const completedCount = moduleLessonIds.filter(id => completedLessons.includes(id)).length
          const totalCount = moduleLessonIds.length
          const isModuleComplete = totalCount > 0 && completedCount === totalCount

          return (
            <li key={m.id || mi} className="relative">
              {/* Timeline dot — aligned with the vertical line */}
              <div className="absolute -left-8 top-0.5 flex items-center justify-center">
                {isModuleComplete ? (
                  <CheckCircle className="h-[14px] w-[14px] text-emerald-500 bg-white rounded-full" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-white" />
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900">{m.title}</h4>
                  <span className="text-xs text-slate-400">
                    {completedCount}/{totalCount} lessons
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {m.lessons?.map((l, li) => {
                    const lid = l.id || l._id
                    const isComplete = completedLessons.includes(lid)

                    return (
                      <div
                        key={lid || li}
                        className={`p-3 rounded-lg border transition-all ${
                          isComplete
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isComplete ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                          )}
                          <p className="text-sm font-medium text-slate-800">{l.title}</p>
                        </div>
                        {l.duration && (
                          <p className="text-xs text-slate-500 mt-1 ml-6">
                            {Math.floor(l.duration / 60)} min
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
