'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addMember(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if(!user) throw new Error("Unauthorized")

    // 🟢 1. Parallel fetch: Gym profile & Plan data fetch simultaneously
    const plan_id = formData.get('plan_id') as string
    if (!plan_id) throw new Error("Required fields missing")

    const [gymRes, planRes] = await Promise.all([
        supabase.from('gyms').select('id').eq('owner_id', user.id).single(),
        supabase.from('membership_plans').select('*').eq('id', plan_id).single()
    ])

    const gym = gymRes.data
    const plan = planRes.data

    if(!gym) throw new Error("Gym profile not found")
    if(!plan) throw new Error("Plan not found")

    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string || null
    const gender = formData.get('gender') as string
    const start_date_str = formData.get('start_date') as string
    const avatarFile = formData.get('avatar_file') as File | null
    const discount = Number(formData.get('discount') || 0)
    const amountPaid = Number(formData.get('amount_paid') || 0)
    const paymentMethod = (formData.get('payment_method') as string) || 'cash'

    if (!full_name || !phone) {
        throw new Error("Required fields missing")
    }

    let photo_url: string | null = null

    // 🟢 2. Avatar Upload (Agar file hai toh upload karo)
    if(avatarFile && avatarFile.size > 0 && avatarFile.name !== 'undefined') {
        const fileExt = avatarFile.name.split('.').pop() || 'jpg'
        const fileName = `${gym.id}/${Date.now()}.${fileExt}`
        const arrayBuffer = await avatarFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('member-photos')
            .upload(fileName, buffer, {
                contentType: avatarFile.type || 'image/jpeg',
                cacheControl: '3600',
                upsert: true
            })

        if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase
                .storage
                .from('member-photos')
                .getPublicUrl(uploadData.path)

            photo_url = publicUrlData.publicUrl
        }
    }

    const planPrice = Number(plan.price || 0)
    const finalTotal = Math.max(0, planPrice - discount)
    const dueAmount = Math.max(0, finalTotal - amountPaid)

    let paymentStatus = 'paid'
    if(dueAmount > 0 && amountPaid > 0) {
        paymentStatus = 'partial'
    } else if (dueAmount > 0 && amountPaid === 0) {
        paymentStatus = 'unpaid'
    }

    const startDate = start_date_str ? new Date(start_date_str) : new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + plan.duration_months)

    // Insert Member
    const { data: member, error: memberError } = await supabase
        .from('members')
        .insert({
            gym_id: gym.id,
            full_name,
            phone,
            email,
            gender,
            photo_url,
            status: 'active'
        })
        .select()
        .single()

    if(memberError || !member) {
        console.error("Error adding member:", memberError)
        throw new Error("Failed to create member")
    }

    // Insert Subscription
    const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
            gym_id: gym.id,
            member_id: member.id,
            plan_id: plan.id,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            total_amount: finalTotal,
            amount_paid: amountPaid,
            discount: discount,
            due_amount: dueAmount,
            payment_status: paymentStatus,
            payment_method: paymentMethod,
            status: 'active'
        })
        .select()
        .single()

    if (subError) {
        console.error("Error creating subscription:", subError)
        throw new Error("Failed to create subscription")
    }

    // Insert Payment Log if paid > 0
    if(amountPaid > 0) {
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                gym_id: gym.id,
                member_id: member.id,
                subscription_id: subscription.id,
                amount_paid: amountPaid,
                payment_type: 'registration',
                payment_method: paymentMethod
            })
        
        if(paymentError) {
            console.error("Payment Log Error:", paymentError)
        }
    }

    revalidatePath('/dashboard/members')
    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
}

export async function getMembers(page= 1, pageSize = 30) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return { data: [], error: "Unauthorized" }

    const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if(!gym) return { data: [], error: "Gym not found"}

    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const { data: members, error } = await supabase
        .from('members')
        .select(`
            *,
            subscriptions (
                id,
                start_date,
                end_date,
                total_amount,
                amount_paid,
                due_amount,
                payment_status,
                status,
                created_at,
                membership_plans (
                    plan_name,
                    price,
                    duration_months
                )
            )
        `)
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false })
        .range(start, end)

    if(error) {
        return { data: [], error: error.message}
    }

    const sortedMembers = (members || []).map((member: any) => {
        const subscriptions = member.subscriptions ? [...member.subscriptions] : []
        subscriptions.sort((a: any, b: any) => new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime())
        return { ...member, subscriptions }
    })

    return { data: sortedMembers, error: null }
}

export async function deleteMembers(memberId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) throw new Error("Unauthorized")

    // Fetch photo url
    const { data: member } = await supabase
        .from('members')
        .select('photo_url')
        .eq('id', memberId)
        .single()

    // Delete Photo and Subscriptions in Parallel for Speed
    const deletePromises = []

    if(member?.photo_url) {
        const urlParts = member.photo_url.split('/member-photos/')
        if(urlParts.length > 1) {
            deletePromises.push(supabase.storage.from('member-photos').remove([urlParts[1]]))
        }
    }

    deletePromises.push(supabase.from('subscriptions').delete().eq('member_id', memberId))

    await Promise.all(deletePromises)

    // Finally delete member
    const { error: memberError } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

    if(memberError) throw new Error("Failed to delete member")

    revalidatePath('/dashboard/members')
    revalidatePath('/dashboard')
}

export async function renewMemberSubscription(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: gym } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if(!gym?.id) throw new Error("Gym account not found.")

    const memberId = formData.get('member_id') as string
    const planId = formData.get('plan_id') as string
    const startDate = formData.get('start_date') as string
    const durationMonths = Number(formData.get('duration_months') || 1)
    const totalAmount = Number(formData.get('total_amount'))
    const discount = Number(formData.get('discount') || 0)
    const amountPaid = Number(formData.get('amount_paid'))
    const paymentMethod = formData.get('payment_method') as string

    const finalPlanPrice = totalAmount - discount
    const dueAmount = Math.max(0, finalPlanPrice - amountPaid)

    let paymentStatus = 'paid'
    if(dueAmount > 0 && amountPaid > 0) {
        paymentStatus = 'partial'
    } else if (dueAmount > 0 && amountPaid === 0) {
        paymentStatus = 'unpaid'
    }

    const { data: latestSub } = await supabase
        .from('subscriptions')
        .select('end_date')
        .eq('member_id', memberId)
        .order('end_date', { ascending: false})
        .limit(1)
        .maybeSingle()

    let effectiveStartDate = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if(latestSub?.end_date) {
        const currentEndDate = new Date(latestSub.end_date)
        if(currentEndDate >= today) {
            effectiveStartDate = new Date(currentEndDate)
            effectiveStartDate.setDate(effectiveStartDate.getDate() + 1)
        }
    }

    const yyyy = effectiveStartDate.getFullYear()
    const mm = String(effectiveStartDate.getMonth() + 1).padStart(2, '0')
    const dd = String(effectiveStartDate.getDate()).padStart(2, '0')
    const start = `${yyyy}-${mm}-${dd}`

    const endDateObj = new Date(effectiveStartDate)
    endDateObj.setMonth(endDateObj.getMonth() + durationMonths)
    const endYyyy = endDateObj.getFullYear()
    const endMm = String(endDateObj.getMonth() + 1).padStart(2, '0')
    const endDd = String(endDateObj.getDate()).padStart(2, '0')
    const endDate = `${endYyyy}-${endMm}-${endDd}`

    // Expire old active sub and insert new sub
    await supabase
        .from('subscriptions')
        .update({status: 'expired'})
        .eq('member_id', memberId)
        .eq('gym_id', gym.id)
        .eq('status', 'active')

    const {data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
                gym_id: gym.id,
                member_id: memberId,
                plan_id: planId,
                start_date: start,
                end_date: endDate,
                total_amount: finalPlanPrice,
                amount_paid: amountPaid,
                due_amount: dueAmount,
                discount: discount,
                payment_status: paymentStatus,
                payment_method: paymentMethod,
                status: 'active'
        })
        .select()
        .single()

    if (subError) throw new Error("Failed to renew subscription")

    if(amountPaid > 0) {
        await supabase
            .from('payments')
            .insert({
                gym_id: gym.id,
                member_id: memberId,
                subscription_id: subscription.id,
                amount_paid: amountPaid,
                payment_type: 'renewal',
                payment_method: paymentMethod
            })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/members')
    revalidatePath('/dashboard/payments')
    return {success: true}
}

export async function clearMemberDue(formData: FormData) {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()
    if(!user) throw new Error("Unauthorized")

    const {data: gym} = await supabase.from('gyms').select('id').eq('owner_id', user.id).single()
    if(!gym) throw new Error("Gym not found")

    const subscriptionId = formData.get('subscription_id') as string
    const memberId = formData.get('member_id') as string
    const amountPaying = Number(formData.get('amount_paid') || 0)
    const paymentMethod = ((formData.get('payment_method') as string) || 'upi').toLowerCase()

    const {data: sub} = await supabase.from('subscriptions').select('*').eq('id', subscriptionId).single()
    if(!sub) throw new Error("Subscription not found")

    const currentDue = Number(sub.due_amount || 0)
    const currentPaid = Number(sub.amount_paid || 0)

    const payAmount = amountPaying > 0 ? amountPaying : currentDue
    const newDue = Math.max(0, currentDue - payAmount)
    const newPaid = currentPaid + payAmount
    const newPaymentStatus = newDue === 0 ? 'paid' : 'partial'

    await supabase
        .from('subscriptions')
        .update({
            due_amount: newDue,
            amount_paid: newPaid,
            payment_status: newPaymentStatus,
            payment_method: paymentMethod
        })
        .eq('id', subscriptionId)

    if(payAmount > 0) {
        await supabase
            .from('payments')
            .insert({
                gym_id: gym.id,
                member_id: memberId,
                subscription_id: subscriptionId,
                amount_paid: payAmount,
                payment_type: 'due_clear',
                payment_method: paymentMethod
            })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/members')
    revalidatePath('/dashboard/payments')
    return { success: true }
}

export async function updateMember(memberId: string, formData: FormData) {
    const supabase = await createClient()
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string

    const {error} = await supabase
        .from('members')
        .update({full_name: fullName, phone: phone})
        .eq('id', memberId)

    if(error) throw new Error(error.message)

    revalidatePath('/dashboard/members')
}