'use client'

import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirebaseStorage } from '@/lib/firebase'
import Image from 'next/image'
import type { Pet, EmergencyContact, PetGender, UserProfile } from '@/types'
import { formatPhone } from '@/lib/formatPhone'
import { resizeImage } from '@/lib/resizeImage'

type FormData = Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>

interface PetFormProps {
  initial?: Partial<FormData>
  petId?: string
  ownerProfile: Pick<UserProfile, 'fullName' | 'phone' | 'hasWhatsApp'>
  onSubmit: (data: FormData) => Promise<void>
  submitLabel: string
  hideStatus?: boolean
}

const BLANK_CONTACT: EmergencyContact = { name: '', phone: '', relationship: '', isPrimary: false, hasWhatsApp: false }

export default function PetForm({ initial, petId, ownerProfile, onSubmit, submitLabel, hideStatus = false }: PetFormProps) {
  const [form, setForm] = useState<FormData>({
    name: initial?.name ?? '',
    photoUrl: initial?.photoUrl ?? null,
    breed: initial?.breed ?? '',
    color: initial?.color ?? '',
    weight: initial?.weight ?? '',
    gender: initial?.gender ?? '',
    birthday: initial?.birthday ?? '',
    description: initial?.description ?? '',
    status: initial?.status ?? 'active',
    medicalNotes: initial?.medicalNotes ?? '',
    vet: { name: initial?.vet?.name ?? '', phone: formatPhone(initial?.vet?.phone ?? '') },
    contacts: initial?.contacts?.filter(c => !c.isPrimary).map(c => ({ ...c, phone: formatPhone(c.phone) })) ?? [],
  })

  const [photoFile, setPhotoFile] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photoUrl ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const setContact = (i: number, field: keyof EmergencyContact, value: string | boolean) =>
    setForm(f => {
      const contacts = [...f.contacts]
      contacts[i] = { ...contacts[i], [field]: value }
      return { ...f, contacts }
    })

  const addContact = () => {
    if (form.contacts.length >= 2) return
    setForm(f => ({ ...f, contacts: [...f.contacts, { ...BLANK_CONTACT }] }))
  }

  const removeContact = (i: number) =>
    setForm(f => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }))

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be under 10 MB. Please choose a smaller image.')
      e.target.value = ''
      return
    }
    setError('')
    const blob = await resizeImage(file, { maxDimension: 1080, quality: 0.82 })
    setPhotoFile(blob)
    setPhotoPreview(URL.createObjectURL(blob))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      let photoUrl = form.photoUrl
      if (photoFile) {
        const id = petId ?? `temp-${Date.now()}`
        const storageRef = ref(getFirebaseStorage(), `pets/${id}/photo.jpg`)
        await uploadBytes(storageRef, photoFile, { contentType: 'image/jpeg' })
        photoUrl = await getDownloadURL(storageRef)
      }
      const primaryContact: EmergencyContact = {
        name: ownerProfile.fullName,
        phone: ownerProfile.phone,
        relationship: 'Owner',
        isPrimary: true,
        hasWhatsApp: ownerProfile.hasWhatsApp,
      }
      await onSubmit({ ...form, photoUrl, contacts: [primaryContact, ...form.contacts] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Photo */}
      <div>
        <div
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload pet photo"
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative hover:bg-gray-300 transition-colors"
        >
          {photoPreview ? (
            <>
              <Image src={photoPreview} alt="Pet photo preview" fill className="object-cover rounded-xl" />
              <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity bg-black/30 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">Change Photo</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
                Tap To Change
              </div>
            </>
          ) : (
            <span className="text-gray-600 text-sm">Tap To Upload Photo</span>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} aria-hidden="true" />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="pet-name" className="block text-sm font-medium text-gray-900 mb-1">Pet Name *</label>
        <input
          id="pet-name"
          type="text" required
          value={form.name}
          onChange={e => setField('name', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Status toggle — hidden during initial creation */}
      {!hideStatus && <div>
        <span className="block text-sm font-medium text-gray-900 mb-2">Status</span>
        <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-200" role="group" aria-label="Pet status">
          <button
            type="button"
            onClick={() => setField('status', 'active')}
            className={`py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 ${
              form.status === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Safe at Home
          </button>
          <button
            type="button"
            onClick={() => setField('status', 'lost')}
            className={`py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 ${
              form.status === 'lost'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🚨 Report Lost
          </button>
        </div>
      </div>}

      {/* Breed + color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pet-breed" className="block text-sm font-medium text-gray-900 mb-1">Breed</label>
          <input
            id="pet-breed"
            type="text"
            value={form.breed}
            onChange={e => setField('breed', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label htmlFor="pet-color" className="block text-sm font-medium text-gray-900 mb-1">Color</label>
          <input
            id="pet-color"
            type="text"
            value={form.color}
            onChange={e => setField('color', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Weight + Gender */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pet-weight" className="block text-sm font-medium text-gray-900 mb-1">Weight</label>
          <input
            id="pet-weight"
            type="text"
            value={form.weight}
            onChange={e => setField('weight', e.target.value)}
            placeholder="e.g. 25 lbs"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label htmlFor="pet-gender" className="block text-sm font-medium text-gray-900 mb-1">Gender</label>
          <select
            id="pet-gender"
            value={form.gender}
            onChange={e => setField('gender', e.target.value as PetGender)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* Birthday */}
      <div>
        <label htmlFor="pet-birthday" className="block text-sm font-medium text-gray-900 mb-1">Birthday</label>
        <div className="min-w-0 overflow-hidden">
          <input
            id="pet-birthday"
            type="date"
            value={form.birthday}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setField('birthday', e.target.value)}
            className="w-full min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="pet-description" className="block text-sm font-medium text-gray-900 mb-1">Notes</label>
        <textarea
          id="pet-description"
          rows={3}
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          placeholder="Personality, habits, how to approach them…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      {/* Vet */}
      <div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="vet-name" className="block text-sm font-medium text-gray-900 mb-1">Vet Clinic Name</label>
            <input
              id="vet-name"
              type="text"
              value={form.vet.name}
              onChange={e => setField('vet', { ...form.vet, name: e.target.value })}
              placeholder="City Vet Clinic"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="vet-phone" className="block text-sm font-medium text-gray-900 mb-1">Vet Phone Number</label>
            <input
              id="vet-phone"
              type="tel"
              value={form.vet.phone}
              onChange={e => setField('vet', { ...form.vet, phone: formatPhone(e.target.value) })}
              placeholder="(555) 000-0000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-900">Emergency Contacts</span>
          {form.contacts.length < 2 && (
            <button type="button" onClick={addContact} className="text-xs text-orange-600 font-medium hover:underline">
              + Add Contact
            </button>
          )}
        </div>
        <div className="space-y-3">

          {/* Owner — read-only primary contact */}
          <div className="bg-orange-100 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Primary Contact · You</span>
              <a href="/dashboard/profile" className="text-xs text-orange-600 hover:underline">Edit In Profile →</a>
            </div>
            <p className="text-sm font-semibold text-gray-900">{ownerProfile.fullName || '—'}</p>
            <p className="text-sm text-gray-600">{ownerProfile.phone || '—'}</p>
            {ownerProfile.hasWhatsApp && (
              <p className="text-xs text-emerald-700 mt-1">Available on WhatsApp</p>
            )}
          </div>

          {/* Additional contacts */}
          {form.contacts.map((c, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Additional Contact</span>
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text" required placeholder="Name"
                  id={`contact-${i}-name`}
                  aria-label={`Additional contact ${i + 1} name`}
                  value={c.name}
                  onChange={e => setContact(i, 'name', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel" required placeholder="Phone"
                  id={`contact-${i}-phone`}
                  aria-label={`Additional contact ${i + 1} phone`}
                  value={c.phone}
                  onChange={e => setContact(i, 'phone', formatPhone(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <input
                type="text" placeholder="Relationship (e.g. spouse, vet, neighbor)"
                id={`contact-${i}-relationship`}
                aria-label={`Additional contact ${i + 1} relationship`}
                value={c.relationship}
                onChange={e => setContact(i, 'relationship', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors"
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
