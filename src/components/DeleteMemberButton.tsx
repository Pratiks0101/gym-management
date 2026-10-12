'use client'

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteMembers } from "@/app/actions/members"

type DeleteMemberButtonProps = {
    memberId: string
    memberName: string
}

export function DeleteMemberButton({ memberId, memberName }: DeleteMemberButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        const confirmed = window.confirm(`Are you sure you want to delete ${memberName}? This action cannot be undone.`)
        if (!confirmed) return

        setIsDeleting(true)
        try {
            await deleteMembers(memberId)
        } catch (error: any) {
            alert(error.message || 'Failed to delete member')
            setIsDeleting(false)
        }
    }

    return (
        <form onSubmit={handleDelete}>
            <button 
                type="submit"
                disabled={isDeleting}
                title="Delete Member"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
                {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>
        </form>
    )
}