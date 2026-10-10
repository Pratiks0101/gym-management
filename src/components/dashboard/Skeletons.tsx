export function KpiCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-100 dark:bg-slate-800/60 h-28 rounded-xl border border-slate-200/50 dark:border-slate-800" />
            ))}
        </div>
    )
}

export function WidgetSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-full" />
                            <div className="space-y-1.5">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                            </div>
                        </div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
                    </div>
                ))}
            </div>
        </div>
    )
}