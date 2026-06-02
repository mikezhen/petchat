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

function CallbackInner() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'needs_email' | 'error'>('processing')
  const [emailInput, setEmailInput] = useState('')
  const [error, setError] = useState('')

  async function completeSignIn(email: string) {
    try {
      const auth = getFirebaseAuth()
      const result = await signInWithEmailLink(auth, email, window.location.href)
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

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. The link may have expired.')
      setStatus('error')
    }
  }

  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      router.push('/login')
      return
    }
    const saved = localStorage.getItem(EMAIL_STORAGE_KEY)
    if (saved) {
      completeSignIn(saved)
    } else {
      setStatus('needs_email')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            onClick={() => completeSignIn(emailInput)}
            disabled={!emailInput}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
          >
            Continue
          </button>
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
