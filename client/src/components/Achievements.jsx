import { Award, Flame, Star } from 'lucide-react'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

export default function Achievements({ points = 0, streak = 0, badges = [] }) {
  const defaultBadges = badges && badges.length ? badges : ['Starter', 'Learner']
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-full bg-amber-100 text-amber-600"><Star className="h-5 w-5" /></div>
        <div>
          <p className="text-xs text-slate-500">Points</p>
          <p className="font-bold text-slate-900 text-lg">{points}</p>
        </div>
      </Card>
      <Card className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-full bg-red-100 text-red-600"><Flame className="h-5 w-5" /></div>
        <div>
          <p className="text-xs text-slate-500">Current Streak</p>
          <p className="font-bold text-slate-900 text-lg">{streak} days</p>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2"><Award className="h-5 w-5 text-violet-600" /><p className="font-semibold">Badges</p></div>
        <div className="flex flex-wrap gap-2">
          {defaultBadges.map((b, i) => (<Badge key={i} variant="primary">{b}</Badge>))}
        </div>
      </Card>
    </div>
  )
}
