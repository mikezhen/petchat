import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface LeaveGuard {
  /** Whether the in-app "unsaved changes" modal is open. */
  promptOpen: boolean
  /** Call from a back/exit control: opens the modal if dirty, otherwise navigates. */
  requestLeave: () => void
  /** Confirm leaving — navigates to the target, discarding changes. */
  confirmLeave: () => void
  /** Dismiss the modal and stay on the page. */
  cancelLeave: () => void
}

/**
 * Guards a dirty form against accidental loss of changes.
 *
 * - Attaches a native `beforeunload` listener while dirty (the only option for
 *   tab close / refresh — browsers don't allow custom UI there).
 * - Provides state + handlers to drive a custom in-app modal for client-side
 *   navigation (e.g. a back button), so in-app exits stay on-brand.
 */
export function useUnsavedChanges(isDirty: boolean, target = '/dashboard'): LeaveGuard {
  const router = useRouter()
  const [promptOpen, setPromptOpen] = useState(false)

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' // required for Chrome to show the prompt
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const requestLeave = useCallback(() => {
    if (isDirty) setPromptOpen(true)
    else router.push(target)
  }, [isDirty, router, target])

  const confirmLeave = useCallback(() => {
    setPromptOpen(false)
    router.push(target)
  }, [router, target])

  const cancelLeave = useCallback(() => setPromptOpen(false), [])

  return { promptOpen, requestLeave, confirmLeave, cancelLeave }
}
