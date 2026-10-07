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
    const avatarFile = formData.get('avatar_file') as File | null
    const discount = Number(formData.get('discount') || 0)
    const amountPaid = Number(formData.get('amount_paid') || 0)
    const paymentMethod = (formData.get('payment_method') as string) || 'cash'

    if (!full_name || !phone || !plan_id) {
        throw new Error("Required fields missing")
    }

    let photo_url: string | null = null

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
        } else {
            console.error('Storage Upload Error:', uploadError)
        }
    }

    const { data: plan } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('id', plan_id)
        .single()

    if(!plan) throw new Error("Plan not found")

    const planPrice = Number(plan.price|| 0)
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

    const {data: subscription, error: subError} = await supabase
        .from('subscriptions')
        .insert({
            gym_id: gym.id,
            member_id: member.id,
            plan_id: plan.id,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            total_amount: finalTotal,
            amount_paid: amountPaid,
            discount:discount,
            due_amount:dueAmount,
            payment_status: paymentStatus,
            payment_method: paymentMethod,
            status: 'active'
        })
        .select()
        .single()

    if (subError) {
        console.error("Error creating subscriptionL", subError)
        throw new Error("Failed to create subscription")
    }

    if(amountPaid > 0) {
        const {error: paymentError} = await supabase
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
            throw new Error("Failed to log payment")
        }
    }

    revalidatePath('/dashboard/members')
    revalidatePath('/dashboard/payments')
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

    if(error) {
        console.error("Error Fetching members:", error)
        return { data: [], error: error.message}
    }

    const sortedMembers = (members || []).map((member: any) => {
        const subscriptions = member.subscriptions ? [...member.subscriptions] : []
        // if(member.subscriptions && member.subscriptions.length > 0) {
            subscriptions.sort((a: any, b: any) => new Date(b.created_at || b.start_date).getTime() - new Date(a.created_at || a.start_date).getTime())
        // }
        return {
            ...member,
            subscriptions
        }
    })

    return { data: sortedMembers, error: null }
}

export async function deleteMembers(memberId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) throw new Error("Unauthorized")

    const { data: member} = await supabase
        .from('members')
        .select('photo_url')
        .eq('id', memberId)
        .single()

    if(member?.photo_url) {
        const urlParts = member.photo_url.split('/member-photos/')
        if(urlParts.length > 1) {
            const filePath = urlParts[1]

            const { error: storageError } = await supabase
                .storage
                .from('member-photos')
                .remove([filePath])

            if(storageError) {
                console.error("Error deleting member photo from storage:", storageError.message)
            }
        }
    }

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

export async function renewMemberSubscription(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if(gymError || !gym?.id) {
        console.error("Gym profile not found for user:", gymError)
        throw new Error("Gym account not found. Cannot Proceed.")
    }

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

    if (subError) {
        console.error("Error creating subscription:", subError)
        throw new Error("Failed to renew subscription")
    }

    if(amountPaid > 0) {
        const {error: paymentError} = await supabase
            .from('payments')
            .insert({
                gym_id: gym.id,
                member_id: memberId,
                subscription_id: subscription.id,
                amount_paid: amountPaid,
                payment_type: 'renewal',
                payment_method: paymentMethod
            })

        if(paymentError){
            console.error("Renewal payment log Error:", paymentError)
            throw new Error("Renewal Payment log failed.")
        }
    }

    revalidatePath('/dashboard/members')
    revalidatePath('/dashboard/payments')
    return {success: true}
}

export async function clearMemberDue(formData: FormData) {
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()
    if(!user) throw new Error("Unauthorized")

    const {data: gym} = await supabase
        .from('gyms')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if(!gym) throw new Error("Gym not found")

    const subscriptionId = formData.get('subscription_id') as string
    const memberId = formData.get('member_id') as string
    const amountPaying = Number(formData.get('amount_paid') || 0)
    const paymentMethod = (formData.get('payment_method') as string) || 'upi'

    if(!subscriptionId || !memberId) {
        throw new Error("Missing required parameters for clearing due")
    }

    const {data: sub} = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single()

    if(!sub) throw new Error("Subscription not found")

    const currentDue = Number(sub.due_amount || 0)
    const currentPaid = Number(sub.amount_paid || 0)

    const payAmount = amountPaying > 0 ? amountPaying : currentDue
    const newDue = Math.max(0, currentDue - payAmount)
    const newPaid = currentPaid + payAmount
    const newPaymentStatus = newDue === 0 ? 'paid' : 'partial'

    const { error: subUpdateError } = await supabase
        .from('subscriptions')
        .update({
            due_amount: newDue,
            amount_paid: newPaid,
            payment_status: newPaymentStatus,
            payment_method: paymentMethod
        })
        .eq('id', subscriptionId)

    if (subUpdateError) {
        console.error("Error clearing due:", subUpdateError)
        throw new Error("Failed to clear due amount")
    }

    if(payAmount > 0) {
        const {error: paymentError} = await supabase
            .from('payments')
            .insert({
                gym_id: gym.id,
                member_id: memberId,
                subscription_id: subscriptionId,
                amount_paid: payAmount,
                payment_type: 'due_clear',
                payment_method: paymentMethod
            })
        
            if(paymentError) {
                console.error("Due clear payment log error:", paymentError)
                throw new Error("Failed to log due clear payment.")
            }
    }

    revalidatePath('/dashboard/members')
    revalidatePath('/dashboard/payments')
    return { success: true }
}