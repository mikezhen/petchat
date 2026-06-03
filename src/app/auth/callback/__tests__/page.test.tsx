import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('firebase/auth', () => ({
  isSignInWithEmailLink: vi.fn(),
}))
vi.mock('@/lib/firebase', () => ({
  getFirebaseAuth: vi.fn(() => 'mock-auth'),
}))
vi.mock('@/lib/doSignIn', () => ({
  doSignIn: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
}))

import { isSignInWithEmailLink } from 'firebase/auth'
import { doSignIn } from '@/lib/doSignIn'
import { EMAIL_STORAGE_KEY } from '@/lib/authConstants'
import AuthCallbackPage from '@/app/auth/callback/page'

const mockIsSignInLink = vi.mocked(isSignInWithEmailLink)
const mockDoSignIn = vi.mocked(doSignIn)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: 'https://app.pawcode.com/auth/callback?oobCode=abc' },
  })
})

describe('AuthCallbackPage', () => {
  describe('invalid link', () => {
    it('shows processing state when the URL is not a valid sign-in link', () => {
      mockIsSignInLink.mockReturnValue(false)
      render(<AuthCallbackPage />)
      expect(screen.getByText(/signing you in/i)).toBeInTheDocument()
    })
  })

  describe('valid link — email in localStorage', () => {
    it('shows processing state while signing in', () => {
      mockIsSignInLink.mockReturnValue(true)
      localStorage.setItem(EMAIL_STORAGE_KEY, 'user@example.com')
      mockDoSignIn.mockReturnValue(new Promise(() => {})) // never resolves
      render(<AuthCallbackPage />)
      expect(screen.getByText(/signing you in/i)).toBeInTheDocument()
    })
  })

  describe('valid link — no email in localStorage', () => {
    it('shows email confirmation form', () => {
      mockIsSignInLink.mockReturnValue(true)
      render(<AuthCallbackPage />)
      expect(screen.getByText(/confirm your email/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument()
    })

    it('submits the entered email to doSignIn', async () => {
      mockIsSignInLink.mockReturnValue(true)
      mockDoSignIn.mockResolvedValue(undefined)
      render(<AuthCallbackPage />)
      await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'user@example.com')
      await userEvent.click(screen.getByRole('button', { name: /continue/i }))
      expect(mockDoSignIn).toHaveBeenCalledWith(
        'user@example.com',
        expect.stringContaining('oobCode'),
      )
    })
  })

  describe('error states', () => {
    it('shows "No account found" heading with register CTA on unregistered user error', async () => {
      mockIsSignInLink.mockReturnValue(true)
      localStorage.setItem(EMAIL_STORAGE_KEY, 'user@example.com')
      mockDoSignIn.mockRejectedValue(new Error('No account found for this email. Please register first.'))
      render(<AuthCallbackPage />)
      expect(await screen.findByRole('heading', { name: /no account found/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute('href', '/register')
    })

    it('shows generic sign-in failed heading on other errors', async () => {
      mockIsSignInLink.mockReturnValue(true)
      localStorage.setItem(EMAIL_STORAGE_KEY, 'user@example.com')
      mockDoSignIn.mockRejectedValue(new Error('The link has expired.'))
      render(<AuthCallbackPage />)
      expect(await screen.findByText(/sign-in failed/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument()
    })

    it('shows the error message text', async () => {
      mockIsSignInLink.mockReturnValue(true)
      localStorage.setItem(EMAIL_STORAGE_KEY, 'user@example.com')
      mockDoSignIn.mockRejectedValue(new Error('The link has expired.'))
      render(<AuthCallbackPage />)
      expect(await screen.findByText('The link has expired.')).toBeInTheDocument()
    })
  })
})
