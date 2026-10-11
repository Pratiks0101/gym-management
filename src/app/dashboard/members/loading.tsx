export default function MembersLoading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
            <div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-48 mb-2" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-80" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Form Skeleton */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4" />
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
                    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
                    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-full mt-4" />
                </div>

                {/* Right Table Skeleton */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-40" />
                        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-64" />
                    </div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-full" />
                    ))}
                </div>
            </div>
        </div>
    )
}