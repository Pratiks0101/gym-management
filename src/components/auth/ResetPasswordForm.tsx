'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

type UpdateResult = {
    error?: string
} | void

type ResetPasswordFormProps = {
    updatePasswordAction: (newPassword: string) => Promise<UpdateResult>
}

export function ResetPasswordForm({ updatePasswordAction }: ResetPasswordFormProps) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        if (newPassword.trim().length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        if(newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        setIsUpdating(true)

        try {
            const result = await updatePasswordAction(newPassword)
            if(result?.error) {
                setError(result.error)
                setIsUpdating(false)
            }
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'digest' in err &&
                typeof err.digest === 'string' &&
                err.digest.includes('NEXT_REDIRECT')
            ) {
                throw err
        }
        console.error('Error updating password:', err)
        setError('An error occurred while updating the password.')
        setIsUpdating(false)
    }
}

return (
    <form key="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
        </div>

        {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
        )}
        
        <Button 
            type="submit" 
            disabled={isUpdating}
            className="w-full mt-2 cursor-pointer flex items-center justify-center gap-2"
        >
            {isUpdating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                </>
            ) : (
                <span>Update Password</span>
            )}
        </Button>
    </form>
)
}