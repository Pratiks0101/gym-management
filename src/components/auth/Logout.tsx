'use client'

import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { logout } from '@/app/auth/actions'

type LogoutButtonProps = {
    isIconOnly?: boolean
}

export function LogoutButton({isIconOnly = false}: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await logout()
        } catch (error) {
            console.error(error)
            setIsLoading(false)
        }
    }

    if(isIconOnly){
        return (
            <button
                type='button'
                onClick={handleLogout}
                disabled={isLoading}
                title='Sign Out'
                className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors shrink-0 cursor-pointer disabled:opacity-50'
            >
                {isLoading ? (
                    <>
                        <Loader2 className='w-4 h-4 animate-spin text-red-600 dark:text-red-400' />
                    </>
                ) : (
                    <>
                        <LogOut className="w-4 h-4" />
                    </>
                )}
            </button>
        )
    }

    return (
        <button 
            type='button'
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition disabled:opacity-50 cursor-pointer"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Logging out...</span>
                </>
            ) : (
                <>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </>
            )}
        </button>
    )
}