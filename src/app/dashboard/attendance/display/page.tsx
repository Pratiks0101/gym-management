'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import { generateDeskToken } from "@/app/actions/attendance"
import { createClient } from "@/lib/supabase/client"
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react"

export default function DeskDisplayPage() {
    const [gymId, setGymId] = useState<string | null>(null)
    const [loadingGym, setLoadingGym] = useState(true)
    const [token, setToken] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState(10)
    const [lastScannedMember, setLastScannedMember] = useState<{
        name: string
        status: string
        validTill: string
    } | null>(null)

    const audioRef = useRef<HTMLAudioElement | null>(null)


    useEffect(() => {
        async function fetchActiveGym() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {

                    const { data: gymProfile } = await supabase
                        .from('gyms')
                        .select('id')
                        .eq('owner_id', user.id)
                        .single()

                    if (gymProfile) {
                        setGymId(gymProfile.id)
                    }
                }
            } catch (err) {
                console.error('Error fetching gym profile:', err)
            } finally {
                setLoadingGym(false)
            }
        }
        fetchActiveGym()
    }, [])


    const refreshToken = useCallback(async () => {
        if (!gymId) return
        try {
            const res = await generateDeskToken(gymId)
            if (res?.success && res?.token) {
                setToken(res.token)
                setTimeLeft(10)
            }
        } catch (err) {
            console.error('Error refreshing token:', err)
        }
    }, [gymId])

    useEffect(() => {
        if (gymId) {
            refreshToken()
        }
    }, [gymId, refreshToken])


    useEffect(() => {
        if (!gymId) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setTimeout(() => {
                        refreshToken()
                    }, 0)
                    return 10
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [gymId, refreshToken])


    useEffect(() => {
        if (!gymId) return

        const supabase = createClient()
        const channel = supabase
            .channel('desk-display-attendance')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'attendance',
                    filter: `gym_id=eq.${gymId}`,
                },
                async (payload) => {
                    const { data: member } = await supabase
                        .from('members')
                        .select('full_name, membership_end_date, status')
                        .eq('id', payload.new.member_id)
                        .single()

                    if (member) {
                        setLastScannedMember({
                            name: member.full_name,
                            status: member.status,
                            validTill: member.membership_end_date,
                        })

                        if (audioRef.current) {
                            audioRef.current.play().catch(() => {})
                        }

                        setTimeout(() => {
                            setLastScannedMember(null)
                        }, 4000)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [gymId])

    const checkInUrl = token && gymId 
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gym.app'}/checkin?token=${token}&gym=${gymId}`
        : ''

    if (loadingGym) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
                <RefreshCw className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
                <p className="text-sm text-slate-400">Loading Kiosk Screen...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-hidden font-sans">
            <audio ref={audioRef} src="/sounds/beep.mp3" preload="auto" />

            <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                        <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                            Gym Attendance
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-400">Scan QR via phone camera</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Kiosk</span>
                </div>
            </div>

            <div className="my-auto py-6 flex flex-col items-center justify-center w-full max-w-xs sm:max-w-sm">
                <div className="relative p-5 sm:p-6 bg-white rounded-3xl shadow-2xl border-4 border-indigo-500/20 flex flex-col items-center">
                    {checkInUrl ? (
                        <QRCodeSVG 
                            value={checkInUrl}
                            size={220}
                            level="H"
                        />
                    ) : (
                        <div className="w-55 h-55 flex items-center justify-center text-slate-400">
                            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    )}

                    <div className="w-full mt-4 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className="bg-indigo-600 h-full transition-all duration-1000 ease-linear"
                            style={{ width: `${(timeLeft / 10) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Code rotates every {timeLeft}s</span>
                </div>
            </div>

            <div className="w-full max-w-sm sm:max-w-md text-center border-t border-slate-800/80 pt-4 pb-2">
                <p className="text-xs sm:text-sm font-medium text-slate-300">
                    Open Camera App → Point at screen → Tap Link
                </p>
                <p className="text-[11px] text-slate-500 mt-1">No separate mobile app needed</p>
            </div>

            {lastScannedMember && (
                <div className="absolute inset-x-4 top-20 sm:top-24 max-w-sm mx-auto bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl border border-emerald-400 animate-in fade-in slide-in-from-top-5 duration-300 flex items-center gap-3.5 z-50">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold">
                            Check-in Successful
                        </p>
                        <h3 className="text-base font-bold truncate">{lastScannedMember.name}</h3>
                        <p className="text-xs text-emerald-100">
                            Status: <span className="capitalize font-semibold">{lastScannedMember.status}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}