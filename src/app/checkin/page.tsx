'use client'

import { useState, useEffect } from "react"
import { processMemberCheckIn } from "@/app/actions/attendance"
import { CheckCircle2, XCircle, Loader2, Dumbbell, Phone } from "lucide-react"

export default function MobileCheckInPage() {
    const [token, setToken] = useState<string | null>(null)
    const [gymId, setGymId] = useState<string | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    const [phone, setPhone] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')
    const [memberName, setMemberName] = useState('')

    // Read URL params ONCE directly from window.location on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            setToken(urlParams.get('token'))
            setGymId(urlParams.get('gym'))
            setIsLoaded(true)
        }
    }, [])

    async function handleCheckIn(e: React.FormEvent) { // ✅ Fixed Event Type
        e.preventDefault()
        e.stopPropagation()

        const cleanPhone = phone.trim()

        if (!token || !gymId) {
            setStatus('error')
            setMessage('Invalid or missing QR link parameters. Please rescan the QR code.')
            return
        }

        if (cleanPhone.length !== 10) {
            setStatus('error')
            setMessage('Please enter a valid 10-digit phone number.')
            return
        }

        setStatus('loading')
        setMessage('Verifying membership...')

        try {
            const res = await processMemberCheckIn({
                gymId,
                phone: cleanPhone,
                token,
            })

            if (res.success) {
                setStatus('success')
                setMessage(res.message || 'Check-in successful!')
                setMemberName(res.member?.full_name || '')
            } else {
                setStatus('error')
                setMessage(res.message || 'Check-in failed!')
            }
        } catch (err) {
            console.error('Check-in error:', err)
            setStatus('error')
            setMessage('Something went wrong. Please try again.')
        }
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        )
    }

    if (!token || !gymId) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center font-sans">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm">
                    <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold">Invalid QR Code</h2>
                    <p className="text-xs text-slate-400 mt-2">Please scan the active live QR code from the gym screen again.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
                <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/30">
                    <Dumbbell className="w-8 h-8" />
                </div>

                <h1 className="text-xl font-bold tracking-tight text-white mb-1">Gym Express Check-in</h1>
                <p className="text-xs text-slate-400 mb-6">Enter your registered mobile number to log attendance</p>

                {(status === 'idle' || status === 'loading') && (
                    <form onSubmit={handleCheckIn} className="w-full flex flex-col gap-4">
                        <div className="relative w-full">
                            <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input 
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={10}
                                placeholder="Enter 10-digit Phone"
                                value={phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    if (val.length <= 10) setPhone(val)
                                }}
                                disabled={status === 'loading'}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || phone.length !== 10}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium py-3 rounded-2xl text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <span>Mark Attendance</span>
                            )}
                        </button>
                    </form>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center my-4 animate-in zoom-in-95 duration-300">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full mb-3 border border-emerald-500/30">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-xl font-bold text-emerald-400">Welcome!</h2>
                        {memberName && <p className="text-base font-semibold text-white mt-1">{memberName}</p>}
                        <p className="text-xs text-slate-300 mt-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                            {message}
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center my-4 animate-in zoom-in-95 duration-300 w-full">
                        <div className="p-3 bg-rose-500/20 text-rose-400 rounded-full mb-3 border border-rose-500/30">
                            <XCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-lg font-bold text-rose-400">Check-in Failed</h2>
                        <p className="text-xs text-slate-300 my-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 w-full">
                            {message}
                        </p>
                        <button
                            type="button"
                            onClick={() => setStatus('idle')}
                            className="text-xs text-indigo-400 underline hover:text-indigo-300 mt-1"
                        >
                            Try again with different number
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}