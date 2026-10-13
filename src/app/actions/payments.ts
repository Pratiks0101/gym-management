import { createClient } from "@/lib/supabase/server";

export async function getPaymentLogs() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { data: [], error: "Unauthorized" }

    const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()
    
    if (gymError || !gym) return { data: [], error: "Gym not found" }

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
        .order('created_at', { ascending: false })
    
    if (error) {
        console.error('[Fetch Payments Error]:', error)
        return { data: [], error: error.message }
    }
    
    return { data: payments || [], error: null }
}