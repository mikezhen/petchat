import type { Pet } from '@/types'

export const ACTIVE_PET_LIMIT = 5
export const TOTAL_PET_LIMIT = 20

export function canAddPet(pets: Pet[]): boolean {
  const activeCount = pets.filter(p => p.status !== 'inactive').length
  return activeCount < ACTIVE_PET_LIMIT && pets.length < TOTAL_PET_LIMIT
}

export function addPetLimitMessage(pets: Pet[]): string {
  if (pets.length >= TOTAL_PET_LIMIT) {
    return `You've reached the maximum of ${TOTAL_PET_LIMIT} pets. Remove inactive pets to add more.`
  }
  return `You've reached the limit of ${ACTIVE_PET_LIMIT} active pets. Set a pet as inactive before adding another.`
}
