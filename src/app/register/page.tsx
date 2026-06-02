'use client'

export const dynamic = 'force-static'

import { useState } from 'react'
import { createUserWithEmailAndPassword, sendSignInLinkToEmail } from 'firebase/auth'
import type { ActionCodeSettings } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { EMAIL_STORAGE_KEY, PENDING_PROFILE_KEY } from '@/app/auth/callback/page'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPhone } from '@/lib/formatPhone'

type Mode = 'magic' | 'password'

export default function RegisterPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('magic')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(getFirebaseAuth(), form.email, form.password)
      await setDoc(doc(getFirebaseDb(), 'users', user.uid), {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        createdAt: serverTimestamp(),
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const settings: ActionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        handleCodeInApp: true,
      }
      await sendSignInLinkToEmail(getFirebaseAuth(), form.email, settings)
      localStorage.setItem(EMAIL_STORAGE_KEY, form.email)
      localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ fullName: form.fullName, phone: form.phone }))
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send link')
    } finally {
      setLoading(false)
    }
  }

  const sharedFields = (
    <>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-1">Name</label>
        <input
          id="fullName"
          type="text"
          required
          autoComplete="name"
          value={form.fullName}
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-1">Phone Number</label>
        <input
          id="phone"
          type="tel"
          required
          autoComplete="tel"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <span className="text-4xl" aria-hidden="true">🐾</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create your PawCode account</h1>
          <p className="text-gray-600 text-sm mt-1">Protect your pet with a smart QR tag</p>
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
                We sent a sign-in link to <span className="font-medium">{form.email}</span>.
                Tap the link to activate your account — no password needed.
              </p>
              <button
                onClick={() => { setSent(false); setForm(f => ({ ...f, email: '' })) }}
                className="text-sm text-orange-600 hover:underline"
              >
                Use A Different Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              {sharedFields}
              {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
              >
                {loading ? 'Sending…' : 'Send Magic Link'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handlePassword} className="space-y-4">
            {sharedFields}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
