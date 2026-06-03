'use client'

import { useEffect, useState } from 'react'

interface Props {
  /** Set to a fresh value (e.g. Date.now()) to show the reminder; 0 hides it. */
  trigger: number
  message?: string
  durationMs?: number
}

const DEFAULT_MESSAGE = 'Save your changes for them to take effect.'

export default function SaveReminder({ trigger, message = DEFAULT_MESSAGE, durationMs = 4000 }: Props) {
  const [shownTrigger, setShownTrigger] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  // Reset visibility when the trigger changes (render-phase adjustment).
  if (trigger !== shownTrigger) {
    setShownTrigger(trigger)
    setDismissed(false)
  }

  const visible = trigger !== 0 && !dismissed

  useEffect(() => {
    if (trigger === 0) return
    const t = setTimeout(() => setDismissed(true), durationMs)
    return () => clearTimeout(t)
  }, [trigger, durationMs])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg"
    >
      <span aria-hidden="true">💾</span>
      <span>{message}</span>
    </div>
  )
}
