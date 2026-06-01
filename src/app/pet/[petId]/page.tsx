import { notFound } from 'next/navigation'
import { getAdminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import type { Pet } from '@/types'
import FinderView from './FinderView'

async function getPet(petId: string): Promise<Pet | null> {
  const snap = await getAdminDb().collection('pets').doc(petId).get()
  if (!snap.exists) return null
  const d = snap.data()!
  return {
    id: snap.id,
    ownerId: d.ownerId,
    name: d.name,
    photoUrl: d.photoUrl ?? null,
    breed: d.breed ?? '',
    color: d.color ?? '',
    description: d.description ?? '',
    status: d.status ?? 'active',
    medicalNotes: d.medicalNotes ?? '',
    contacts: d.contacts ?? [],
    createdAt: (d.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (d.updatedAt as Timestamp)?.toDate() ?? new Date(),
  }
}

export default async function PetPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params
  const pet = await getPet(petId)
  if (!pet) notFound()
  return <FinderView pet={pet} />
}
