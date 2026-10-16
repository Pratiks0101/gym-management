'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// 1. Desktop QR Token Generator
export async function generateDeskToken(gymId: string) {
    if (!gymId) return { success: false, token: null }

    const supabase = createAdminClient()
    const timestamp = Date.now()
    const randomSalt = Math.random().toString(36).substring(2, 8)
    const token = `gym_${gymId}_${timestamp}_${randomSalt}`

    // Token Validity: 5 Minutes Buffer
    const expiresAt = new Date(timestamp + 5 * 60 * 1000).toISOString()

    // Parallel cleanup and insert for lightning fast QR generation
    await Promise.all([
        supabase
            .from('qr_sessions')
            .delete()
            .lt('expires_at', new Date().toISOString()),
        supabase
            .from('qr_sessions')
            .insert({
                gym_id: gymId,
                token: token,
                expires_at: expiresAt,
            })
    ])

    return { success: true, token }
}

// 2. Process Mobile Check-In
export async function processMemberCheckIn({ gymId, phone, token }: {
    gymId: string
    phone?: string
    token?: string
}) {
    const supabase = createAdminClient()

    const sanitizedPhone = phone ? phone.trim().replace(/\s+/g, '') : ''

    if (!sanitizedPhone || sanitizedPhone.length < 10) {
        return { success: false, message: 'Please enter a valid 10-digit mobile number.' }
    }

    if (!token || !gymId) {
        return { success: false, message: 'Invalid request parameters.' }
    }

    // 1. Parallel verification: Verify QR Session and Fetch Member simultaneously
    const [qrRes, memberRes] = await Promise.all([
        supabase
            .from('qr_sessions')
            .select('id, expires_at')
            .eq('token', token)
            .eq('gym_id', gymId)
            .maybeSingle(),
        supabase
            .from('members')
            .select('id, full_name, status, phone, gym_id')
            .eq('gym_id', gymId)
            .eq('phone', sanitizedPhone)
            .maybeSingle()
    ])

    const qrSession = qrRes.data
    const qrErr = qrRes.error

    if (qrErr || !qrSession) {
        return { success: false, message: 'Invalid or expired QR code! Please rescan live QR.' }
    }

    if (new Date() > new Date(qrSession.expires_at)) {
        return { success: false, message: 'QR Code expired! Please scan fresh QR code.' }
    }

    const member = memberRes.data
    if (!member) {
        return { success: false, message: 'No registered member found with this phone number.' }
    }

    // 2. Parallel check: Fetch Subscription and Check Today's Attendance simultaneously
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [subRes, attendanceRes] = await Promise.all([
        supabase
            .from('subscriptions')
            .select('end_date, status')
            .eq('gym_id', gymId)
            .eq('member_id', member.id)
            .order('end_date', { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from('attendance')
            .select('id')
            .eq('gym_id', gymId)
            .eq('member_id', member.id)
            .gte('check_in_time', startOfDay.toISOString())
            .maybeSingle()
    ])

    const latestSub = subRes.data
    const subErr = subRes.error

    if (subErr || !latestSub) {
        return { success: false, message: 'No active subscription plan found.' }
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const expiryStr = new Date(latestSub.end_date).toISOString().split('T')[0]

    if (expiryStr < todayStr) {
        return { success: false, message: `Membership expired on ${expiryStr}! Please renew plan.` }
    }

    if (attendanceRes.data) {
        return {
            success: false,
            message: 'Already checked in today!',
            member: { full_name: member.full_name },
        }
    }

    // 3. Log Attendance Entry
    const { error: insertErr } = await supabase
        .from('attendance')
        .insert({
            gym_id: gymId,
            member_id: member.id,
            check_in_time: new Date().toISOString(),
        })

    if (insertErr) {
        console.error('[Attendance Insert Error]:', insertErr)
        return { success: false, message: 'Failed to log attendance. Please try again.' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/attendance')

    return {
        success: true,
        message: `Welcome, ${member.full_name}! Check-in Successful.`,
        member: { full_name: member.full_name },
    }
}

export async function processManualCheckIn({ gymId, memberId }: { gymId: string; memberId: string }) {
    const supabase = createAdminClient()

    if (!gymId || !memberId) {
        return { success: false, message: 'Invalid Gym or Member selection.' }
    }

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    // Parallel fetch: Verify Member & Check Duplicate Attendance simultaneously
    const [memberRes, attendanceRes] = await Promise.all([
        supabase
            .from('members')
            .select('id, full_name, status')
            .eq('gym_id', gymId)
            .eq('id', memberId)
            .maybeSingle(),
        supabase
            .from('attendance')
            .select('id')
            .eq('gym_id', gymId)
            .eq('member_id', memberId)
            .gte('created_at', startOfDay.toISOString())
            .maybeSingle()
    ])

    const member = memberRes.data
    if (memberRes.error || !member || member.status !== 'active') {
        return { success: false, message: 'Member not found or inactive.' }
    }

    if (attendanceRes.data) {
        return { success: false, message: `${member.full_name} is already checked in today!` }
    }

    // Record Attendance Log
    const { error: insertErr } = await supabase
        .from('attendance')
        .insert({
            gym_id: gymId,
            member_id: memberId,
            check_in_time: new Date().toISOString()
        })

    if (insertErr) {
        return { success: false, message: 'Failed to record attendance.' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/attendance')

    return { success: true, message: `Manual check-in logged for ${member.full_name}` }
}