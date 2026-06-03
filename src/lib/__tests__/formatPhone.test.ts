import { describe, it, expect } from 'vitest'
import { formatPhone } from '@/lib/formatPhone'

describe('formatPhone', () => {
  it('returns empty string for empty input', () => {
    expect(formatPhone('')).toBe('')
  })

  it('strips all non-digit characters before formatting', () => {
    expect(formatPhone('abc')).toBe('')
  })

  it('formats 1–3 digits as open paren', () => {
    expect(formatPhone('6')).toBe('(6')
    expect(formatPhone('61')).toBe('(61')
    expect(formatPhone('619')).toBe('(619')
  })

  it('formats 4–6 digits as (XXX) XXX', () => {
    expect(formatPhone('6195')).toBe('(619) 5')
    expect(formatPhone('61955')).toBe('(619) 55')
    expect(formatPhone('619555')).toBe('(619) 555')
  })

  it('formats 10 digits as (XXX) XXX-XXXX', () => {
    expect(formatPhone('6195551234')).toBe('(619) 555-1234')
  })

  it('strips hyphens/spaces and reformats correctly', () => {
    expect(formatPhone('619-555-1234')).toBe('(619) 555-1234')
    expect(formatPhone('(619) 555-1234')).toBe('(619) 555-1234')
  })

  it('truncates input beyond 10 digits (no country code)', () => {
    expect(formatPhone('61955512349999')).toBe('(619) 555-1234')
  })

  it('formats 11 digits starting with 1 as +1 (XXX) XXX-XXXX', () => {
    expect(formatPhone('16195551234')).toBe('+1 (619) 555-1234')
  })

  it('handles +1 prefix in input', () => {
    expect(formatPhone('+16195551234')).toBe('+1 (619) 555-1234')
  })

  it('treats sub-11-digit inputs starting with 1 as local numbers', () => {
    // +1 path only activates at exactly 11 digits — partial entries are local
    expect(formatPhone('1619')).toBe('(161) 9')
    expect(formatPhone('16195')).toBe('(161) 95')
    expect(formatPhone('161955')).toBe('(161) 955')
  })
})
