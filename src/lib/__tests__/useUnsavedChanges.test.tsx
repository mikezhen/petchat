import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUnsavedChanges } from '@/lib/useUnsavedChanges'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

beforeEach(() => {
  push.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useUnsavedChanges — beforeunload', () => {
  it('does not attach a listener when clean', () => {
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

describe('useUnsavedChanges — in-app leave guard', () => {
  it('navigates immediately when clean', () => {
    const { result } = renderHook(() => useUnsavedChanges(false))
    act(() => result.current.requestLeave())
    expect(push).toHaveBeenCalledWith('/dashboard')
    expect(result.current.promptOpen).toBe(false)
  })

  it('opens the modal instead of navigating when dirty', () => {
    const { result } = renderHook(() => useUnsavedChanges(true))
    act(() => result.current.requestLeave())
    expect(push).not.toHaveBeenCalled()
    expect(result.current.promptOpen).toBe(true)
  })

  it('confirmLeave navigates and closes the modal', () => {
    const { result } = renderHook(() => useUnsavedChanges(true))
    act(() => result.current.requestLeave())
    act(() => result.current.confirmLeave())
    expect(push).toHaveBeenCalledWith('/dashboard')
    expect(result.current.promptOpen).toBe(false)
  })

  it('cancelLeave closes the modal without navigating', () => {
    const { result } = renderHook(() => useUnsavedChanges(true))
    act(() => result.current.requestLeave())
    act(() => result.current.cancelLeave())
    expect(push).not.toHaveBeenCalled()
    expect(result.current.promptOpen).toBe(false)
  })

  it('respects a custom target', () => {
    const { result } = renderHook(() => useUnsavedChanges(false, '/somewhere'))
    act(() => result.current.requestLeave())
    expect(push).toHaveBeenCalledWith('/somewhere')
  })
})
