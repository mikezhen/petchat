import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SaveButton from '@/components/SaveButton'

describe('SaveButton', () => {
  it('shows the idle label and is enabled when there are changes', () => {
    render(<SaveButton status="idle" disabled={false} />)
    const btn = screen.getByRole('button', { name: /^save$/i })
    expect(btn).toBeEnabled()
  })

  it('is disabled in idle state when there is nothing to save', () => {
    render(<SaveButton status="idle" disabled />)
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()
  })

  it('shows Saving… and is disabled while saving', () => {
    render(<SaveButton status="saving" />)
    const btn = screen.getByRole('button', { name: /saving/i })
    expect(btn).toBeDisabled()
  })

  it('shows Saved with a checkmark when saved', () => {
    const { container } = render(<SaveButton status="saved" />)
    expect(screen.getByRole('button', { name: /saved/i })).toBeDisabled()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('uses a custom idle label when provided', () => {
    render(<SaveButton status="idle" idleLabel="Update" />)
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })
})
