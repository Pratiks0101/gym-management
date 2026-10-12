'use client'

import React, { useRef, useState } from "react"
import { Camera, Upload, X, User } from "lucide-react"
import Image from "next/image"

type PhotoUploadProps = {
    onImageSelected: (file: File | null) => void
}

export default function PhotoUpload({ onImageSelected }: PhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const compressed = await compressImageNative(file, 800, 0.75)

            if (compressed.size > 300 * 1024) {
                alert('Image size is too large even after compression. Please select a smaller photo')
                return
            }

            console.log(`Original Size: ${(file.size / 1024).toFixed(1)} KB`)
            console.log(`Compressed Size: ${(compressed.size / 1024).toFixed(1)} KB`)

            const previewUrl = URL.createObjectURL(compressed)
            setPreview(previewUrl)
            onImageSelected(compressed)
        } catch (error) {
            console.error('Image Processing failed:', error)
            alert('Failed to process image. Please try another file.')
        }
    }

    const startCamera = async () => {

        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
            alert('Camera App is not supported on this browser.')
            return
        }
        try {

            const devices = await navigator.mediaDevices.enumerateDevices()
            const hasCamera = devices.some((device) => device.kind === 'videoinput')

            if(!hasCamera) {
                alert("No Camera detected on this device. Please use Upload File instead.")
                return
            }

            setIsCameraActive(true)

            const stream = await navigator.mediaDevices.getUserMedia({video: true})
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (err: any) {
            console.error(err)
            alert('Camera access denied or not available.')
            setIsCameraActive(false)
        }
    }

    const capturePhoto = async () => {
        if (!videoRef.current) return

        const video = videoRef.current
        const canvas = document.createElement('canvas')
        const size = Math.min(video.videoWidth || 640, video.videoHeight || 480)

        canvas.width = 600
        canvas.height = 600
        const ctx = canvas.getContext('2d')

        if (ctx) {
            const startX = (video.videoWidth - size) / 2
            const startY = (video.videoHeight - size) / 2
            ctx.drawImage(video, startX, startY, size, size, 0, 0, 600, 600)
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        const arr = dataUrl.split(',')
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }

        const blob = new Blob([u8arr], { type: mime })

        const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : Math.random().toString(36).substring(2)
        const file = new File([blob], `capture_${uniqueId}.jpg`, { type: 'image/jpeg' })

        setPreview(URL.createObjectURL(file))
        onImageSelected(file)
        stopCamera()
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
        setIsCameraActive(false)
    }

    const clearPhoto = () => {
        setPreview(null)
        onImageSelected(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="space-y-3">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Member Photo (Optional)
            </label>

            <div className="flex items-center gap-4">
                {/* Photo Circle Avatar / Preview */}
                <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                    {preview ? ( 
                        <Image 
                            src={preview} 
                            alt="Member preview" 
                            fill
                            className="object-cover" 
                        />
                    ) : ( 
                        <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    )}
                </div>

                {/* Upload & Camera Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer shadow-sm"
                    >
                        <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        Upload File
                    </button>

                    <button 
                        type="button"
                        onClick={startCamera}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer shadow-sm"
                    >
                        <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        Take a Photo
                    </button>

                    {preview && (
                        <button
                            type="button"
                            onClick={clearPhoto}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            Remove
                        </button>
                    )}
                </div>
            </div>

            <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
            />

            {/* Camera Capture Modal */}
            {isCameraActive && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl max-w-md w-full space-y-4 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                            Capture Member Photo
                        </h3>
                        
                        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center border border-slate-800">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={stopCamera}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                            >
                                Capture
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}