import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EMAIL_STORAGE_KEY, PENDING_PROFILE_KEY } from '@/lib/authConstants'

// Mock Firebase modules before importing doSignIn
vi.mock('firebase/auth', () => ({
  signInWithEmailLink: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, _col, id) => ({ id })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))
vi.mock('@/lib/firebase', () => ({
  getFirebaseAuth: vi.fn(() => 'mock-auth'),
  getFirebaseDb: vi.fn(() => 'mock-db'),
}))

import { signInWithEmailLink, signOut } from 'firebase/auth'
import { getDoc, setDoc } from 'firebase/firestore'
import { doSignIn } from '@/lib/doSignIn'

const mockSignIn = vi.mocked(signInWithEmailLink)
const mockSignOut = vi.mocked(signOut)
const mockGetDoc = vi.mocked(getDoc)
const mockSetDoc = vi.mocked(setDoc)

const FAKE_EMAIL = 'user@example.com'
const FAKE_HREF = 'https://app.pawcode.com/auth/callback?oobCode=abc'
const FAKE_UID = 'uid-123'

function mockAuthResult(email = FAKE_EMAIL) {
  mockSignIn.mockResolvedValue({ user: { uid: FAKE_UID, email } } as never)
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('doSignIn', () => {
  describe('existing user', () => {
    it('completes sign-in and clears email from localStorage', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => true } as never)
      localStorage.setItem(EMAIL_STORAGE_KEY, FAKE_EMAIL)

      await doSignIn(FAKE_EMAIL, FAKE_HREF)

      expect(mockSignIn).toHaveBeenCalledWith('mock-auth', FAKE_EMAIL, FAKE_HREF)
      expect(localStorage.getItem(EMAIL_STORAGE_KEY)).toBeNull()
    })

    it('does not create a Firestore user doc for existing users', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => true } as never)

      await doSignIn(FAKE_EMAIL, FAKE_HREF)

      expect(mockSetDoc).not.toHaveBeenCalled()
    })

    it('clears pending profile key even if it was set', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => true } as never)
      localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ fullName: 'Ghost' }))

      await doSignIn(FAKE_EMAIL, FAKE_HREF)

      expect(localStorage.getItem(PENDING_PROFILE_KEY)).toBeNull()
    })
  })

  describe('new user with pending registration', () => {
    it('creates a Firestore user doc from localStorage pending profile', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => false } as never)
      mockSetDoc.mockResolvedValue(undefined)
      localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ fullName: 'Jane Doe', phone: '(619) 555-1234' }))

      await doSignIn(FAKE_EMAIL, FAKE_HREF)

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ fullName: 'Jane Doe', phone: '(619) 555-1234', email: FAKE_EMAIL }),
      )
    })

    it('clears the pending profile key after creating the user doc', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => false } as never)
      mockSetDoc.mockResolvedValue(undefined)
      localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ fullName: 'Jane' }))

      await doSignIn(FAKE_EMAIL, FAKE_HREF)

      expect(localStorage.getItem(PENDING_PROFILE_KEY)).toBeNull()
    })

    it('falls back to empty strings for missing profile fields', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => false } as never)
      mockSetDoc.mockResolvedValue(undefined)
      localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({}))

      await doSignIn(FAKE_EMAIL, FAKE_HREF)

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ fullName: '', phone: '' }),
      )
    })
  })

  describe('unregistered user (no account, no pending profile)', () => {
    it('throws an error with "No account found" message', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => false } as never)

      await expect(doSignIn(FAKE_EMAIL, FAKE_HREF)).rejects.toThrow('No account found')
    })

    it('calls signOut to undo the Firebase Auth session', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => false } as never)
      mockSignOut.mockResolvedValue(undefined)

      await expect(doSignIn(FAKE_EMAIL, FAKE_HREF)).rejects.toThrow()

      expect(mockSignOut).toHaveBeenCalledWith('mock-auth')
    })

    it('does not create a Firestore doc', async () => {
      mockAuthResult()
      mockGetDoc.mockResolvedValue({ exists: () => false } as never)
      mockSignOut.mockResolvedValue(undefined)

      await expect(doSignIn(FAKE_EMAIL, FAKE_HREF)).rejects.toThrow()

      expect(mockSetDoc).not.toHaveBeenCalled()
    })
  })
})
