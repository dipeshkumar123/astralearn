import { Search } from 'lucide-react'

export default function SearchBar({ value = '', onChange, onSearch, placeholder = 'Search for courses...' }) {
    const handleChange = (nextValue) => {
        if (typeof onChange === 'function') onChange(nextValue)
        if (typeof onSearch === 'function') onSearch(nextValue)
    }

    return (
        <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(event) => handleChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                placeholder={placeholder}
            />
        </div>
    )
}
