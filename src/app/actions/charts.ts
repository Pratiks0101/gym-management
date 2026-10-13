import { createClient } from '@/lib/supabase/server'
import { subMonths, subDays, format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

// DUMMY DATA FALLBACKS
const DUMMY_REVENUE_DATA = [
    { month: 'May', revenue: 15000 },
    { month: 'Jun', revenue: 22000 },
    { month: 'Jul', revenue: 18000 },
    { month: 'Aug', revenue: 28000 },
    { month: 'Sep', revenue: 35000 },
    { month: 'Oct', revenue: 42000 },
]

const DUMMY_WEEKLY_ATTENDANCE_DATA = [
    { day: 'Mon', morning: 25, evening: 20, total: 45 },
    { day: 'Tue', morning: 30, evening: 22, total: 52 },
    { day: 'Wed', morning: 18, evening: 20, total: 38 },
    { day: 'Thu', morning: 22, evening: 26, total: 48 },
    { day: 'Fri', morning: 20, evening: 22, total: 42 },
    { day: 'Sat', morning: 15, evening: 15, total: 30 },
    { day: 'Sun', morning: 10, evening: 8, total: 18 },
]

/**
 * Revenue Chart Action (Payments Table) - Optimized with O(1) Lookup Map
 */
export async function getMonthlyRevenueTrend(gymId: string, useDummy = false) {
    if (useDummy) return DUMMY_REVENUE_DATA

    const supabase = await createClient()

    // Last 6 Months range definition
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), 5 - i)
        return {
            monthLabel: format(d, 'MMM'),
            monthYearKey: format(d, 'yyyy-MM'),
        }
    })

    const startDate = startOfMonth(subMonths(new Date(), 5)).toISOString()
    const endDate = endOfMonth(new Date()).toISOString()

    const { data: payments, error } = await supabase
        .from('payments')
        .select('amount_paid, created_at')
        .eq('gym_id', gymId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

    const validPayments = (!error && payments) ? payments : []

    // Group payments by 'yyyy-MM' into a fast lookup map
    const revenueMap: Record<string, number> = {}
    for (const p of validPayments) {
        if (!p.created_at) continue
        const key = p.created_at.slice(0, 7) // Fast ISO substring 'yyyy-MM'
        revenueMap[key] = (revenueMap[key] || 0) + Number(p.amount_paid || 0)
    }

    // Map through months in O(1) time
    return last6Months.map(m => ({
        month: m.monthLabel,
        revenue: revenueMap[m.monthYearKey] || 0
    }))
}

/**
 * Weekly Attendance Trend - Optimized with Pre-aggregated Dictionary Map
 */
export async function getWeeklyAttendanceTrend(gymId: string, useDummy = false) {
    if (useDummy) return DUMMY_WEEKLY_ATTENDANCE_DATA

    const supabase = await createClient()

    // Rolling 7 Days (Today + Past 6 Days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i)
        return {
            dateStr: format(d, 'yyyy-MM-dd'),
            dayLabel: format(d, 'EEE'), // E.g., 'Mon', 'Sun'
        }
    })

    const startDate = startOfDay(subDays(new Date(), 6)).toISOString()
    const endDate = endOfDay(new Date()).toISOString()

    // Single lightweight query for past 7 days
    const { data: attendance, error } = await supabase
        .from('attendance')
        .select('id, check_in_time')
        .eq('gym_id', gymId)
        .gte('check_in_time', startDate)
        .lte('check_in_time', endDate)

    const validAttendance = (!error && attendance) ? attendance : []

    // Group attendance by date string with pre-calculated morning/evening counts
    const attendanceMap: Record<string, { morning: number; evening: number }> = {}

    for (const record of validAttendance) {
        if (!record.check_in_time) continue
        const dateKey = record.check_in_time.slice(0, 10) // Fast ISO substring 'yyyy-MM-dd'

        if (!attendanceMap[dateKey]) {
            attendanceMap[dateKey] = { morning: 0, evening: 0 }
        }

        const hour = new Date(record.check_in_time).getHours()
        if (hour < 12) {
            attendanceMap[dateKey].morning++
        } else {
            attendanceMap[dateKey].evening++
        }
    }

    // Map through the 7 days efficiently
    return last7Days.map((day) => {
        const counts = attendanceMap[day.dateStr] || { morning: 0, evening: 0 }
        return {
            day: day.dayLabel,
            morning: counts.morning,
            evening: counts.evening,
            total: counts.morning + counts.evening
        }
    })
}