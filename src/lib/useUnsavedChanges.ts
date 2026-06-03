import { useEffect } from 'react'

export const DISCARD_MESSAGE = 'You have unsaved changes. Leave without saving?'

/**
 * Warn via the native browser dialog when the user tries to close, refresh, or
 * navigate the tab away while there are unsaved changes. The listener is only
 * attached while `isDirty` is true, so it has no effect on a clean form.
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' // required for Chrome to show the prompt
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}

/**
 * Guard for in-app navigation (e.g. a back button). Returns true when it's safe
 * to leave — either the form is clean, or the user confirmed discarding changes.
 */
export function confirmDiscardIfDirty(isDirty: boolean): boolean {
  return !isDirty || window.confirm(DISCARD_MESSAGE)
}
