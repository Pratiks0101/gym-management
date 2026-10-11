import { createClient } from '@/lib/supabase/server'
import { subMonths, subDays, format, startOfMonth, endOfMonth, startOfDay, endOfDay, getHours } from 'date-fns'

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
 * 1. Revenue Chart Action (Payments Table)
 */
export async function getMonthlyRevenueTrend(gymId: string, useDummy = false) {
    if (useDummy) return DUMMY_REVENUE_DATA

    const supabase = await createClient()

    // Last 6 Months range
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), 5 - i)
        return {
            monthLabel: format(d, 'MMM'),
            monthYearKey: format(d, 'yyyy-MM'),
            start: startOfMonth(d).toISOString(),
            end: endOfMonth(d).toISOString()
        }
    })

    const startDate = last6Months[0].start
    const endDate = last6Months[5].end

    const { data: payments, error } = await supabase
        .from('payments')
        .select('amount_paid, created_at')
        .eq('gym_id', gymId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

    if (error || !payments || payments.length === 0) {
        return DUMMY_REVENUE_DATA // DB empty ya error hone par auto fallback
    }

    // Real DB Data Map
    return last6Months.map((m) => {
        const revenue = payments
            .filter((p) => format(new Date(p.created_at), 'yyyy-MM') === m.monthYearKey)
            .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)

        return {
            month: m.monthLabel,
            revenue: revenue
        }
    })
}

/**
 * 2. Weekly Footfall Chart Action (Attendance Table)
 */
// export async function getWeeklyAttendanceTrend(gymId: string, useDummy = false) {
//     if (useDummy) return DUMMY_WEEKLY_ATTENDANCE_DATA

//     const supabase = await createClient()

//     // Last 7 Days range
//     const last7Days = Array.from({ length: 7 }).map((_, i) => {
//         const d = subDays(new Date(), 6 - i)
//         return {
//             dateStr: format(d, 'yyyy-MM-dd'),
//             dayLabel: format(d, 'EEE'),
//             start: startOfDay(d).toISOString(),
//             end: endOfDay(d).toISOString()
//         }
//     })

//     const startDate = last7Days[0].start
//     const endDate = last7Days[6].end

//     const { data: attendance, error } = await supabase
//         .from('attendance')
//         .select('id, check_in_time')
//         .eq('gym_id', gymId)
//         .gte('check_in_time', startDate)
//         .lte('check_in_time', endDate)

//     if (error || !attendance || attendance.length === 0) {
//         return DUMMY_WEEKLY_ATTENDANCE_DATA // Fallback to dummy data
//     }

//     // Real DB Data Map
//     return last7Days.map((day) => {
//         const count = attendance.filter((a) => {
//             const checkInDate = format(new Date(a.check_in_time), 'yyyy-MM-dd')
//             return checkInDate === day.dateStr
//         }).length

//         return {
//             day: day.dayLabel,
//             count: count
//         }
//     })
// }

export async function getWeeklyAttendanceTrend(gymId: string, useDummy = false) {
    if (useDummy) return DUMMY_WEEKLY_ATTENDANCE_DATA

    const supabase = await createClient()

    // 🟢 Rolling 7 Days (Today + Past 6 Days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i)
        return {
            dateStr: format(d, 'yyyy-MM-dd'),
            dayLabel: format(d, 'EEE'), // E.g., 'Mon', 'Sun'
            start: startOfDay(d).toISOString(),
            end: endOfDay(d).toISOString()
        }
    })

    const startDate = last7Days[0].start
    const endDate = last7Days[6].end

    // Single lightweight query for past 7 days
    const { data: attendance, error } = await supabase
        .from('attendance')
        .select('id, check_in_time')
        .eq('gym_id', gymId)
        .gte('check_in_time', startDate)
        .lte('check_in_time', endDate)

    if (error || !attendance || attendance.length === 0) {
        return DUMMY_WEEKLY_ATTENDANCE_DATA
    }

    // 🟢 Map each day with Morning (before 12 PM) and Evening (after 12 PM) split
    return last7Days.map((day) => {
        const dayCheckIns = attendance.filter((a) => {
            const checkInDate = format(new Date(a.check_in_time), 'yyyy-MM-dd')
            return checkInDate === day.dateStr
        })

        let morningCount = 0
        let eveningCount = 0

        dayCheckIns.forEach((record) => {
            const hour = getHours(new Date(record.check_in_time))
            if (hour < 12) {
                morningCount++
            } else {
                eveningCount++
            }
        })

        return {
            day: day.dayLabel,
            morning: morningCount,
            evening: eveningCount,
            total: morningCount + eveningCount
        }
    })
}