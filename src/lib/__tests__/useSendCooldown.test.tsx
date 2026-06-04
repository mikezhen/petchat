import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSendCooldown } from '@/lib/useSendCooldown'

afterEach(() => {
  vi.useRealTimers()
})

describe('useSendCooldown', () => {
  it('allows the first send', () => {
    const { result } = renderHook(() => useSendCooldown(1000))
    expect(result.current.canSend()).toBe(true)
  })

  it('blocks a send within the cooldown window after one is recorded', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSendCooldown(1000))
    result.current.markSent()
    expect(result.current.canSend()).toBe(false)
  })

  it('allows sending again once the cooldown elapses', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSendCooldown(1000))
    result.current.markSent()
    vi.advanceTimersByTime(1000)
    expect(result.current.canSend()).toBe(true)
  })
})
