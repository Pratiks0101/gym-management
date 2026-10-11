export default function PaymentsLoading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
            <div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-48 mb-2" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-80" />
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4" />
                ))}
            </div>

            {/* Main Table Skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-full" />
                ))}
            </div>
        </div>
    )
}