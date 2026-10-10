'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ExpiringMember = {
    id: string
    full_name: string
    phone: string
    plan_name: string
    end_date: string
}

export type PendingDueMember = {
    id: string
    full_name: string
    phone: string
    due_amount: number
    plan_name: string
}


// Fetch members whose subscription expires in next N days (Default: 7 days)

export async function getExpiringSubscriptions(gymId: string, daysAhead: number = 7) {
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]
    const targetDate = new Date()
    targetDate.setDate(new Date().getDate() + daysAhead)
    const next7Days = targetDate.toISOString().split('T')[0]

// Fetch active subscriptions ending in next 7 days
    const { data, error } = await supabase
        .from('subscriptions')
        .select(`
            id,
            end_date,
            status,
            members!inner(id, full_name, phone, photo_url, gym_id),
            membership_plans(plan_name)
        `)
        .eq('members.gym_id', gymId)
        .eq('status', 'active') 
        .gte('end_date', today) 
        .lte('end_date', next7Days)
        .order('end_date', { ascending: true })

    if (error) {
        console.error('Error fetching expiring subscriptions:', error)
        return []
    }

    if(!data || data.length === 0) return []

    const memberLatestMap = new Map<string, any>()

    for (const sub of data) {
        const memberId = sub.members.id
        if(!memberLatestMap.has(memberId)) {
            memberLatestMap.set(memberId, sub)
        }
    }

    const filteredSubs = Array.from(memberLatestMap.values())

    return filteredSubs.map((sub: any) => ({
        id: sub.members.id,
        full_name: sub.members.full_name,
        phone: sub.members.phone,
        plan_name: sub.membership_plans?.plan_name || 'General Plan',
        end_date: sub.end_date,
        members: sub.members
    })) as ExpiringMember[]
}


// Fetch members with pending due amount > 0

export async function getPendingDues(gymId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('subscriptions')
        .select(`
            id,
            due_amount,
            member_id,
            members!inner(id, full_name, phone, photo_url, gym_id),
            membership_plans(plan_name)
        `)
        .eq('members.gym_id', gymId)
        .gt('due_amount', 0)
        .order('due_amount', { ascending: false })

    if (error) {
        console.error('Error fetching pending dues:', error)
        return []
    }

    return (data || []).map((sub: any) => ({
        id: sub.id,
        member_id: sub.member_id || sub.members.id,
        full_name: sub.members?.full_name,
        phone: sub.members?.phone,
        plan_name: sub.membership_plans?.plan_name || 'General Plan',
        due_amount: sub.due_amount,
        members: sub.members
    })) as PendingDueMember[]
}