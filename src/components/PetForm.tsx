'use client'

import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirebaseStorage } from '@/lib/firebase'
import type { Pet, EmergencyContact, PetStatus } from '@/types'

type FormData = Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>

interface PetFormProps {
  initial?: Partial<FormData>
  petId?: string
  onSubmit: (data: FormData) => Promise<void>
  submitLabel: string
}

const BLANK_CONTACT: EmergencyContact = { name: '', phone: '', relationship: '', isPrimary: false }

export default function PetForm({ initial, petId, onSubmit, submitLabel }: PetFormProps) {
  const [form, setForm] = useState<FormData>({
    name: initial?.name ?? '',
    photoUrl: initial?.photoUrl ?? null,
    breed: initial?.breed ?? '',
    color: initial?.color ?? '',
    description: initial?.description ?? '',
    status: initial?.status ?? 'active',
    medicalNotes: initial?.medicalNotes ?? '',
    contacts: initial?.contacts?.length
      ? initial.contacts
      : [{ ...BLANK_CONTACT, isPrimary: true }],
  })

  const [photoFile, setPhotoFile] = useState<File | null>(null)
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
      if (field === 'isPrimary' && value === true) {
        contacts.forEach((c, idx) => { if (idx !== i) c.isPrimary = false })
      }
      return { ...f, contacts }
    })

  const addContact = () => {
    if (form.contacts.length >= 3) return
    setForm(f => ({ ...f, contacts: [...f.contacts, { ...BLANK_CONTACT }] }))
  }

  const removeContact = (i: number) =>
    setForm(f => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }))

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
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
        await uploadBytes(storageRef, photoFile)
        photoUrl = await getDownloadURL(storageRef)
      }
      await onSubmit({ ...form, photoUrl })
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative hover:bg-gray-200 transition-colors"
        >
          {photoPreview
            ? <img src={photoPreview} alt="Pet photo" className="w-full h-full object-cover" />
            : <span className="text-gray-400 text-sm">Tap to upload photo</span>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Name + status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pet name *</label>
          <input
            type="text" required
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => setField('status', e.target.value as PetStatus)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="active">Active</option>
            <option value="lost">Lost 🚨</option>
            <option value="found">Found ✅</option>
          </select>
        </div>
      </div>

      {/* Breed + color */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
          <input
            type="text"
            value={form.breed}
            onChange={e => setField('breed', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="text"
            value={form.color}
            onChange={e => setField('color', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          placeholder="Personality, habits, how to approach them…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>

      {/* Medical notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medical notes</label>
        <textarea
          rows={2}
          value={form.medicalNotes}
          onChange={e => setField('medicalNotes', e.target.value)}
          placeholder="Allergies, medications, vet contact…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>

      {/* Contacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Emergency contacts</label>
          {form.contacts.length < 3 && (
            <button type="button" onClick={addContact} className="text-xs text-orange-500 font-medium hover:underline">
              + Add contact
            </button>
          )}
        </div>
        <div className="space-y-3">
          {form.contacts.map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="primaryContact"
                    checked={c.isPrimary}
                    onChange={() => setContact(i, 'isPrimary', true)}
                    className="accent-orange-500"
                  />
                  Primary contact
                </label>
                {form.contacts.length > 1 && (
                  <button type="button" onClick={() => removeContact(i)} className="text-xs text-red-400 hover:text-red-600">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" required placeholder="Name"
                  value={c.name}
                  onChange={e => setContact(i, 'name', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="tel" required placeholder="Phone"
                  value={c.phone}
                  onChange={e => setContact(i, 'phone', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <input
                type="text" placeholder="Relationship (owner, vet, neighbor…)"
                value={c.relationship}
                onChange={e => setContact(i, 'relationship', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

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
