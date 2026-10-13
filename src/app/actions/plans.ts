'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getMembershipPlans() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, data: [], error: "Unauthorized" }

    // Get gym_id of the owner
    const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (gymError || !gym) return { success: false, data: [], error: "Gym not found" }

    const { data: plans, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[Fetch Plans Error]:', error)
        return { success: false, data: [], error: error.message }
    }

    return { success: true, data: plans || [], error: null }
}

// Create new membership plan
export async function createMembershipPlan(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!gym) return { success: false, error: "Gym not found" }

    const plan_name = formData.get('name') as string
    const price = Number(formData.get('price'))
    const duration_months = Number(formData.get('duration_months'))

    if (!plan_name || isNaN(price) || isNaN(duration_months)) {
        return { success: false, error: "Please fill all required fields correctly" }
    }

    const { error } = await supabase
        .from('membership_plans')
        .insert({
            gym_id: gym.id,
            plan_name,
            price,
            duration_months,
            is_active: true
        })

    if (error) {
        console.error("Create Plan Error:", error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/plans')
    return { success: true }
}

export async function updateMembershipPlan(formData: FormData) {
    const supabase = await createClient()

    const planId = formData.get('plan_id') as string
    const plan_name = formData.get('plan_name') as string
    const price = Number(formData.get('price'))
    const duration_months = Number(formData.get('duration_months'))

    if (!planId || !plan_name || isNaN(price) || isNaN(duration_months)) {
        return { success: false, error: "Invalid parameters" }
    }

    const { error } = await supabase
        .from('membership_plans')
        .update({
            plan_name,
            price,
            duration_months
        })
        .eq('id', planId)

    if (error) {
        console.error("Update Plan Error:", error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/plans')
    return { success: true }
}

export async function togglePlanStatus(planId: string, currentStatus: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('membership_plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId)

    if (error) {
        console.error("Toggle Status Error:", error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/plans')
    return { success: true }
}

export async function deleteMembershipPlan(planId: string) {
    const supabase = await createClient()

    const { count, error: countError } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .eq('plan_id', planId)

    if (countError) {
        console.error("Member Check Error:", countError.message)
    }

    if (count && count > 0) {
        return { success: false, error: "Cannot delete plan: Members are actively using this plan. Please mark it as inactive instead." }
    }

    const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', planId)

    if (error) {
        console.error("Delete Plan Error:", error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/plans')
    return { success: true }
}