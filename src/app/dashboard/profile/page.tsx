'use client'

export const dynamic = 'force-static'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuth } from '@/lib/auth-context'
import { getFirebaseStorage } from '@/lib/firebase'
import { getUser, updateUser } from '@/lib/users'
import { formatPhone } from '@/lib/formatPhone'
import { resizeImage } from '@/lib/resizeImage'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', phone: '', hasWhatsApp: false })
  const [email, setEmail] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getUser(user.uid).then(profile => {
      if (profile) {
        setForm({ fullName: profile.fullName, phone: formatPhone(profile.phone), hasWhatsApp: profile.hasWhatsApp })
        setEmail(profile.email)
        setPhotoUrl(profile.photoUrl)
        setPhotoPreview(profile.photoUrl)
      }
      setProfileLoading(false)
    })
  }, [user])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be under 10 MB. Please choose a smaller image.')
      e.target.value = ''
      return
    }
    setError('')
    const blob = await resizeImage(file, { maxDimension: 400, quality: 0.85 })
    setPhotoFile(blob)
    setPhotoPreview(URL.createObjectURL(blob))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      let finalPhotoUrl = photoUrl
      if (photoFile) {
        const storageRef = ref(getFirebaseStorage(), `users/${user.uid}/avatar.jpg`)
        await uploadBytes(storageRef, photoFile, { contentType: 'image/jpeg' })
        finalPhotoUrl = await getDownloadURL(storageRef)
        setPhotoUrl(finalPhotoUrl)
      }
      await updateUser(user.uid, { ...form, photoUrl: finalPhotoUrl })
      setSaved(true)
    } catch {
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user || profileLoading) return null

  const initials = form.fullName
    ? form.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">←</Link>
        <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 p-6">

          {/* Profile photo */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label="Upload profile photo"
            >
              {photoPreview ? (
                <>
                  <Image src={photoPreview} alt="Profile photo" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <span className="text-white text-xs font-semibold opacity-0 hover:opacity-100 transition-opacity">Change</span>
                  </div>
                </>
              ) : (
                <span className="text-2xl font-bold text-orange-500">{initials}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-orange-600 font-medium hover:underline"
            >
              {photoPreview ? 'Change photo' : 'Upload photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} aria-hidden="true" />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-1">Name</label>
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-1">Phone Number</label>
            <input
              id="phone"
              type="tel"
              required
              autoComplete="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
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
              <span className="text-sm font-medium text-gray-900">I&apos;m available on WhatsApp</span>
            </label>
            <p className="text-[xx-small] text-gray-500 mt-1 ml-7">Check this option to display a WhatsApp button on your pet&apos;s Finder page</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              aria-describedby="email-hint"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p id="email-hint" className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
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
