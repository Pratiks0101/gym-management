import Link from "next/link";
import { login } from "../auth/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({searchParams}:{
    searchParams: Promise<{ error?: string}>
}) {
    const { error } = await searchParams
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Gym Owner Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                            {error}
                        </div>
                    )}

                    {/* Using Client Form with Loading State */}
                    <LoginForm loginAction={login} />

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary underline font-medium">
                            Sign Up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}