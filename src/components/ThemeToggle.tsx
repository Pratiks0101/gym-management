'use client'

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"

export function ThemeToggle() {
    const {theme, setTheme} = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="w-9 h-9 rounded-lg">
                <Sun className="w-4 h-4" />
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="w-9 h-9 rounded-lg border-slate-200 dark:border-slate-800"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400 transition-all" />
            ): (
                <Moon className="h-4 w-4 text-slate-700 transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}