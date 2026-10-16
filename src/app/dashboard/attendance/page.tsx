import { createClient } from "@/lib/supabase/server"
import { AttendanceClientView } from "@/components/AttendanceClientView"
import { redirect } from "next/navigation"

export default async function AttendancePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

    if (!gym) return <div className="p-6 text-slate-500">No gym found for this account.</div>

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    // Parallel fetch: Members, Today's Check-ins, AND Initial Recent Logs directly on server
    const [membersRes, attendanceRes, recentLogsRes] = await Promise.all([
        supabase
            .from('members')
            .select('id, full_name, phone, status')
            .eq('gym_id', gym.id)
            .order('full_name', { ascending: true }),
        supabase
            .from('attendance')
            .select('member_id')
            .eq('gym_id', gym.id)
            .gte('check_in_time', startOfDay.toISOString()),
        supabase
            .from('attendance')
            .select('id, check_in_time, members(full_name, phone)')
            .eq('gym_id', gym.id)
            .gte('check_in_time', startOfDay.toISOString())
            .order('check_in_time', { ascending: false })
            .limit(10)
    ])

    const initialMembers = membersRes.data || []
    const initialCheckedIn = attendanceRes.data ? attendanceRes.data.map(a => a.member_id) : []
    const initialLogs = recentLogsRes.data || []

    return (
        <AttendanceClientView 
            gymId={gym.id} 
            initialMembers={initialMembers} 
            initialCheckedIn={initialCheckedIn} 
            initialLogs={initialLogs}
        />
    )
}