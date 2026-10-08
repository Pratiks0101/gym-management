import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, UserCheck } from 'lucide-react'

// Imported Components
import { TodayAttendanceWidget } from '@/components/dashboard/TodayAttendaceWidget'
import { KpiStatsCards } from '@/components/dashboard/KpiStatsCards'
import { ExpiringSubscriptionsWidget } from '@/components/dashboard/ExpiringSubscriptionsWidget'
import { RecentTransactionsWidget } from '@/components/dashboard/RecentTransactionsWidget'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { InteractiveCalendarWidget } from '@/components/dashboard/InteractiveCalendarWidget'
import { WeeklyAttendanceChart } from '@/components/dashboard/WeeklyAttendanceChart'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Gym Details
    const { data: gym } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!gym) redirect('/login')

    // 2. Active Members
    const { count: activeMembersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)

    // 3. Today's Attendance
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const { count: todayAttendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)
        .gte('created_at', todayStart.toISOString())

    // 4. Monthly Revenue
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('gym_id', gym.id)
        .gte('created_at', firstDayOfMonth)

    const totalMonthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0

    // 5. Subscriptions & Pending Dues
    const next7Days = new Date()
    next7Days.setDate(next7Days.getDate() + 7)

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, members(full_name, phone, photo_url), membership_plans(plan_name)')
        .eq('gym_id', gym.id)

    let totalPendingDues = 0
    const expiringSoon: any[] = []
    const now = new Date()

    subscriptions?.forEach((sub) => {
        if (Number(sub.due_amount) > 0) {
            totalPendingDues += Number(sub.due_amount)
        }

        if (sub.end_date) {
            const endDate = new Date(sub.end_date)
            if (endDate >= now && endDate <= next7Days) {
                expiringSoon.push(sub)
            }
        }
    })

    // 6. Recent Payments
    const { data: recentPayments } = await supabase
        .from('payments')
        .select('*, members(full_name)')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const totalActive = activeMembersCount || 0
    const todayCount = todayAttendanceCount || 0

    const monthlyRevenueTrendData = [
        { month: 'May', revenue: 15000 },
        { month: 'Jun', revenue: 22000 },
        { month: 'Jul', revenue: 18000 },
        { month: 'Aug', revenue: 28000 },
        { month: 'Sep', revenue: 35000 },
        { month: 'Oct', revenue: 42000 },
    ]

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-2 sm:p-6">
            {/* Header Greeting */}
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
            <KpiStatsCards 
                totalActive={totalActive} 
                totalMonthlyRevenue={totalMonthlyRevenue} 
                todayCount={todayCount} 
                totalPendingDues={totalPendingDues} 
            />

            {/* Operational Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section (Charts + Attendance + Expiring) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Yaha shadcn Charts integrate honge */}
                    {/* <DashboardCharts data={monthlyPayments} /> */}
                    <DashboardCharts data={monthlyRevenueTrendData} />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-6">
                    {/* Today's Attendance Radial Arc */}
                        <div className="lg:col-span-5">
                            <TodayAttendanceWidget todayCount={38} expectedCount={60} />
                            {/* <TodayAttendanceWidget todayCount={todayCount} expectedCount={totalActive} /> */}
                        </div>

                        {/* Weekly Mon-Sat Footfall Bar Chart */}
                        <div className="lg:col-span-7">
                            <WeeklyAttendanceChart />
                        </div>
                    </div>
                    <ExpiringSubscriptionsWidget expiringSoon={expiringSoon} />
                </div>

                {/* Right Section (Calendar + Recent Payments) */}
                <div className="space-y-8">
                    {/* Yaha Interactive Calendar & Daily Drilldown Log component aayega */}
                    <InteractiveCalendarWidget gymId={gym.id} />
                    <RecentTransactionsWidget recentPayments={recentPayments} />
                </div>
            </div>
        </div>
    )
}