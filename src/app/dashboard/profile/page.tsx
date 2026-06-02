'use client'

export const dynamic = 'force-static'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getUser, updateUser } from '@/lib/users'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', phone: '', hasWhatsApp: false })
  const [email, setEmail] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getUser(user.uid).then(profile => {
      if (profile) {
        setForm({ fullName: profile.fullName, phone: profile.phone, hasWhatsApp: profile.hasWhatsApp })
        setEmail(profile.email)
      }
      setProfileLoading(false)
    })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      await updateUser(user.uid, form)
      setSaved(true)
    } catch {
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user || profileLoading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">←</Link>
        <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 p-6">

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-1">Full name</label>
            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-1">Phone number</label>
            <input
              id="phone"
              type="tel"
              required
              autoComplete="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasWhatsApp}
                onChange={e => setForm(f => ({ ...f, hasWhatsApp: e.target.checked }))}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-900">I'm available on WhatsApp</span>
            </label>
            <p className="text-xs text-gray-600 mt-1 ml-7">Shows a WhatsApp button on your pet's finder page.</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              aria-describedby="email-hint"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p id="email-hint" className="text-xs text-gray-600 mt-1">Email cannot be changed here.</p>
          </div>

          {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
          {saved && <p role="status" className="text-green-700 text-sm">Changes saved.</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </main>
    </div>
  )
}
