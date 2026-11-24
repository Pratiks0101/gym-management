import Link from "next/link"
import {getCurrentUserForReset, updatePassword} from "../auth/actions"
import {ResetPasswordForm} from "@/components/auth/ResetPasswordForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ResetPasswordPage() {
    const userEmail = await getCurrentUserForReset()

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        {userEmail 
                            ? `Reset password for ${userEmail}`
                            : "Enter a new password for your account"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!userEmail ? (
                        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                            Invalid or expired password reset link. Please request a new password reset link.
                            <Link 
                                href="/login" 
                                className="text-primary underline font-medium"
                                >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <ResetPasswordForm updatePasswordAction={updatePassword} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}