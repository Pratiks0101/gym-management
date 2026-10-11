import { KpiCardsSkeleton, WidgetSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto p-2 sm:p-6 animate-pulse">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-6" />
            <KpiCardsSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <WidgetSkeleton />
                    <WidgetSkeleton />
                </div>
                <div className="space-y-6">
                    <WidgetSkeleton />
                </div>
            </div>
        </div>
    )
}