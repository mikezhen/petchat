import { describe, it, expect } from 'vitest'
import { canAddPet, addPetLimitMessage, ACTIVE_PET_LIMIT, TOTAL_PET_LIMIT } from '@/lib/petLimits'
import type { Pet } from '@/types'

function makePet(id: string, status: Pet['status']): Pet {
  return {
    id,
    ownerId: 'owner-1',
    name: `Pet ${id}`,
    photoUrl: null,
    breed: '',
    color: '',
    weight: '',
    gender: '',
    birthday: '',
    description: '',
    status,
    medicalNotes: '',
    vet: { name: '', phone: '' },
    contacts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function activePets(n: number): Pet[] {
  return Array.from({ length: n }, (_, i) => makePet(`a${i}`, 'active'))
}

function inactivePets(n: number): Pet[] {
  return Array.from({ length: n }, (_, i) => makePet(`i${i}`, 'inactive'))
}

describe('canAddPet', () => {
  it('returns true when no pets exist', () => {
    expect(canAddPet([])).toBe(true)
  })

  it('returns true below both limits', () => {
    expect(canAddPet(activePets(4))).toBe(true)
  })

  it('returns false when active limit reached', () => {
    expect(canAddPet(activePets(ACTIVE_PET_LIMIT))).toBe(false)
  })

  it('returns false when total limit reached even with few active', () => {
    const pets = [...activePets(2), ...inactivePets(TOTAL_PET_LIMIT - 2)]
    expect(canAddPet(pets)).toBe(false)
  })

  it('returns true when active count is below limit but there are inactive pets', () => {
    const pets = [...activePets(3), ...inactivePets(5)]
    expect(canAddPet(pets)).toBe(true)
  })

  it('treats lost pets as active for limit purposes', () => {
    const pets = [
      ...activePets(ACTIVE_PET_LIMIT - 1),
      makePet('lost-1', 'lost'),
    ]
    expect(canAddPet(pets)).toBe(false)
  })
})

describe('addPetLimitMessage', () => {
  it('returns active limit message when only active limit is hit', () => {
    const msg = addPetLimitMessage(activePets(ACTIVE_PET_LIMIT))
    expect(msg).toContain(String(ACTIVE_PET_LIMIT))
    expect(msg).toContain('active')
  })

  it('returns total limit message when total limit is hit', () => {
    const pets = [...activePets(2), ...inactivePets(TOTAL_PET_LIMIT - 2)]
    const msg = addPetLimitMessage(pets)
    expect(msg).toContain(String(TOTAL_PET_LIMIT))
    expect(msg).toContain('maximum')
  })
})
