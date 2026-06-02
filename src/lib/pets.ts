import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import type { Pet, EmergencyContact, PetStatus } from '@/types'

function toPet(id: string, data: Record<string, unknown>): Pet {
  return {
    id,
    ownerId: data.ownerId as string,
    name: data.name as string,
    photoUrl: (data.photoUrl as string) ?? null,
    breed: (data.breed as string) ?? '',
    color: (data.color as string) ?? '',
    weight: (data.weight as string) ?? '',
    gender: (data.gender as Pet['gender']) ?? '',
    birthday: (data.birthday as string) ?? '',
    description: (data.description as string) ?? '',
    status: (data.status === 'lost' ? 'lost' : 'active') as PetStatus,
    medicalNotes: (data.medicalNotes as string) ?? '',
    vet: (data.vet as Pet['vet']) ?? { name: '', phone: '' },
    contacts: (data.contacts as EmergencyContact[]) ?? [],
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  }
}

export async function getPet(petId: string): Promise<Pet | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'pets', petId))
  if (!snap.exists()) return null
  return toPet(snap.id, snap.data())
}

export async function getPetsByOwner(ownerId: string): Promise<Pet[]> {
  const q = query(
    collection(getFirebaseDb(), 'pets'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => toPet(d.id, d.data()))
}

export async function createPet(
  ownerId: string,
  data: Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), 'pets'), {
    ...data,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePet(
  petId: string,
  data: Partial<Omit<Pet, 'id' | 'ownerId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'pets', petId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
