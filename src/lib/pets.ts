import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { getFirebaseDb, getFirebaseStorage } from './firebase'
import type { Pet, EmergencyContact, PetStatus } from '@/types'

/** Generates a pet document ID without writing, so the same ID can be used for
 *  the Storage photo path before the pet doc itself is created. */
export function newPetId(): string {
  return doc(collection(getFirebaseDb(), 'pets')).id
}

/** Owner-scoped Storage path for a pet's photo. */
export function petPhotoPath(petId: string, ownerUid: string): string {
  return `pets/${petId}/${ownerUid}/photo.jpg`
}

export function toPet(id: string, data: Record<string, unknown>): Pet {
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
    status: (['lost', 'inactive'].includes(data.status as string) ? data.status : 'active') as PetStatus,
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
  petId: string,
  ownerId: string,
  data: Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  await setDoc(doc(getFirebaseDb(), 'pets', petId), {
    ...data,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return petId
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

export async function deletePet(petId: string, ownerUid: string): Promise<void> {
  // Best-effort: remove the pet's photo so it doesn't linger as an orphaned
  // (but still billed) Storage object. Non-fatal if there's no photo, it's a
  // legacy-path image, or it's already gone.
  try {
    await deleteObject(ref(getFirebaseStorage(), petPhotoPath(petId, ownerUid)))
  } catch {
    // ignore — proceed to delete the document regardless
  }
  await deleteDoc(doc(getFirebaseDb(), 'pets', petId))
}
