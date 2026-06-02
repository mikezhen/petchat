export type PetStatus = 'active' | 'lost'

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
  isPrimary: boolean
  hasWhatsApp: boolean
}

export type PetGender = 'male' | 'female' | ''

export interface VetInfo {
  name: string
  phone: string
}

export interface Pet {
  id: string
  ownerId: string
  name: string
  photoUrl: string | null
  breed: string
  color: string
  weight: string
  gender: PetGender
  birthday: string
  description: string
  status: PetStatus
  medicalNotes: string
  vet: VetInfo
  contacts: EmergencyContact[]
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  fullName: string
  phone: string
  email: string
  hasWhatsApp: boolean
  photoUrl: string | null
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
