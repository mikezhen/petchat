import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UnsavedChangesModal from '@/components/UnsavedChangesModal'

describe('UnsavedChangesModal', () => {
  it('renders nothing when closed', () => {
    render(<UnsavedChangesModal open={false} onLeave={vi.fn()} onStay={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the dialog when open', () => {
    render(<UnsavedChangesModal open onLeave={vi.fn()} onStay={vi.fn()} />)
    expect(screen.getByRole('dialog')).toHaveTextContent(/unsaved changes/i)
  })

  it('calls onStay when "Keep editing" is clicked', async () => {
    const onStay = vi.fn()
    render(<UnsavedChangesModal open onLeave={vi.fn()} onStay={onStay} />)
    await userEvent.click(screen.getByRole('button', { name: /keep editing/i }))
    expect(onStay).toHaveBeenCalledOnce()
  })

  it('calls onLeave when "Discard Changes" is clicked', async () => {
    const onLeave = vi.fn()
    render(<UnsavedChangesModal open onLeave={onLeave} onStay={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /discard changes/i }))
    expect(onLeave).toHaveBeenCalledOnce()
  })
})
