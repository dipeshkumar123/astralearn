export default function CategoryFilter({ categories = [], selectedCategory, onSelectCategory }) {
    return (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${selectedCategory === category
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    )
}
