'use client'

export const dynamic = 'force-static'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export const EMAIL_STORAGE_KEY = 'pawcode_signin_email'
export const PENDING_PROFILE_KEY = 'pawcode_pending_profile'

// Module-level — no React state, safe to call from effects and event handlers
async function doSignIn(email: string, href: string): Promise<void> {
  const auth = getFirebaseAuth()
  const result = await signInWithEmailLink(auth, email, href)
  localStorage.removeItem(EMAIL_STORAGE_KEY)

  const db = getFirebaseDb()
  const userSnap = await getDoc(doc(db, 'users', result.user.uid))
  if (!userSnap.exists()) {
    const pendingStr = localStorage.getItem(PENDING_PROFILE_KEY)
    const pending = pendingStr ? JSON.parse(pendingStr) : null
    await setDoc(doc(db, 'users', result.user.uid), {
      fullName: pending?.fullName ?? '',
      phone: pending?.phone ?? '',
      email: result.user.email ?? email,
      createdAt: serverTimestamp(),
    })
  }
  localStorage.removeItem(PENDING_PROFILE_KEY)
}

function CallbackInner() {
  const router = useRouter()

  // Lazy initializer: synchronous URL + storage checks at first render (client-only)
  const [init] = useState<{
    isValidLink: boolean
    savedEmail: string | null
  }>(() => {
    if (typeof window === 'undefined') return { isValidLink: false, savedEmail: null }
    const auth = getFirebaseAuth()
    const isValidLink = isSignInWithEmailLink(auth, window.location.href)
    return {
      isValidLink,
      savedEmail: isValidLink ? localStorage.getItem(EMAIL_STORAGE_KEY) : null,
    }
  })

  // Derive initial UI state from the synchronous check above — no effect needed
  const [status, setStatus] = useState<'processing' | 'needs_email' | 'error'>(
    () => (init.isValidLink && !init.savedEmail) ? 'needs_email' : 'processing'
  )
  const [emailInput, setEmailInput] = useState('')
  const [error, setError] = useState('')

  // Effect: redirect if invalid link, or complete async sign-in — setState only in callbacks
  useEffect(() => {
    if (!init.isValidLink) {
      router.push('/login')
      return
    }
    if (!init.savedEmail) return // waiting for user to enter email

    const href = window.location.href
    doSignIn(init.savedEmail, href)
      .then(() => router.push('/dashboard'))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Sign-in failed. The link may have expired.')
        setStatus('error')
      })
  }, [init, router])

  // Event handler: setState in event handlers is always fine
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('processing')
    const href = window.location.href
    doSignIn(emailInput, href)
      .then(() => router.push('/dashboard'))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Sign-in failed. The link may have expired.')
        setStatus('error')
      })
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <span className="text-4xl" aria-hidden="true">🐾</span>
          <p className="text-gray-600">Signing you in…</p>
        </div>
      </div>
    )
  }

  if (status === 'needs_email') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 space-y-4">
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">🐾</span>
            <h1 className="text-xl font-bold text-gray-900 mt-2">Confirm your email</h1>
            <p className="text-sm text-gray-600 mt-1">
              To finish signing in, re-enter your email address.
            </p>
          </div>
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!emailInput}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center space-y-4">
        <span className="text-4xl" aria-hidden="true">⚠️</span>
        <h1 className="text-xl font-bold text-gray-900">Sign-in failed</h1>
        <p className="text-sm text-gray-600">{error}</p>
        <a
          href="/login"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg py-2.5 text-center transition-colors"
        >
          Back to login
        </a>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}
