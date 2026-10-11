import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, UserCheck } from 'lucide-react'
import { getExpiringSubscriptions, getPendingDues } from '../actions/whatsapp'
import { getMonthlyRevenueTrend, getWeeklyAttendanceTrend } from '../actions/charts'

// UI Components & Skeletons
import { TodayAttendanceWidget } from '@/components/dashboard/TodayAttendaceWidget'
import { KpiStatsCards } from '@/components/dashboard/KpiStatsCards'
import { ExpiringSubscriptionsWidget } from '@/components/dashboard/ExpiringSubscriptionsWidget'
import { RecentTransactionsWidget } from '@/components/dashboard/RecentTransactionsWidget'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { InteractiveCalendarWidget } from '@/components/dashboard/InteractiveCalendarWidget'
import { WeeklyAttendanceChart } from '@/components/dashboard/WeeklyAttendanceChart'
import { PendingDuesCard } from '@/components/dashboard/PendingDuesCard'
import { KpiCardsSkeleton, WidgetSkeleton } from '@/components/dashboard/Skeletons'

// Async KPI Section Component
async function KpiSection({ gymId }: { gymId: string }) {
    const supabase = await createClient()

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString()

    const [
        { count: activeMembersCount },
        { count: todayAttendanceCount },
        { data: monthlyPayments },
        pendingDues
    ] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId),
        supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).gte('check_in_time', todayStart),
        supabase.from('payments').select('amount_paid').eq('gym_id', gymId).gte('created_at', firstDayOfMonth),
        getPendingDues(gymId)
    ])

    const totalMonthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0) || 0
    const totalPendingDues = pendingDues.reduce((sum, sub) => sum + Number(sub.due_amount || 0), 0)

    return (
        <KpiStatsCards 
            totalActive={activeMembersCount || 0} 
            totalMonthlyRevenue={totalMonthlyRevenue} 
            todayCount={todayAttendanceCount || 0} 
            totalPendingDues={totalPendingDues} 
        />
    )
}

// 🟢 NEW: Charts Async Section (Fetches Real or Dummy Data)
async function ChartsSection({ gymId }: { gymId: string }) {
    // 💡 Tip: Set second parameter to 'true' if you want to force Dummy Data
    const USE_DUMMY_DATA = false 

    const supabase = await createClient()

    const [revenueData, weeklyAttendanceData, activeMemvbersRes] = await Promise.all([
        getMonthlyRevenueTrend(gymId, USE_DUMMY_DATA),
        getWeeklyAttendanceTrend(gymId, USE_DUMMY_DATA),
        supabase.from('members').select('*', {count: 'exact', head: true}).eq('gym_id', gymId)
    ])

    const activeMembersCount = activeMemvbersRes.count || 0
    const todayCount = weeklyAttendanceData[weeklyAttendanceData.length - 1]?.count || 0

    const dynamicExpectedCount = activeMembersCount && activeMembersCount > 0 ? activeMembersCount : 10

    return (
        <div className="space-y-8">
            {/* Revenue Trend Line Chart */}
            <DashboardCharts data={revenueData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-6">
                <div className="lg:col-span-5">
                    <TodayAttendanceWidget todayCount={todayCount} expectedCount={dynamicExpectedCount} />
                </div>
                <div className="lg:col-span-7">
                    {/* Weekly Footfall Bar Chart */}
                    <WeeklyAttendanceChart data={weeklyAttendanceData} />
                </div>
            </div>
        </div>
    )
}

async function ExpiringSection({ gymId, gymName }: { gymId: string, gymName: string }) {
    const expiringSoon = await getExpiringSubscriptions(gymId)
    return <ExpiringSubscriptionsWidget expiringSoon={expiringSoon} gymName={gymName} />
}

async function PendingDuesSection({ gymId, gymName }: { gymId: string, gymName: string }) {
    const pendingDues = await getPendingDues(gymId)
    return <PendingDuesCard pendingDues={pendingDues} gymName={gymName} />
}

async function RecentPaymentsSection({ gymId }: { gymId: string }) {
    const supabase = await createClient()
    const { data: recentPayments } = await supabase
        .from('payments')
        .select('*, members(full_name)')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false })
        .limit(5)

    return <RecentTransactionsWidget recentPayments={recentPayments} />
}

// Main Dashboard Page
export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: gym } = await supabase
        .from('gyms')
        .select('id, name')
        .eq('owner_id', user.id)
        .single()

    if (!gym) redirect('/login')

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-2 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Welcome to {gym?.name || 'Gym'}! <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Here is a live snapshot of your gym&apos;s operations, revenue, and attendance today.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        href="/dashboard/members"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <UserCheck className="w-4 h-4" />
                        Quick Registration
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <Suspense fallback={<KpiCardsSkeleton />}>
                <KpiSection gymId={gym.id} />
            </Suspense>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts & Subscriptions) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Real / Dummy Charts Streamed Together */}
                    <Suspense fallback={<WidgetSkeleton />}>
                        <ChartsSection gymId={gym.id} />
                    </Suspense>

                    <Suspense fallback={<WidgetSkeleton />}>
                        <ExpiringSection gymId={gym.id} gymName={gym.name} />
                    </Suspense>

                    <Suspense fallback={<WidgetSkeleton />}>
                        <PendingDuesSection gymId={gym.id} gymName={gym.name} />
                    </Suspense>
                </div>

                {/* Right Column (Calendar & Recent Payments) */}
                <div className="space-y-8">
                    <InteractiveCalendarWidget gymId={gym.id} />
                    
                    <Suspense fallback={<WidgetSkeleton />}>
                        <RecentPaymentsSection gymId={gym.id} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}