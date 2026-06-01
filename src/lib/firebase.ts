import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'placeholder',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function getFirebaseApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
}

let _emulatorsConnected = false

function connectEmulators() {
  if (_emulatorsConnected || process.env.NODE_ENV !== 'development') return
  _emulatorsConnected = true
  try {
    connectAuthEmulator(getAuth(getFirebaseApp()), 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(getFirestore(getFirebaseApp()), 'localhost', 8080)
    connectStorageEmulator(getStorage(getFirebaseApp()), 'localhost', 9199)
  } catch {
    // Already connected
  }
}

export function getFirebaseAuth() {
  const a = getAuth(getFirebaseApp())
  if (typeof window !== 'undefined') connectEmulators()
  return a
}

export function getFirebaseDb() {
  const d = getFirestore(getFirebaseApp())
  if (typeof window !== 'undefined') connectEmulators()
  return d
}

export function getFirebaseStorage() {
  const s = getStorage(getFirebaseApp())
  if (typeof window !== 'undefined') connectEmulators()
  return s
}

