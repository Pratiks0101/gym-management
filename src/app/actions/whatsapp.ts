'use server'

import { createClient } from '@/lib/supabase/server'

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
        const memberObj = Array.isArray(sub.members) ? sub.members[0] : sub.members
        const memberId = memberObj?.id
        if(memberId && !memberLatestMap.has(memberId)) {
            memberLatestMap.set(memberId, { ...sub, memberObj })
        }
    }

    const filteredSubs = Array.from(memberLatestMap.values())

    return filteredSubs.map((sub: any) => ({
        id: sub.memberObj.id,
        full_name: sub.memberObj.full_name,
        phone: sub.memberObj.phone,
        plan_name: (Array.isArray(sub.membership_plans) ? sub.membership_plans[0]?.plan_name : sub.membership_plans?.plan_name) || 'General Plan',
        end_date: sub.end_date,
        members: sub.memberObj
    })) as ExpiringMember[]
}

// Fetch expired member list
export async function getExpiredSubscriptions(gymId: string) {
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
        .lt('end_date', today) // Expiry date pehle ki hai
        .order('end_date', { ascending: false })

    if (error) {
        console.error('Error fetching expired subscriptions:', error)
        return []
    }

    if (!data || data.length === 0) return []

// For handling duplicate of latested subscription
    const memberLatestMap = new Map<string, any>()

    for (const sub of data) {
        const memberObj = Array.isArray(sub.members) ? sub.members[0] : sub.members
        const memberId = memberObj?.id
        if (memberId && !memberLatestMap.has(memberId)) {
            memberLatestMap.set(memberId, { ...sub, memberObj })
        }
    }

    const filteredSubs = Array.from(memberLatestMap.values())

    return filteredSubs.map((sub: any) => ({
        id: sub.memberObj.id,
        full_name: sub.memberObj.full_name,
        phone: sub.memberObj.phone,
        plan_name: (Array.isArray(sub.membership_plans) ? sub.membership_plans[0]?.plan_name : sub.membership_plans?.plan_name) || 'General Plan',
        end_date: sub.end_date,
        members: sub.memberObj
    }))
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

    return (data || []).map((sub: any) => {
        const memberObj = Array.isArray(sub.members) ? sub.members[0] : sub.members
        const planObj = Array.isArray(sub.membership_plans) ? sub.membership_plans[0] : sub.membership_plans
        return {
            id: sub.id,
            member_id: sub.member_id || memberObj?.id,
            full_name: memberObj?.full_name,
            phone: memberObj?.phone,
            plan_name: planObj?.plan_name || 'General Plan',
            due_amount: sub.due_amount,
            members: memberObj
        }
    }) as PendingDueMember[]
}