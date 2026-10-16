import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { DeskDisplayClient } from "@/components/DeskDisplayClient"

export default async function DeskDisplayPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

    if (!gym) return <div className="p-6 text-slate-400">Gym not found.</div>


    const adminSupabase = createAdminClient()
    const timestamp = Date.now()
    const randomSalt = Math.random().toString(36).substring(2, 8)
    const initialToken = `gym_${gym.id}_${timestamp}_${randomSalt}`
    const expiresAt = new Date(timestamp + 5 * 60 * 1000).toISOString()

    await adminSupabase.from('qr_sessions').insert({
        gym_id: gym.id,
        token: initialToken,
        expires_at: expiresAt,
    })

    return <DeskDisplayClient gymId={gym.id} initialToken={initialToken} />
}