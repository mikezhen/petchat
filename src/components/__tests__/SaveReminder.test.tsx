import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import SaveReminder from '@/components/SaveReminder'

afterEach(() => {
  vi.useRealTimers()
})

describe('SaveReminder', () => {
  it('is hidden when trigger is 0', () => {
    render(<SaveReminder trigger={0} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the reminder when trigger becomes truthy', () => {
    const { rerender } = render(<SaveReminder trigger={0} />)
    rerender(<SaveReminder trigger={Date.now()} />)
    expect(screen.getByRole('status')).toHaveTextContent(/save your changes/i)
  })

  it('auto-dismisses after the duration', () => {
    vi.useFakeTimers()
    render(<SaveReminder trigger={123} durationMs={4000} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(4000) })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('hides immediately when trigger is reset to 0', () => {
    const { rerender } = render(<SaveReminder trigger={123} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    rerender(<SaveReminder trigger={0} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders a custom message', () => {
    render(<SaveReminder trigger={1} message="Custom nudge" />)
    expect(screen.getByRole('status')).toHaveTextContent('Custom nudge')
  })
})
