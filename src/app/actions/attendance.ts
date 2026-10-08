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

    // Expired QR session cleanup
    await supabase
        .from('qr_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())

    const { error } = await supabase
        .from('qr_sessions')
        .insert({
            gym_id: gymId,
            token: token,
            expires_at: expiresAt,
        })

    if (error) {
        console.error('[QR Generation Error]:', error)
        return { success: false, token: null }
    }

    return { success: true, token }
}

// 2. Process Mobile Check-In
export async function processMemberCheckIn({ gymId, phone, token }: {
    gymId: string
    phone?: string
    token?: string
}) {
    const supabase = createAdminClient()

    // Input Sanitization
    const sanitizedPhone = phone ? phone.trim().replace(/\s+/g, '') : ''

    if (!sanitizedPhone || sanitizedPhone.length < 10) {
        return { success: false, message: 'Please enter a valid 10-digit mobile number.' }
    }

    if (!token || !gymId) {
        return { success: false, message: 'Invalid request parameters.' }
    }

    // A. QR Session Token Verification
    const { data: qrSession, error: qrErr } = await supabase
        .from('qr_sessions')
        .select('id, expires_at')
        .eq('token', token)
        .eq('gym_id', gymId)
        .maybeSingle()

    if (qrErr || !qrSession) {
        return { success: false, message: 'Invalid or expired QR code! Please rescan live QR.' }
    }

    if (new Date() > new Date(qrSession.expires_at)) {
        return { success: false, message: 'QR Code expired! Please scan fresh QR code.' }
    }

    console.log(`[CheckIn Search] Searching for GymID: "${gymId}" and Phone: "${sanitizedPhone}"`)

    const { data: member, error: memberErr } = await supabase
        .from('members')
        .select('id, full_name, status, phone, gym_id')
        .eq('gym_id', gymId)
        .eq('phone', sanitizedPhone)
        .maybeSingle()

    if (memberErr) {
        console.error('[CheckIn Member Query Error]:', memberErr)
    }

    if (!member) {
        // Backup Check: Sirf Phone number se search karke dekhte hain DB me kya value hai
        const { data: phoneCheck } = await supabase
            .from('members')
            .select('id, gym_id, phone, full_name')
            .ilike('phone', `%${sanitizedPhone.slice(-10)}%`)
        
        console.log(`[CheckIn Fallback Debug] DB records matching last 10 digits:`, phoneCheck)

        return { success: false, message: 'No registered member found with this phone number.' }
    }

    // C. Active/Advance Subscription Validity Check via `subscriptions` table
    const { data: latestSub, error: subErr } = await supabase
        .from('subscriptions')
        .select('end_date, status')
        .eq('gym_id', gymId)
        .eq('member_id', member.id)
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (subErr || !latestSub) {
        return { success: false, message: 'No active subscription plan found.' }
    }

    // Safe Date String Comparison (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0]
    const expiryStr = new Date(latestSub.end_date).toISOString().split('T')[0]

    if (expiryStr < todayStr) {
        return { success: false, message: `Membership expired on ${expiryStr}! Please renew plan.` }
    }

    // D. Duplicate Attendance Check for Today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const { data: existingCheckIn } = await supabase
        .from('attendance')
        .select('id')
        .eq('gym_id', gymId)
        .eq('member_id', member.id)
        .gte('check_in_time', startOfDay.toISOString())
        .maybeSingle()

    if (existingCheckIn) {
        return {
            success: false,
            message: 'Already checked in today!',
            member: { full_name: member.full_name },
        }
    }

    // E. Log Attendance Entry
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

    // 1. Verify Member Status
    const { data: member, error: memberErr } = await supabase
        .from('members')
        .select('id, full_name, status')
        .eq('gym_id', gymId)
        .eq('id', memberId)
        .maybeSingle()

    if (memberErr || !member || member.status !== 'active') {
        return { success: false, message: 'Member not found or inactive.' }
    }

    // 2. Prevent Duplicate Check-in Today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const { data: existingCheckIn } = await supabase
        .from('attendance')
        .select('id')
        .eq('gym_id', gymId)
        .eq('member_id', memberId)
        .gte('created_at', startOfDay.toISOString())
        .maybeSingle()

    if (existingCheckIn) {
        return { success: false, message: `${member.full_name} is already checked in today!` }
    }

    // 3. Record Attendance Log
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

    // revalidatePath('/dashboard/attendance')
    return { success: true, message: `Manual check-in logged for ${member.full_name}` }
}