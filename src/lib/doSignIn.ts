import { signInWithEmailLink, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { EMAIL_STORAGE_KEY, PENDING_PROFILE_KEY } from '@/lib/authConstants'

export async function doSignIn(email: string, href: string): Promise<void> {
  const auth = getFirebaseAuth()
  const result = await signInWithEmailLink(auth, email, href)
  localStorage.removeItem(EMAIL_STORAGE_KEY)

  const db = getFirebaseDb()
  const userSnap = await getDoc(doc(db, 'users', result.user.uid))
  if (!userSnap.exists()) {
    const pendingStr = localStorage.getItem(PENDING_PROFILE_KEY)
    if (!pendingStr) {
      await signOut(auth)
      throw new Error('No account found for this email. Please register first.')
    }
    const pending = JSON.parse(pendingStr) as { fullName?: string; phone?: string }
    await setDoc(doc(db, 'users', result.user.uid), {
      fullName: pending?.fullName ?? '',
      phone: pending?.phone ?? '',
      email: result.user.email ?? email,
      createdAt: serverTimestamp(),
    })
  }
  localStorage.removeItem(PENDING_PROFILE_KEY)
}
