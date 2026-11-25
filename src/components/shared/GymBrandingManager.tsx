'use client'

import React, { useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Crop, Image as ImageIcon, Loader2, Trash2, Upload, X } from 'lucide-react'
import { uploadGymBranding, deleteGymBranding } from '@/app/actions/gym-branding'
import { cropImageToCover } from '@/lib/image-crop'

export type BrandingKind = 'logo' | 'banner'

export type BrandingMenuActions = {
    openLogoPicker: () => void
    openBannerPicker: () => void
    removeLogo: () => Promise<void>
    removeBanner: () => Promise<void>
    isBusy: boolean
    hasLogo: boolean
    hasBanner: boolean
}

type GymBrandingManagerProps = {
    logoUrl?: string | null
    bannerUrl?: string | null
    renderTrigger?: (actions: BrandingMenuActions) => React.ReactNode
}

const MAX_PAYLOAD_BYTES = 850 * 1024 // 850 KB SAFETY NET

const compressImageNative = (file: File, maxDim = 800, quality = 0.75): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img')
        const reader = new FileReader()

        reader.onload = (e) => {
            img.src = e.target?.result as string
        }

        img.onload = () => {
            let width = img.width
            let height = img.height

            if (width > height) {
                if (width > maxDim) {
                    height = Math.round((height * maxDim) / width)
                    width = maxDim
                }
            } else {
                if (height > maxDim) {
                    width = Math.round((width * maxDim) / height)
                    height = maxDim
                }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height)
            }

            const dataUrl = canvas.toDataURL('image/jpeg', quality)

            const arr = dataUrl.split(',')
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
            const bstr = atob(arr[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }

            const blob = new Blob([u8arr], { type: mime })
            const compressedFile = new File(
                [blob],
                `${file.name.replace(/\.[^/.]+$/, "")}_compressed.jpg`,
                { type: 'image/jpeg' }
            )
            resolve(compressedFile)
        }

        img.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
    })
}

async function prepareUploadFile(file: File, maxDim: number, initialQuality: number): Promise<File> {
    if (file.size <= MAX_PAYLOAD_BYTES && file.type.startsWith('image/')) {
        return file
    }

    let processed = await compressImageNative(file, maxDim, initialQuality)
    if (processed.size > MAX_PAYLOAD_BYTES) {
        processed = await compressImageNative(file, Math.min(maxDim, 1024), 0.6)
    }
    return processed
}

export function GymBrandingManager({ logoUrl, bannerUrl, renderTrigger }: GymBrandingManagerProps) {
    const id = useId()
    const logoInputId = `${id}-gym-logo-input`
    const bannerInputId = `${id}-gym-banner-input`
    const router = useRouter()
    const [activeKind, setActiveKind] = useState<'logo' | 'banner' | null>(null)
    const [activeAction, setActiveAction] = useState<'upload' | 'delete' | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    // Pending banner file waiting for cover-crop decision
    const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null)
    const [pendingBannerPreview, setPendingBannerPreview] = useState<string | null>(null)

    const sendBrandingUpload = async (file: File, kind: 'logo' | 'banner') => {
        setErrorMsg(null)
        setActiveKind(kind)
        setActiveAction('upload')

        try {
            const preparedFile = 
                kind === 'logo'
                    ? await prepareUploadFile(file, 600, 0.8)
                    : await prepareUploadFile(file, 1600, 0.78)

            const formData = new FormData()
            formData.append('kind', kind)
            formData.append('file', preparedFile)

            const result = await uploadGymBranding(formData)

            if (result && 'error' in result && result.error) {
                setErrorMsg(result.error)
            } else {
                router.refresh()
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err?.message : 'Failed to upload image')
        } finally {
            setActiveKind(null)
            setActiveAction(null)
        }
    }

    const handleDeleteBranding = async (kind: 'logo' | 'banner') => {
        setErrorMsg(null)
        setActiveKind(kind)
        setActiveAction('delete')

        try {
            const formData = new FormData()
            formData.append('kind', kind)

            const result = await deleteGymBranding(formData)

            if (result && 'error' in result && result.error) {
                setErrorMsg(result.error)
            } else {
                router.refresh()
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err?.message : 'Failed to delete image')
        } finally {
            setActiveKind(null)
            setActiveAction(null)
        }
    }

    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setErrorMsg('Please select a valid image file for the logo.')
            return
        }

        await sendBrandingUpload(file, 'logo')
    }

    const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        console.log("banner file selected:", file)
        e.target.value = ''
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setErrorMsg('Please select a valid image file for the banner.')
            return
        }

        if (pendingBannerPreview) {
            URL.revokeObjectURL(pendingBannerPreview)
        }

        setErrorMsg(null)
        setPendingBannerFile(file)
        const previewUrl = URL.createObjectURL(file)
        console.log("banner preview URL:", previewUrl)
        setPendingBannerPreview(previewUrl)
    }

    const cancelPendingBanner = () => {
        if (pendingBannerPreview) {
            URL.revokeObjectURL(pendingBannerPreview)
        }
        setPendingBannerFile(null)
        setPendingBannerPreview(null)
    }

    const handleConfirmBanner = async (convertToCover: boolean) => {
        if (!pendingBannerFile) return

        let finalFile = pendingBannerFile
        if (convertToCover) {
            try {
                finalFile = await cropImageToCover(pendingBannerFile, 1200, 400, 0.85)
            } catch (err: unknown) {
                setErrorMsg(err instanceof Error ? err.message : 'Failed to crop banner into cover format')
                return
            }
        }

        cancelPendingBanner()
        await sendBrandingUpload(finalFile, 'banner')
    }

    const actions: BrandingMenuActions = {
        openLogoPicker: () => document.getElementById(logoInputId)?.click(),
        openBannerPicker: () => document.getElementById(bannerInputId)?.click(),
        removeLogo: () => handleDeleteBranding('logo'),
        removeBanner: () => handleDeleteBranding('banner'),
        isBusy: activeKind !== null,
        hasLogo: Boolean(logoUrl),
        hasBanner: Boolean(bannerUrl)
    }

    return (
        <>
            <input
                id={logoInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
            />
            <input
                id={bannerInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerSelect}
            />

            {renderTrigger ? (
                renderTrigger(actions)
            ) : (
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        disabled={actions.isBusy}
                        onClick={actions.openLogoPicker}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        {logoUrl ? 'Update Logo' : 'Upload Logo'}
                    </button>

                    {logoUrl && (
                        <button
                            type="button"
                            disabled={actions.isBusy}
                            onClick={actions.removeLogo}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Logo
                        </button>
                    )}

                    <button 
                        type="button"
                        disabled={actions.isBusy}
                        onClick={actions.openBannerPicker}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {bannerUrl ? 'Update Banner' : 'Upload Banner'}
                    </button>

                    {bannerUrl && (
                        <button
                            type='button'
                            disabled={actions.isBusy}
                            onClick={actions.removeBanner}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Banner
                        </button>
                    )}
                </div>
            )}

            {errorMsg && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {errorMsg}
                </p>
            )}

            {/* Banner Cover Conversion Modal */}

            {(() => {
                console.log("modal check:", {
                    hasFile: Boolean(pendingBannerFile),
                    fileName: pendingBannerFile?.name,
                    hasPreview: Boolean(pendingBannerPreview),
                })
                return null
            })()}
            
            {pendingBannerFile && 
                pendingBannerPreview && 
                typeof document !== "undefined" && 
                createPortal(
                <div
                    onClick={cancelPendingBanner}
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Banner Cover Format
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Convert into a wide cover rectangle (3:1) or upload as-it-is.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={cancelPendingBanner}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Live 3:1 Cover Frame Preview */}
                        <div className="relative w-full aspect-3/1 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950">
                            <Image
                                src={pendingBannerPreview}
                                alt="Banner cover preview"
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={cancelPendingBanner}
                                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmBanner(false)}
                                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                Upload Original
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmBanner(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            >
                                <Crop className="w-3.5 h-3.5" />
                                Convert to Cover & Upload
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* {upload/ remove loading overlay} */}
            {activeKind !== null && 
                activeAction !== null &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div 
                        role='status'
                        aria-live='polite'
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
                    >
                        <Loader2 className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400" />
                        <div className='space-y-1'>
                            <p className='text-sm font-bold text-slate-900 dark:text-white'>
                                {activeAction === 'delete'
                                    ? activeKind === 'logo'
                                        ? 'Removing logo...'
                                        : 'Removing banner...'
                                    : activeKind === 'banner'
                                        ? 'Uploading banner...'
                                        : 'Uploading logo...'}
                            </p>

                            <p className='text-xs text-slate-500 dark:text-slate-400'>
                                    {activeAction === 'delete'
                                        ? 'Cleaning up storage and syscing changes, please wait...'
                                        : 'Compressing and syncing with storage, please wait...'}
                            </p>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    )
}