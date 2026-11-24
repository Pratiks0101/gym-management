'use server'

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')

}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const gymName = formData.get('gymName') as string
    const phone = formData.get('phone') as string

    // Pass gym name in raw_user_meta_data for the DB Trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options : {
            data: {
                gym_name: gymName,
                email: email,
                phone: phone,
            }
        }
    })

    if(authError || !authData.user) {
        return redirect(`/signup?error=${encodeURIComponent(authError?.message ||'signup failed')}`)
    }

    if(!authData.session) {
        return redirect('/signup/verify-notice')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()

    const {error} = await supabase.auth.signOut()

    if(error) {
        console.error('Logout error:', error.message)
        throw new Error('Failed to logout')
    }

    revalidatePath('/', 'layout')
    revalidatePath('/login')
}

export async function requestPasswordReset(email: string) {
    const supabase = await createClient()
    const cleanEmail = email?.trim()

    if (!cleanEmail) {
        throw new Error('Email is required')
    }

    const headerList = await headers()
    const origin = headerList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || "https://gym-management-dun-delta.vercel.app" || "http://localhost:3000"

    const {error} = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
    })
    
    if (error) {
        console.error('Password reset request error:', error.message)
        throw new Error('Failed to request password reset')
    }
    return { message: 'Password reset email sent successfully' }
}

export async function updatePassword(newPassword: string) {
    const supabase = await createClient()

    if(!newPassword || newPassword.trim() === '' || newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters long' }
    }

    const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/login?reset=success')
}

export async function getCurrentUserForReset() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
        throw new Error('Failed to get current user')
    }

    return data.user.email ?? ''
}