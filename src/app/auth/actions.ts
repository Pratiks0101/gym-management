'use server'

import { revalidatePath } from "next/cache"
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