'use server'

import {createClient} from '@/lib/supabase/server'
import {revalidatePath} from 'next/cache'

const BUCKET_NAME = 'member-photos'
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

function extractStoragePathFromUrl(publicUrl: string | null) {
    if (!publicUrl) return null
    const marker = `/${BUCKET_NAME}/`
    const index = publicUrl.indexOf(marker)
    if (index === -1) return null
    return publicUrl.substring(index + marker.length)
}

export async function uploadGymBranding(formData: FormData) {
    const supabase = await createClient()

    const{ data : { user } } = await supabase.auth.getUser()

    if(!user) {
        throw new Error('User not authenticated')
    }
    
    const kind = formData.get('kind') as 'logo' | 'banner' | null
    const file = formData.get('file') as File | null

    if(!kind || kind !== 'logo' && kind !== 'banner') {
        throw new Error('Invalid branding type')
    }
    if (!file || file.size === 0 || file.name === undefined) {
        throw new Error('Please select a image file to upload')
    }
    if(!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed')
    }
    if (file.size > MAX_SIZE_BYTES) {
        throw new Error('File size exceeds the maximum limit of 2MB')
    }

    // Fetch the logged-in owner's gym and existing URLs
    const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .select('id, logo_url, banner_url')
        .eq('owner_id', user.id)
        .single()

    if(gymError || !gymData) {
        throw new Error('Gym profile not found for the logged-in user')
    }

    // Make a clean path for the new file in the bucket
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filePath = `${gymData.id}/branding/${kind}-${Date.now()}.${fileExtension}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // For testing error 1
    console.log('[uploadGymBranding] debug:', {
        userId: user.id,
        gymId: gymData.id,
        filePath,
        bucket: BUCKET_NAME,
    })

    // for testing error 2
    const { data: sessionData } = await supabase.auth.getSession()
    console.log('[uploadGymBranding] hasSession:', Boolean(sessionData.session), 'accessTokenPresent:', Boolean(sessionData.session?.access_token))

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
        })

    if(uploadError || !uploadData) {
        // for testing error 3
        console.error('[uploadGymBranding] upload failed:', {
            gymId: gymData.id,
            filePath,
            error: uploadError,
        })
        
        return { error: uploadError?.message || 'Failed to upload the image' }
    }

    // Fetch public URL and update gyms table
    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData.path)

    const columnName = kind === 'logo' ? 'logo_url' : 'banner_url'
    const oldUrl = kind === 'logo' ? gymData.logo_url : gymData.banner_url

    const { error: updateError } = await supabase
        .from('gyms')
        .update({ [columnName]: publicUrlData.publicUrl })
        .eq('id', gymData.id)
        .eq('owner_id', user.id)

    if(updateError) {
        return { error: updateError.message }
    }

    // 4. Remove previous branding file (optional: ignore errors so the main update still succeeds)
    const oldFilePath = extractStoragePathFromUrl(oldUrl)
    if (oldFilePath && oldFilePath !== uploadData.path) {
        await supabase.storage.from(BUCKET_NAME).remove([oldFilePath])
    }
    
    revalidatePath('/dashboard',)
    return { publicUrl: publicUrlData.publicUrl, kind }
}

// Deletes the gym branding (logo or banner) for the authenticated user
export async function deleteGymBranding(formData: FormData) {
    const supabase = await createClient()

    const { data : { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'User not authenticated' }
    }

    const kind = formData.get('kind') as 'logo' | 'banner'

    if (kind !== 'logo' && kind !== 'banner') {
        return { error: 'Invalid branding type' }
    }

    const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .select('id, logo_url, banner_url')
        .eq('owner_id', user.id)
        .single()
    
    if (gymError || !gymData) {
        return { error: gymError?.message || 'Gym not found' }
    }

    const columnName = kind === 'logo' ? 'logo_url' : 'banner_url'
    const oldUrl = kind === 'logo' ? gymData.logo_url : gymData.banner_url
    const oldFilePath = extractStoragePathFromUrl(oldUrl)

    if (oldFilePath) {
        const { error: removeError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([oldFilePath])

            if (removeError) {
                return { error: removeError.message || 'Failed to delete image from storage' }
            }
    }

    const { error: updateError } = await supabase
        .from('gyms')
        .update({ [columnName]: null })
        .eq('id', gymData.id)
        .eq('owner_id', user.id)

    if (updateError) {
        return { error: updateError.message }
    }

    revalidatePath('/dashboard')
    return { kind, removed: true }
}