import { Badge } from './ui/Badge'

export default function CourseProgress({ value, variant = 'default', size = 'md' }) {
    const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="text-sm font-bold text-slate-900">{Math.round(value)}%</span>
            </div>
            <div className={`w-full bg-slate-100 rounded-full ${height} overflow-hidden`}>
                <div
                    className={`${height} rounded-full transition-all duration-1000 ease-out ${variant === 'success' ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-secondary'
                        }`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    )
}
