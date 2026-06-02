'use client'

export const dynamic = 'force-static'

import { useEffect, useState } from 'react'
import { signInWithEmailAndPassword, sendSignInLinkToEmail } from 'firebase/auth'
import type { ActionCodeSettings } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { EMAIL_STORAGE_KEY } from '@/app/auth/callback/page'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('magic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard')
  }, [user, authLoading, router])

  if (authLoading || user) return null

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
      router.push('/dashboard')
    } catch {
      setError('Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const settings: ActionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        handleCodeInApp: true,
      }
      await sendSignInLinkToEmail(getFirebaseAuth(), email, settings)
      localStorage.setItem(EMAIL_STORAGE_KEY, email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send link')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <span className="text-4xl" aria-hidden="true">🐾</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Sign in to PawCode</h1>
        </div>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => { setMode('magic'); setError(''); setSent(false) }}
            className={`py-2.5 text-sm font-medium transition-colors ${
              mode === 'magic' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => { setMode('password'); setError(''); setSent(false) }}
            className={`py-2.5 text-sm font-medium transition-colors ${
              mode === 'password' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Password
          </button>
        </div>

        {mode === 'magic' ? (
          sent ? (
            <div className="text-center space-y-3 py-4">
              <span className="text-4xl" aria-hidden="true">📬</span>
              <p className="font-semibold text-gray-900">Check your inbox</p>
              <p className="text-sm text-gray-600">
                We sent a sign-in link to <span className="font-medium">{email}</span>.
                Tap the link to sign in — no password needed.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-orange-600 hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
              >
                {submitting ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label htmlFor="email-pw" className="block text-sm font-medium text-gray-900 mb-1">Email</label>
              <input
                id="email-pw"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          No account yet?{' '}
          <Link href="/register" className="text-orange-600 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
