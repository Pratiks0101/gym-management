import { createClient } from "@/lib/supabase/server";

export async function getPaymentLogs() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {data: [], error: "Unathorized"}

    const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()
    
        if (!gym) return { data: [], error: "Gym not found"}

        const { data: payments, error } = await supabase
            .from('payments')
            .select(`
                id,
                amount_paid,
                payment_type,
                payment_method,
                created_at,
                members (
                full_name,
                phone
                )
            `)
            .eq('gym_id', gym.id)
            .order('created_at', {ascending: false})
        
        return { data: payments || [], error: error?.message || null}
    
}