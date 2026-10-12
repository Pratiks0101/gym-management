'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

type SignUpFormProps = {
    signupAction: (formData: FormData) => Promise<any>
}

export function SignUpForm({ signupAction }: SignUpFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        try {
            await signupAction(formData)
        } catch (error) {
            console.error(error)
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="gymName">Gym Name</Label>
                <Input
                    id="gymName"
                    name="gymName"
                    type="text"
                    placeholder="Fitness Hub"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
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
                    minLength={6}
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
                        <span>Setting up Gym...</span>
                    </>
                ) : (
                    <span>Register Gym</span>
                )}
            </Button>
        </form>
    )
}