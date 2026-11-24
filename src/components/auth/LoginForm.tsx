'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

type ResetResult = {
    error?: string
    success?: string
    message?: string
}

type LoginFormProps = {
    loginAction: (formData: FormData) => Promise<any>
    requestPasswordResetAction?: (email:string) => Promise<ResetResult>
}

export function LoginForm({ loginAction, requestPasswordResetAction }: LoginFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isForgetPasswordMode, setIsForgetPasswordMode] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetMessage, setResetMessage] = useState('')
    const [resetError, setResetError] = useState('')
    const [isSendingResetEmail, setIsSendingResetEmail] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        try {
            await loginAction(formData)
        } catch (error) {
            console.error(error)
            setIsLoading(false)
        }
    }

    const handlePasswordReset = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setResetMessage('')
        setResetError('')

        if(!requestPasswordResetAction) {
            setResetError('Password reset action is not available.')
            setIsSendingResetEmail(false)
            return
        }

        setIsSendingResetEmail(true)

        try {
            const result =await requestPasswordResetAction?.(resetEmail)
            if(result?.error) {
                setResetError(result.error)
            } else if (result?.success) {
                setResetMessage(result.success)
            } else if (result?.message) {
                setResetMessage(result.message)
            } 
        } catch (error) {
            console.error(error)
            setResetError('An error occurred while requesting password reset.')
        } finally {
            setIsSendingResetEmail(false)
        }
    }

    if (isForgetPasswordMode) {
        return (
            <form key="forget-password-form" onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="resetEmail">Registered Email</Label>
                    <Input 
                        id="resetEmail"
                        name="resetEmail"
                        type="email"
                        placeholder="Enter your registered email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required 
                    />
                </div>
                {resetError && (
                    <p className="text-sm text-destructive">{resetError}</p>
                )}
                {resetMessage && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">{resetMessage}</p>
                )}

                <Button
                    type="submit"
                    disabled={isSendingResetEmail}
                    className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2"
                >
                    {isSendingResetEmail ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending Reset Email...</span>
                        </>
                    ) : (
                        <span>Send Reset Email</span>
                    )}
                    </Button>

                    <button
                        type="button"
                        onClick={() => {
                            setIsForgetPasswordMode(false)
                            setResetEmail('')
                            setResetMessage('')
                            setResetError('')
                        }}
                        className="w-full mt-2 text-sm text-primary underline cursor-pointer"
                    >
                        Back to Login
                    </button>
            </form>
        )
    }

    return (
        <form key="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="xyz@email.com"
                    required
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <button
                        type="button"
                        onClick={() => {
                            setIsForgetPasswordMode(true)
                            setResetError('')
                            setResetMessage('')
                        }}
                        className="text-sm text-primary underline cursor-pointer"
                    >
                        Forgot Password?
                    </button>
                </div>
                <Input 
                    id="password"
                    name="password"
                    type="password"
                    required
                />
            </div>

            <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                    </>
                ) : (
                    <span>Sign In</span>
                )}
            </Button>
        </form>
    )
}