// Clean phone number to standard wa.me format
export function formatPhoneNumber(phone: string) {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
        return `91${cleaned}`
    }
    return cleaned
}

// 1. Generate wa.me link for Membership Renewal Reminder
export function generateMembershipRenewalReminderLink({
    phone,
    memberName,
    planName,
    expiryDate,
    gymName = 'Gym',
}: {
    phone: string
    memberName: string
    planName: string
    expiryDate: string
    gymName?: string
}) {
    const formattedPhone = formatPhoneNumber(phone)
    const text = `Hi ${memberName}! 👋\n\nYour membership for *${planName}* at *${gymName}* is expiring on *${expiryDate}*.\n\nPlease renew your subscription to continue uninterrupted access.\n\nThank you!`

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
}

// 2. Generate wa.me link for Pending Due Reminder
export function generatePendingDueReminderLink({
    phone,
    memberName,
    dueAmount,
    gymName = 'Gym',
}: {
    phone: string
    memberName: string
    dueAmount: string | number
    gymName?: string
}) {
    const formattedPhone = formatPhoneNumber(phone)
    const text = `Hi ${memberName}! 👋\n\nThis is a gentle reminder regarding your pending balance of *₹${dueAmount}* at *${gymName}*.\n\nKindly clear your due amount at the front desk or via UPI.\n\nThank you!`

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
}

// 3. Generate wa.me link for Payment / Renewal Receipt
export function generatePaymentReceiptLink({
    phone,
    memberName,
    paidAmount,
    planName,
    gymName = 'Gym',
}: {
    phone: string
    memberName: string
    paidAmount: string | number
    planName: string
    gymName?: string
}) {
    const formattedPhone = formatPhoneNumber(phone)
    const text = `Hi ${memberName}! 🎉\n\nWe have received your payment of *₹${paidAmount}* for *${planName}* at *${gymName}*.\n\nThank you!`

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
}

// 4. Generate wa.me link for Registration Receipt
export function generateRegistrationReceiptLink({
    phone,
    memberName,
    paidAmount,
    planName,
    gymName = 'Gym',
}: {
    phone: string
    memberName: string
    paidAmount: string | number
    planName: string
    gymName?: string
}) {
    const formattedPhone = formatPhoneNumber(phone)
    const text = `Hi ${memberName}! 🎉\n\nWelcome aboard! We have received your payment of *₹${paidAmount}* for *${planName}* at *${gymName}*.\n\nThank you for choosing us!`

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
}