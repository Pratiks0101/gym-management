'use client'

import { deleteMembershipPlan } from "@/app/actions/plans"
import { useState } from "react"
import { Loader2 } from "lucide-react"

type DeletePlanButtonProps = {
    planId: string
    planName: string
}

export function DeletePlanButton({ planId, planName }: DeletePlanButtonProps) {

    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.SubmitEvent) => {
        e.preventDefault()
        const confirmed = window.confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)
        if (!confirmed) return

        setIsDeleting(true)
        try {
            await deleteMembershipPlan(planId)
        } catch (error: any) {
            alert(error.message || 'Failed to delete plan')
            setIsDeleting(false)
        }
    }

    return (
        <form onSubmit={handleDelete}>
            <button
                type="submit"
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 border border-red-200/60 dark:border-red-900/50 rounded-md font-medium cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
                {isDeleting ? (
                    <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                    </>
                ) : (
                    <span>Delete</span>
                )}
            </button>
        </form>
    )
}