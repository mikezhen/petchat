import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUnsavedChanges, confirmDiscardIfDirty } from '@/lib/useUnsavedChanges'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('confirmDiscardIfDirty', () => {
  it('returns true without prompting when the form is clean', () => {
    const confirmSpy = vi.spyOn(window, 'confirm')
    expect(confirmDiscardIfDirty(false)).toBe(true)
    expect(confirmSpy).not.toHaveBeenCalled()
  })

  it('prompts and returns the user choice when dirty', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    expect(confirmDiscardIfDirty(true)).toBe(true)

    vi.spyOn(window, 'confirm').mockReturnValue(false)
    expect(confirmDiscardIfDirty(true)).toBe(false)
  })
})

describe('useUnsavedChanges', () => {
  it('does not attach a beforeunload listener when clean', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    renderHook(() => useUnsavedChanges(false))
    expect(addSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  it('attaches the listener when dirty and removes it on cleanup', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useUnsavedChanges(true))
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  it('prevents the unload when dirty', () => {
    renderHook(() => useUnsavedChanges(true))
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})
