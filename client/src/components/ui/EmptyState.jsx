import { motion } from 'framer-motion'

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border border-dashed border-slate-300/70 bg-slate-50/50 px-6 py-16 text-center ${className}`}
        >
            {Icon && (
                <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon className="h-7 w-7" />
                </div>
            )}
            {title && <h3 className="mb-2 text-lg font-bold text-slate-800">{title}</h3>}
            {description && <p className="mx-auto mb-6 max-w-sm text-sm text-slate-500">{description}</p>}
            {action && <div>{action}</div>}
        </motion.div>
    )
}
