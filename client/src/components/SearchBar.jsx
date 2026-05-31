import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value = '', onChange, placeholder = 'Search for courses...' }) {
    const [localValue, setLocalValue] = useState(value)

    // Sync external value changes
    useEffect(() => {
        setLocalValue(value)
    }, [value])

    // 300ms debounce before calling onChange
    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof onChange === 'function' && localValue !== value) {
                onChange(localValue)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [localValue])

    return (
        <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
                type="text"
                value={localValue}
                onChange={(event) => setLocalValue(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                placeholder={placeholder}
            />
            {localValue && (
                <button
                    type="button"
                    onClick={() => {
                        setLocalValue('')
                        if (typeof onChange === 'function') onChange('')
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}
