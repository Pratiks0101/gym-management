'use client'

import { useEffect } from "react"
import { X } from "lucide-react"
import Image from "next/image"

type ImagePreviewModalProps = {
    imageUrl: string | null
    title: string
    subtitle?: string
    onClose: () => void
}

export function ImagePreviewModal({ imageUrl, title, subtitle, onClose }: ImagePreviewModalProps) {
    useEffect(() => {
        if (!imageUrl) {
            onClose()
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () =>  window.removeEventListener('keydown', handleKeyDown)
        }, [imageUrl, onClose])

        if (!imageUrl) return null

        return (
            <div
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-h-full w-full max-w-3xl overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-950 shadow-lg animate-in zoom-in duration-150"
                >
                    {/* {Header} */}
                    <div className="flex items-center justify-between gap-4 px-5 py-2.5 border-b border-slate-200 dark:border-slate-800">
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{title}</h3>
                            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close preview"
                            className="rounded-l p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* {Image Body} */}
                    <div className="p-4 sm:p-6 bg-sky-950/50 flex items-center justify-center max-h-[80vh] overflow-hidden">
                        <Image
                            src={imageUrl}
                            alt={title}
                            width={1200}
                            height={800}
                            className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-md"
                        />
                    </div>
                </div>
            </div>
        )
}