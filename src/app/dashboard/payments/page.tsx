import { getPaymentLogs } from "@/app/actions/payments"
import PaymentSort from "@/components/PaymentSort" 

export default async function PaymentsPage() {
    const { data: payments = [], error } = await getPaymentLogs()

    if (error) {
        console.error("Payment logs load error:", error)
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

            <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Payment Logs
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                    Real-time statement of all incoming membership payments.
                </p>
            </div>


            <PaymentSort initialPayments={payments} />
        </div>
    )
}