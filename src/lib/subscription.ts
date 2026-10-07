export type MemberStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'

export function getMemberStatus(validTillDateStr: string | null) {
    if(!validTillDateStr) {
        return {
            status: 'EXPIRED' as MemberStatus,
            badgeColor: 'bg-red-100 text-red-800 border-red-200',
            badgeText: 'Expired',
            dayRemaining: 0,
        }
    }

    const today = new Date()
    const validTill = new Date(validTillDateStr)

    today.setHours(0, 0, 0, 0)
    validTill.setHours(0, 0, 0, 0)

    const diffTime = validTill.getTime() - today.getTime()
    const dayRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if(dayRemaining < 0) {
        return {
            status: 'EXPIRED' as MemberStatus,
            badgeColor: 'bg-red-100 text-red-800 border-red-200',
            badgeText: 'Expired',
            dayRemaining: 0,
        }
    }

    if(dayRemaining <= 7) {
        return {
            status: 'EXPIRING_SOON' as MemberStatus,
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
            badgeText: `Expires in ${dayRemaining}d`,
            dayRemaining,
        }
    }

    return {
            status: 'ACTIVE' as MemberStatus,
            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            badgeText: 'Active',
            dayRemaining,
    }
}