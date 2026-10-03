'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addMember(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) throw new Error("Unauthorized")

    const { data : gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if(!gym) throw new Error("Gym profile not found")

    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string || null
    const gender = formData.get('gender') as string
    const plan_id = formData.get('plan_id') as string
    const start_date_str = formData.get('start_date') as string

    if (!full_name || !phone || !plan_id) {
        throw new Error("Required fields missing")
    }

    const { data: plan } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('id', plan_id)
        .single()

    if(!plan) throw new Error("Plan not found")

    const startDate = start_date_str ? new Date(start_date_str) : new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + plan.duration_months)

    const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({
            gym_id: gym.id,
            full_name,
            phone,
            email,
            gender,
            status: 'active'
        })
        .select()
        .single()

    if(memberError || !member) {
        console.error("Error adding member:", memberError)
        throw new Error("Failed to create member")
    }

    const { error: subError} = await supabase
        .from('subscriptions')
        .insert({
            gym_id: gym.id,
            member_id: member.id,
            plan_id: plan.id,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            amount_paid: plan.price,
            status: 'active'
        })

    if (subError) {
        console.error("Error creating subscriptionL", subError)
        throw new Error("Failed to create subscription")
    }

    revalidatePath('/dashboard/members')
}


export async function getMembers() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return { data: [], error: "Unauthorized" }

    const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if(!gym) return { data: [], error: "Gym not found"}

    const { data: members, error } = await supabase
        .from('members')
        .select(`
            *,
            subscriptions (
                id,
                start_date,
                end_date,
                status,
                amount_paid,
                membership_plans (
                    plan_name,
                    price,
                    duration_months
                )
            )
        `)
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false })

    if(error) {
        console.error("Error Fetching members:", error)
        return { data: [], error: error.message}
    }

    return { data: members, error: null }
}

export async function deleteMembers(memberId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) throw new Error("Unauthorized")

    const { error: subError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('member_id', memberId)

    if(subError) {
        console.error("Error deleting subscriptions:", subError)
        throw new Error("Failed to delete member subscriptions")
    }

    const { error: memberError } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

    if(memberError) {
            console.error("Error deleting member:", memberError)
            throw new Error("Failed to delete member")
    }

    revalidatePath('/dashboard/members')
}