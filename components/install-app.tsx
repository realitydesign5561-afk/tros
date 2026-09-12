'use client'

import { Download, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

export function InstallApp() {
  const [event, setEvent] = useState<Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> } | null>(null)
  const [installed, setInstalled] = useState(false)
  useEffect(() => {
    const onInstall = (value: Event) => { value.preventDefault(); setEvent(value as typeof event) }
    window.addEventListener('beforeinstallprompt', onInstall)
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)
    return () => window.removeEventListener('beforeinstallprompt', onInstall)
  }, [])
  async function install() { if (event?.prompt) { await event.prompt(); setEvent(null) } else window.alert('Open your browser menu and choose “Install app” or “Add to Home Screen”.') }
  if (installed) return null
  return <button type="button" onClick={install} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"><Download className="size-3.5" /><span className="hidden sm:inline">Install app</span><Smartphone className="size-3.5 sm:hidden" /></button>
}
