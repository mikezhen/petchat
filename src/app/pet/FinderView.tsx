'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import type { Pet, EmergencyContact } from '@/types'
import { Timestamp } from 'firebase/firestore'

const STATUS_STYLES: Record<string, string> = {
  lost:   'bg-red-500 text-white',
  found:  'bg-green-500 text-white',
  active: 'bg-gray-200 text-gray-700',
}

const STATUS_LABEL: Record<string, string> = {
  lost:   '🚨 LOST',
  found:  '✅ FOUND',
  active: 'Has a home',
}

function ContactButtons({ contacts }: { contacts: EmergencyContact[] }) {
  const primary = contacts.find(c => c.isPrimary) ?? contacts[0]
  if (!primary) return null

  const phone = primary.phone.replace(/\D/g, '')

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700 text-center">Contact {primary.name}</p>
      <div className="grid grid-cols-3 gap-2">
        <a href={`tel:${phone}`} className="flex flex-col items-center gap-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-4 transition-colors">
          <span className="text-2xl" aria-hidden="true">📞</span>
          <span className="text-xs font-medium">Call</span>
        </a>
        <a href={`sms:${phone}`} className="flex flex-col items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-4 transition-colors">
          <span className="text-2xl" aria-hidden="true">💬</span>
          <span className="text-xs font-medium">Text</span>
        </a>
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-4 transition-colors">
          <span className="text-2xl" aria-hidden="true">📱</span>
          <span className="text-xs font-medium">WhatsApp</span>
        </a>
      </div>
      {contacts.length > 1 && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-gray-600 text-center font-medium">Also try</p>
          {contacts.filter(c => !c.isPrimary).map((c, i) => (
            <a key={i} href={`tel:${c.phone.replace(/\D/g, '')}`} className="flex items-center justify-between w-full bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 transition-colors">
              <span className="text-sm font-medium text-gray-900">{c.name}</span>
              <span className="text-sm text-gray-600">{c.relationship} · {c.phone}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FinderView({ petId }: { petId: string }) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), 'pets', petId))
        if (!snap.exists()) { setNotFound(true); return }
        const d = snap.data()
        setPet({
          id: snap.id,
          ownerId: d.ownerId,
          name: d.name,
          photoUrl: d.photoUrl ?? null,
          breed: d.breed ?? '',
          color: d.color ?? '',
          description: d.description ?? '',
          status: d.status ?? 'active',
          medicalNotes: d.medicalNotes ?? '',
          contacts: d.contacts ?? [],
          createdAt: (d.createdAt as Timestamp)?.toDate() ?? new Date(),
          updatedAt: (d.updatedAt as Timestamp)?.toDate() ?? new Date(),
        })
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [petId])

  // Log scan event to Firestore — Cloud Function picks it up and sends email
  useEffect(() => {
    if (!petId) return
    const logScan = async () => {
      try {
        let latitude: number | null = null
        let longitude: number | null = null

        if (navigator.geolocation) {
          await new Promise<void>(resolve => {
            navigator.geolocation.getCurrentPosition(
              pos => { latitude = pos.coords.latitude; longitude = pos.coords.longitude; resolve() },
              () => resolve(),
              { timeout: 5000 }
            )
          })
        }

        await addDoc(
          collection(getFirebaseDb(), 'pets', petId, 'scanEvents'),
          {
            scannedAt: serverTimestamp(),
            latitude,
            longitude,
            userAgent: navigator.userAgent,
          }
        )
      } catch {
        // Non-critical — don't surface to finder
      }
    }
    logScan()
  }, [petId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading…</p>
      </div>
    )
  }

  if (notFound || !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-5xl" aria-hidden="true">🐾</span>
          <p className="mt-4 text-gray-900 font-medium">Pet not found</p>
          <p className="text-sm text-gray-600 mt-1">This tag may no longer be active.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm">

        {pet.status === 'lost' && (
          <div className="bg-red-500 text-white text-center py-3 px-4">
            <p className="font-bold text-lg">🚨 This pet is LOST</p>
            <p className="text-sm opacity-90">Please contact the owner using the buttons below</p>
          </div>
        )}

        <div className="relative w-full aspect-square bg-gray-100">
          {pet.photoUrl
            ? <img src={pet.photoUrl} alt={`Photo of ${pet.name}`} className="w-full h-full object-cover" />
            : <div className="flex items-center justify-center h-full text-7xl" aria-hidden="true">🐾</div>
          }
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${STATUS_STYLES[pet.status]}`}>
            {STATUS_LABEL[pet.status]}
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
            {(pet.breed || pet.color) && (
              <p className="text-gray-700 mt-1">{[pet.breed, pet.color].filter(Boolean).join(' · ')}</p>
            )}
          </div>

          {pet.medicalNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 font-semibold text-sm mb-1">⚠️ Medical Notes</p>
              <p className="text-amber-700 text-sm">{pet.medicalNotes}</p>
            </div>
          )}

          {pet.description && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">About</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{pet.description}</p>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Contact Owner</h2>
            <ContactButtons contacts={pet.contacts} />
          </div>

          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold text-orange-500">PawCode</span> — real-time pet ID tags
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
