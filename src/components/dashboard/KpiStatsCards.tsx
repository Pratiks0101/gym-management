import { Users, IndianRupee, AlertCircle, UserCheck, TrendingUp } from 'lucide-react'

type KpiProps = {
    totalActive: number
    totalMonthlyRevenue: number
    todayCount: number
    totalPendingDues: number
}

export function KpiStatsCards({ 
    totalActive, 
    totalMonthlyRevenue, 
    todayCount, 
    totalPendingDues 
}: KpiProps) {
    const turnoutPercentage = totalActive > 0 ? Math.round((todayCount / totalActive) * 100) : 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Active Members */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Active Members
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {totalActive}
                    </h3>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Enrolled Clients
                    </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users className="w-6 h-6" />
                </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        This Month Revenue
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                        ₹{totalMonthlyRevenue.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Collected so far
                    </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <IndianRupee className="w-6 h-6" />
                </div>
            </div>

            {/* Today's Turnout */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Today&apos;s Turnout
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                        {todayCount} <span className="text-sm font-semibold text-slate-400">/ {totalActive}</span>
                    </h3>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
                        {turnoutPercentage}% Active Attendance
                    </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <UserCheck className="w-6 h-6" />
                </div>
            </div>

            {/* Pending Dues */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Pending Dues
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                        ₹{totalPendingDues.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Action Required
                    </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}