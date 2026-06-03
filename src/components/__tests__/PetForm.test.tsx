import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PetForm from '@/components/PetForm'
import type { UserProfile } from '@/types'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))
vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn().mockResolvedValue({}),
  getDownloadURL: vi.fn().mockResolvedValue('https://example.com/photo.jpg'),
}))
vi.mock('@/lib/firebase', () => ({
  getFirebaseStorage: vi.fn(),
}))
vi.mock('@/lib/resizeImage', () => ({
  resizeImage: vi.fn().mockResolvedValue(new Blob(['img'], { type: 'image/jpeg' })),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const ownerProfile: Pick<UserProfile, 'fullName' | 'phone' | 'hasWhatsApp'> = {
  fullName: 'Jane Doe',
  phone: '(619) 555-1234',
  hasWhatsApp: false,
}

const noop = vi.fn().mockResolvedValue(undefined)

function renderForm(props: Partial<Parameters<typeof PetForm>[0]> = {}) {
  return render(
    <PetForm
      ownerProfile={ownerProfile}
      onSubmit={noop}
      submitLabel="Save"
      {...props}
    />
  )
}

beforeEach(() => { vi.clearAllMocks() })

describe('PetForm', () => {
  describe('rendering', () => {
    it('renders the pet name field', () => {
      renderForm()
      expect(screen.getByLabelText(/pet name/i)).toBeInTheDocument()
    })

    it('renders the submit button with the given label', () => {
      renderForm({ submitLabel: 'Save & Get QR Code' })
      expect(screen.getByRole('button', { name: /save & get qr code/i })).toBeInTheDocument()
    })

    it('does not render status toggle when hideStatus is true', () => {
      renderForm({ hideStatus: true })
      expect(screen.queryByRole('group', { name: /pet status/i })).not.toBeInTheDocument()
    })

    it('renders status toggle when hideStatus is false', () => {
      renderForm({ hideStatus: false })
      expect(screen.getByRole('group', { name: /pet status/i })).toBeInTheDocument()
    })

    it('displays owner contact as read-only primary contact', () => {
      renderForm()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('(619) 555-1234')).toBeInTheDocument()
    })

    it('prepopulates fields from initial prop', () => {
      renderForm({ initial: { name: 'Buddy', breed: 'Labrador' } })
      expect(screen.getByLabelText(/pet name/i)).toHaveValue('Buddy')
      expect(screen.getByLabelText(/breed/i)).toHaveValue('Labrador')
    })
  })

  describe('contact management', () => {
    it('shows Add Contact button when fewer than 2 additional contacts', () => {
      renderForm()
      expect(screen.getByText('+ Add Contact')).toBeInTheDocument()
    })

    it('adds a new contact form when Add Contact is clicked', async () => {
      renderForm()
      await userEvent.click(screen.getByText('+ Add Contact'))
      expect(screen.getByLabelText(/additional contact 1 name/i)).toBeInTheDocument()
    })

    it('hides Add Contact button when 2 additional contacts exist', async () => {
      renderForm()
      await userEvent.click(screen.getByText('+ Add Contact'))
      await userEvent.click(screen.getByText('+ Add Contact'))
      expect(screen.queryByText('+ Add Contact')).not.toBeInTheDocument()
    })

    it('removes a contact when Remove is clicked', async () => {
      renderForm()
      await userEvent.click(screen.getByText('+ Add Contact'))
      expect(screen.getByLabelText(/additional contact 1 name/i)).toBeInTheDocument()
      await userEvent.click(screen.getByText('Remove'))
      expect(screen.queryByLabelText(/additional contact 1 name/i)).not.toBeInTheDocument()
    })

    it('formats phone number in additional contact field', async () => {
      renderForm()
      await userEvent.click(screen.getByText('+ Add Contact'))
      const phoneInput = screen.getByLabelText(/additional contact 1 phone/i)
      await userEvent.type(phoneInput, '6195551234')
      expect(phoneInput).toHaveValue('(619) 555-1234')
    })
  })

  describe('photo upload', () => {
    it('shows error when file exceeds 10 MB', async () => {
      renderForm()
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
      Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })
      fireEvent.change(input, { target: { files: [bigFile] } })
      expect(await screen.findByText(/under 10 mb/i)).toBeInTheDocument()
    })

    it('opens the crop modal when a valid image is selected', async () => {
      renderForm()
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['img'], 'pet.jpg', { type: 'image/jpeg' })
      fireEvent.change(input, { target: { files: [file] } })
      expect(await screen.findByText(/zoom/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
    })

    it('closes the crop modal without changing the photo when cancelled', async () => {
      renderForm()
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['img'], 'pet.jpg', { type: 'image/jpeg' })
      fireEvent.change(input, { target: { files: [file] } })
      const cancel = await screen.findByRole('button', { name: /cancel/i })
      await userEvent.click(cancel)
      await waitFor(() => expect(screen.queryByText(/zoom/i)).not.toBeInTheDocument())
    })
  })

  describe('unsaved changes', () => {
    it('notifies the parent when the form becomes dirty', async () => {
      const onDirtyChange = vi.fn()
      renderForm({ onDirtyChange })
      // Mounts clean.
      await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(false))
      await userEvent.type(screen.getByLabelText(/pet name/i), 'Buddy')
      await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(true))
    })
  })

  describe('form submission', () => {
    it('calls onSubmit with form data including primary contact', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      renderForm({ onSubmit })
      await userEvent.type(screen.getByLabelText(/pet name/i), 'Buddy')
      await userEvent.click(screen.getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onSubmit).toHaveBeenCalled())
      const [submitted] = onSubmit.mock.calls[0]
      expect(submitted.name).toBe('Buddy')
      expect(submitted.contacts[0].isPrimary).toBe(true)
      expect(submitted.contacts[0].name).toBe('Jane Doe')
    })

    it('shows Saving… while submitting', async () => {
      let resolve: () => void
      const onSubmit = vi.fn().mockReturnValue(new Promise<void>(r => { resolve = r }))
      renderForm({ onSubmit })
      await userEvent.type(screen.getByLabelText(/pet name/i), 'Max')
      await userEvent.click(screen.getByRole('button', { name: /save/i }))
      expect(await screen.findByText('Saving…')).toBeInTheDocument()
      resolve!()
    })
  })
})
