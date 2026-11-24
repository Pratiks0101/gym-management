import {createClient} from "@/lib/supabase/server"
import {NextResponse} from "next/server"

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const nextParams = searchParams.get("next") ?? "/reset-password"

    const next = nextParams.startsWith("/") ? nextParams : `/${nextParams}`

    if(code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if(!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('An error occurred during authentication, Please try again with new password reset link.')}`
    )
}