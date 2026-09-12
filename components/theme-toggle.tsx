'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(true)
  useEffect(() => {
    const saved = window.localStorage.getItem('tros-theme')
    const nextDark = saved ? saved === 'dark' : true
    setDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
    document.documentElement.classList.toggle('light', !nextDark)
  }, [])
  function toggle() {
    const nextDark = !dark
    setDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
    document.documentElement.classList.toggle('light', !nextDark)
    window.localStorage.setItem('tros-theme', nextDark ? 'dark' : 'light')
  }
  return <button type="button" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to night mode'} className="flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
}
