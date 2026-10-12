import Link from 'next/link'
import { MailCheck } from 'lucide-react'

export default function VerifyNoticePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                    <MailCheck className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify your email</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        We have sent a verification link to your email address. Please check your inbox and click the link to activate your gym account.
                    </p>
                </div>

                <div className="pt-2">
                    <Link
                        href="/login"
                        className="inline-block w-full bg-slate-900 dark:bg-emerald-600 text-white font-medium py-2.5 rounded-xl text-sm hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors text-center"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}