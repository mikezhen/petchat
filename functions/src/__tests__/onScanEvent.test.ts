import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these are available inside vi.mock factories
const { mockSendEmail, mockCountGet, mockPetGet, mockOwnerGet, mockWhere } = vi.hoisted(() => {
  const mockSendEmail = vi.fn().mockResolvedValue({ id: 'email-id' })
  const mockCountGet = vi.fn()
  const mockPetGet = vi.fn()
  const mockOwnerGet = vi.fn()
  const mockWhere = vi.fn()
  return { mockSendEmail, mockCountGet, mockPetGet, mockOwnerGet, mockWhere }
})

vi.mock('firebase-admin/app', () => ({ initializeApp: vi.fn() }))
vi.mock('firebase-functions/params', () => ({ defineSecret: vi.fn(() => ({ value: vi.fn() })) }))
vi.mock('firebase-functions/v2/firestore', () => ({ onDocumentCreated: vi.fn() }))
vi.mock('resend', () => ({
  Resend: function () {
    return { emails: { send: mockSendEmail } }
  },
}))
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn((name: string) => {
      if (name === 'users') return { doc: vi.fn(() => ({ get: mockOwnerGet })) }
      return {
        doc: vi.fn(() => ({
          get: mockPetGet,
          collection: vi.fn(() => ({ where: mockWhere })),
        })),
      }
    }),
  })),
  Timestamp: {
    fromDate: vi.fn((d: Date) => ({ toDate: () => d })),
  },
}))

import { handleScanEvent, RATE_LIMIT_MAX, type ScanEventData, type ScanEventContext } from '../index'
import type { Timestamp } from 'firebase-admin/firestore'

function makeTimestamp(date = new Date('2024-06-01T12:00:00Z')): Timestamp {
  return { toDate: () => date } as unknown as Timestamp
}

function makeContext(overrides: Partial<ScanEventContext> = {}): ScanEventContext {
  return {
    petId: 'pet-1',
    data: {
      scannedAt: makeTimestamp(),
      latitude: 32.7157,
      longitude: -117.1611,
    } as ScanEventData,
    getResendApiKey: () => 'test-key',
    ...overrides,
  }
}

function mockRateLimit(count: number) {
  mockWhere.mockReturnValue({
    count: vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue({ data: () => ({ count }) }) }),
  })
}

function mockPet(data: Record<string, unknown> | null) {
  mockPetGet.mockResolvedValue({ exists: data !== null, data: () => data })
}

function mockOwner(data: Record<string, unknown> | null) {
  mockOwnerGet.mockResolvedValue({ exists: data !== null, data: () => data })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSendEmail.mockResolvedValue({ id: 'email-id' })
})

describe('handleScanEvent', () => {
  describe('early exits', () => {
    it('returns immediately when event data is null', async () => {
      await handleScanEvent(makeContext({ data: null }))
      expect(mockSendEmail).not.toHaveBeenCalled()
    })

    it('returns without sending email when rate limit exceeded', async () => {
      mockRateLimit(RATE_LIMIT_MAX + 1)
      await handleScanEvent(makeContext())
      expect(mockSendEmail).not.toHaveBeenCalled()
    })

    it('returns without sending email when pet document does not exist', async () => {
      mockRateLimit(1)
      mockPet(null)
      await handleScanEvent(makeContext())
      expect(mockSendEmail).not.toHaveBeenCalled()
    })

    it('returns without sending email when owner document does not exist', async () => {
      mockRateLimit(1)
      mockPet({ ownerId: 'owner-1', name: 'Buddy' })
      mockOwner(null)
      await handleScanEvent(makeContext())
      expect(mockSendEmail).not.toHaveBeenCalled()
    })
  })

  describe('email sending', () => {
    beforeEach(() => {
      mockRateLimit(1)
      mockPet({ ownerId: 'owner-1', name: 'Buddy' })
      mockOwner({ email: 'owner@example.com', fullName: 'Jane Doe' })
    })

    it('sends an email to the owner', async () => {
      await handleScanEvent(makeContext())
      expect(mockSendEmail).toHaveBeenCalledOnce()
      expect(mockSendEmail.mock.calls[0][0].to).toBe('owner@example.com')
    })

    it('includes the pet name in the subject', async () => {
      await handleScanEvent(makeContext())
      expect(mockSendEmail.mock.calls[0][0].subject).toContain('Buddy')
    })

    it('includes Google Maps URL when coordinates are present', async () => {
      await handleScanEvent(makeContext())
      const html: string = mockSendEmail.mock.calls[0][0].html
      expect(html).toContain('google.com/maps')
      expect(html).toContain('32.7157')
    })

    it('omits Maps URL and shows fallback text when coordinates are null', async () => {
      await handleScanEvent(makeContext({
        data: { scannedAt: makeTimestamp(), latitude: null, longitude: null } as ScanEventData,
      }))
      const html: string = mockSendEmail.mock.calls[0][0].html
      expect(html).toContain('Location not shared by finder')
      expect(html).not.toContain('google.com/maps')
    })

    it('sends email at exactly the rate limit boundary', async () => {
      mockRateLimit(RATE_LIMIT_MAX)
      await handleScanEvent(makeContext())
      expect(mockSendEmail).toHaveBeenCalledOnce()
    })
  })
})
