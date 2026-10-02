import Link from "next/link";
import { signup } from "../auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignUpPage({searchParams}:{
    searchParams: Promise<{error?: string}>
}) {
    const { error } = await searchParams

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Create Gym Account</CardTitle>
                    <CardDescription>
                        Enter your details below to set up your Gym 💪
                    </CardDescription>                    
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                            {error}
                        </div>
                    )}

                    <form action={signup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="gymName">Gym Name</Label>
                            <Input
                                id="gymName"
                                name="gymName"
                                type="text"
                                placeholder="Gym Name"
                                required
                            />
                        </div>

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
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full mt-2 cursor-pointer">
                            Register Gym
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary underline font-medium">
                            Log in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}