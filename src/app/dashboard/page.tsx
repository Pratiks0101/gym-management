// // import { createClient } from '@/lib/supabase/server'
// // import { redirect } from 'next/navigation'
// // import { Button } from '@/components/ui/button'
// // import { TodayAttendanceWidget } from '@/components/TodayAttendaceWidget'

// // export default async function DashboardPage() {
// //     const supabase = await createClient()

// //     // Verify auth session
// //     const { data: { user } } = await supabase.auth.getUser()

// //     if (!user) {
// //         redirect('/login')
// //     }

// //     // Fetch current user's gym details
// //     const { data: gym } = await supabase
// //         .from('gyms')
// //         .select('*')
// //         .eq('owner_id', user.id)
// //         .single()

// //     return (
// //         <div className="p-8 space-y-4">
// //         <div className="flex items-center justify-between border-b pb-4">
// //             <div>
// //             <h1 className="text-3xl font-bold">Welcome, {gym?.name || 'Gym Owner'}!</h1>
// //             <p className="text-muted-foreground text-sm">Owner Email: {user.email}</p>
// //             </div>
            
// //             <form action={async () => {
// //             'use server'
// //             const supabase = await createClient()
// //             await supabase.auth.signOut()
// //             redirect('/login')
// //             }}>
// //             <Button variant="outline" type="submit">Sign Out</Button>
// //             </form>
// //         </div>

// //         <div className="rounded-lg border bg-card p-6">
// //             <h2 className="text-xl font-semibold mb-2">Dashboard Setup Success 🎉</h2>
// //             <p className="text-muted-foreground">
// //             Tenant Scoping, Authentication, aur Supabase Database integration bilkul sahi kaam kar rahe hain.
// //             </p>
// //         </div>
// //         </div>
// //     )
// //     }

// import { createClient } from '@/lib/supabase/server'
// import { redirect } from 'next/navigation'
// import { TodayAttendanceWidget } from '@/components/TodayAttendaceWidget'

// export default async function DashboardPage() {
//     const supabase = await createClient()

//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//         redirect('/login')
//     }

//     const { data: gym } = await supabase
//         .from('gyms')
//         .select('*')
//         .eq('owner_id', user.id)
//         .single()

//     const gymName = gym?.name || 'Gym Owner'

//     return (
//         <div className="space-y-6">
//             <div>
//                 <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
//                     Welcome to {gymName}! 👋
//                 </h1>
//                 <p className="text-xs sm:text-sm text-slate-500 mt-1">
//                     Here is what is happening with your gym today.
//                 </p>
//             </div>

//             {/* Quick Overview Layout */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                 <TodayAttendanceWidget todayCount={0} expectedCount={100} />
//             </div>
//         </div>
//     )
// }

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TodayAttendanceWidget } from '@/components/TodayAttendaceWidget'
import { 
    Users, 
    IndianRupee, 
    AlertCircle, 
    Calendar, 
    TrendingUp, 
    UserCheck, 
    Clock, 
    ArrowUpRight,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Fetch current gym details
    const { data: gym } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!gym) redirect('/login')

    // 2. Fetch Active Members Count
    const { count: activeMembersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)

    // 3. Fetch Today's Attendance Count
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const { count: todayAttendanceCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gym.id)
        .gte('created_at', todayStart.toISOString())

    // 4. Fetch Monthly Revenue (This Month)
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('gym_id', gym.id)
        .gte('created_at', firstDayOfMonth)

    const totalMonthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0

    // 5. Fetch Pending Dues Total & Subscriptions Expiring in 7 Days
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

    // 6. Recent Payments Log (Top 5)
    const { data: recentPayments } = await supabase
        .from('payments')
        .select('*, members(full_name)')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const totalActive = activeMembersCount || 0
    const todayCount = todayAttendanceCount || 0

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-2 sm:p-6">
            {/* Top Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Welcome to {gym?.name || 'Gym'}! <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Here is a live snapshot of your gym's operations, revenue, and attendance today.
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

            {/* 4 Primary KPI Stats Grid */}
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

                {/* Today's Attendance Dynamic Ratio */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Today's Turnout
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                            {todayCount} <span className="text-sm font-semibold text-slate-400">/ {totalActive}</span>
                        </h3>
                        <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
                            {totalActive > 0 ? Math.round((todayCount / totalActive) * 100) : 0}% Active Attendance
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Pending Dues */}
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

            {/* Main Operational Dashboard Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Attendance Widget & Expiring Subscriptions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Attendance Widget with Dynamic Active Members Ratio */}
                    <TodayAttendanceWidget todayCount={todayCount} expectedCount={totalActive} />

                    {/* Expiring Subscriptions in Next 7 Days */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Subscriptions Expiring Soon (Next 7 Days)
                            </h2>
                            <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 font-semibold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                                {expiringSoon.length} Members
                            </span>
                        </div>

                        {expiringSoon.length === 0 ? (
                            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                                🎉 No subscriptions expiring in the next 7 days.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {expiringSoon.map((sub: any) => (
                                    <div key={sub.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {sub.members?.photo_url ? (
                                                <Image 
                                                    src={sub.members.photo_url} 
                                                    alt={sub.members.full_name} 
                                                    width={36} 
                                                    height={36} 
                                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
                                                    {sub.members?.full_name?.slice(0, 2) || 'MB'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                                    {sub.members?.full_name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {sub.membership_plans?.plan_name || 'Standard Plan'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                Expires: {new Date(sub.end_date).toLocaleDateString('en-IN')}
                                            </p>
                                            <Link 
                                                href="/dashboard/members" 
                                                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center justify-end gap-0.5 mt-0.5"
                                            >
                                                Renew Now <ArrowUpRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right 1 Column: Recent Transactions & Quick Stats */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-500" />
                                Recent Transactions
                            </h2>
                            <Link href="/dashboard/payments" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                                View All
                            </Link>
                        </div>

                        {recentPayments && recentPayments.length > 0 ? (
                            <div className="space-y-3">
                                {recentPayments.map((p: any) => (
                                    <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-xs text-slate-900 dark:text-white">
                                                {p.members?.full_name || 'Gym Member'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                {new Date(p.created_at).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                +₹{p.amount}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
                                No payment records yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}