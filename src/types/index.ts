export type PetStatus = 'active' | 'lost' | 'found'

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
  isPrimary: boolean
}

export interface Pet {
  id: string
  ownerId: string
  name: string
  photoUrl: string | null
  breed: string
  color: string
  description: string
  status: PetStatus
  medicalNotes: string
  contacts: EmergencyContact[]
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  fullName: string
  phone: string
  email: string
  createdAt: Date
}

export interface ScanEvent {
  id: string
  petId: string
  scannedAt: Date
  latitude: number | null
  longitude: number | null
  userAgent: string | null
}
