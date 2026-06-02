import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import type { UserProfile } from '@/types'

function toUserProfile(data: Record<string, unknown>): UserProfile {
  return {
    fullName: data.fullName as string,
    phone: data.phone as string,
    email: data.email as string,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  }
}

export async function getUser(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'users', userId))
  if (!snap.exists()) return null
  return toUserProfile(snap.data())
}

export async function updateUser(
  userId: string,
  data: Pick<UserProfile, 'fullName' | 'phone'>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'users', userId), data)
}
