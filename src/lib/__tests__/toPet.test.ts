import { describe, it, expect } from 'vitest'
import { toPet } from '@/lib/pets'

const baseData: Record<string, unknown> = {
  ownerId: 'owner-1',
  name: 'Buddy',
  photoUrl: 'https://example.com/buddy.jpg',
  breed: 'Labrador',
  color: 'Yellow',
  weight: '65 lbs',
  gender: 'male',
  birthday: '2020-01-15',
  description: 'Loves walks',
  status: 'active',
  medicalNotes: 'None',
  vet: { name: 'City Vet', phone: '(555) 000-0000' },
  contacts: [],
  createdAt: { toDate: () => new Date('2023-01-01') },
  updatedAt: { toDate: () => new Date('2023-06-01') },
}

describe('toPet', () => {
  it('maps all fields from Firestore data', () => {
    const pet = toPet('pet-1', baseData)
    expect(pet.id).toBe('pet-1')
    expect(pet.ownerId).toBe('owner-1')
    expect(pet.name).toBe('Buddy')
    expect(pet.photoUrl).toBe('https://example.com/buddy.jpg')
    expect(pet.breed).toBe('Labrador')
    expect(pet.status).toBe('active')
    expect(pet.createdAt).toEqual(new Date('2023-01-01'))
  })

  it('defaults status to active when field is missing', () => {
    const pet = toPet('p', { ...baseData, status: undefined })
    expect(pet.status).toBe('active')
  })

  it('defaults status to active for unknown status values', () => {
    const pet = toPet('p', { ...baseData, status: 'deleted' })
    expect(pet.status).toBe('active')
  })

  it('preserves lost status', () => {
    const pet = toPet('p', { ...baseData, status: 'lost' })
    expect(pet.status).toBe('lost')
  })

  it('preserves inactive status', () => {
    const pet = toPet('p', { ...baseData, status: 'inactive' })
    expect(pet.status).toBe('inactive')
  })

  it('defaults optional string fields to empty string', () => {
    const pet = toPet('p', { ...baseData, breed: undefined, color: undefined, weight: undefined })
    expect(pet.breed).toBe('')
    expect(pet.color).toBe('')
    expect(pet.weight).toBe('')
  })

  it('defaults photoUrl to null when missing', () => {
    const pet = toPet('p', { ...baseData, photoUrl: undefined })
    expect(pet.photoUrl).toBeNull()
  })

  it('defaults contacts to empty array when missing', () => {
    const pet = toPet('p', { ...baseData, contacts: undefined })
    expect(pet.contacts).toEqual([])
  })

  it('defaults vet to empty name/phone when missing', () => {
    const pet = toPet('p', { ...baseData, vet: undefined })
    expect(pet.vet).toEqual({ name: '', phone: '' })
  })

  it('falls back to new Date() when createdAt Timestamp is missing', () => {
    const before = Date.now()
    const pet = toPet('p', { ...baseData, createdAt: undefined })
    expect(pet.createdAt.getTime()).toBeGreaterThanOrEqual(before)
  })
})
