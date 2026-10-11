export default function AttendanceLoading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
            {/* Header Banner */}
            <div className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-48" />
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-48" />
            </div>
        </div>
    )
}