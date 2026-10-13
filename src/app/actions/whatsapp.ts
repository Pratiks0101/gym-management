'use server'

import { createClient } from '@/lib/supabase/server'

export type ExpiringMember = {
    id: string
    full_name: string
    phone: string
    plan_name: string
    end_date: string
    members?: any
}

export type PendingDueMember = {
    id: string
    member_id?: string
    full_name: string
    phone: string
    due_amount: number
    plan_name: string
    members?: any
}

// Fetch members whose subscription expires in next N days (Optimized)
export async function getExpiringSubscriptions(gymId: string, daysAhead: number = 7): Promise<ExpiringMember[]> {
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + daysAhead)
    const nextDaysLimit = targetDate.toISOString().split('T')[0]

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
        .lte('end_date', nextDaysLimit)
        .order('end_date', { ascending: true })

    if (error || !data || data.length === 0) {
        if (error) console.error('Error fetching expiring subscriptions:', error)
        return []
    }

    // Fast deduplication map
    const memberLatestMap = new Map<string, any>()

    for (const sub of data) {
        const memberObj = Array.isArray(sub.members) ? sub.members[0] : sub.members
        const memberId = memberObj?.id
        if (memberId && !memberLatestMap.has(memberId)) {
            const planObj = Array.isArray(sub.membership_plans) ? sub.membership_plans[0] : sub.membership_plans
            memberLatestMap.set(memberId, {
                id: memberObj.id,
                full_name: memberObj.full_name,
                phone: memberObj.phone,
                plan_name: planObj?.plan_name || 'General Plan',
                end_date: sub.end_date,
                members: memberObj
            })
        }
    }

    return Array.from(memberLatestMap.values())
}

// 🟢 Fetch expired member list (Optimized)
export async function getExpiredSubscriptions(gymId: string): Promise<ExpiringMember[]> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

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
        .lt('end_date', today)
        .order('end_date', { ascending: false })

    if (error || !data || data.length === 0) {
        if (error) console.error('Error fetching expired subscriptions:', error)
        return []
    }

    const memberLatestMap = new Map<string, any>()

    for (const sub of data) {
        const memberObj = Array.isArray(sub.members) ? sub.members[0] : sub.members
        const memberId = memberObj?.id
        if (memberId && !memberLatestMap.has(memberId)) {
            const planObj = Array.isArray(sub.membership_plans) ? sub.membership_plans[0] : sub.membership_plans
            memberLatestMap.set(memberId, {
                id: memberObj.id,
                full_name: memberObj.full_name,
                phone: memberObj.phone,
                plan_name: planObj?.plan_name || 'General Plan',
                end_date: sub.end_date,
                members: memberObj
            })
        }
    }

    return Array.from(memberLatestMap.values())
}

// 🟢 Fetch members with pending due amount > 0 (Optimized)
export async function getPendingDues(gymId: string): Promise<PendingDueMember[]> {
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

    if (error || !data) {
        if (error) console.error('Error fetching pending dues:', error)
        return []
    }

    return data.map((sub: any) => {
        const memberObj = Array.isArray(sub.members) ? sub.members[0] : sub.members
        const planObj = Array.isArray(sub.membership_plans) ? sub.membership_plans[0] : sub.membership_plans
        return {
            id: sub.id,
            member_id: sub.member_id || memberObj?.id,
            full_name: memberObj?.full_name,
            phone: memberObj?.phone,
            plan_name: planObj?.plan_name || 'General Plan',
            due_amount: Number(sub.due_amount || 0),
            members: memberObj
        }
    })
}