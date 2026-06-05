'use client'

export const dynamic = 'force-static'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { createPet, getPetsByOwner, newPetId } from '@/lib/pets'
import { getUser } from '@/lib/users'
import { ACTIVE_PET_LIMIT, TOTAL_PET_LIMIT } from '@/lib/petLimits'
import PetForm from '@/components/PetForm'
import BackArrow from '@/components/BackArrow'
import UnsavedChangesModal from '@/components/UnsavedChangesModal'
import { useUnsavedChanges } from '@/lib/useUnsavedChanges'
import type { Pet, UserProfile } from '@/types'

export default function NewPetPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null)
  const [limitError, setLimitError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [newId] = useState(() => newPetId())
  const leave = useUnsavedChanges(isDirty)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    Promise.all([getUser(user.uid), getPetsByOwner(user.uid)]).then(([profile, pets]) => {
      setOwnerProfile(profile)
      const activeCount = pets.filter(p => p.status !== 'inactive').length
      const totalCount = pets.length
      if (totalCount >= TOTAL_PET_LIMIT) {
        setLimitError(`You've reached the maximum of ${TOTAL_PET_LIMIT} pets. Remove inactive pets to add more.`)
      } else if (activeCount >= ACTIVE_PET_LIMIT) {
        setLimitError(`You've reached the limit of ${ACTIVE_PET_LIMIT} active pets. Set a pet as inactive before adding another.`)
      }
      setReady(true)
    })
  }, [user])

  const handleSubmit = async (data: Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<string | void> => {
    if (!user) return
    await createPet(newId, user.uid, data)
    return `/dashboard/qr?id=${newId}`
  }

  if (loading || !user || !ready) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={leave.requestLeave}
          aria-label="Back to dashboard"
          className="-ml-1 text-gray-700 hover:text-gray-900"
        >
          <BackArrow />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Add New Pet</h1>
      </header>

      <UnsavedChangesModal
        open={leave.promptOpen}
        onLeave={leave.confirmLeave}
        onStay={leave.cancelLeave}
      />
      <main className="max-w-lg mx-auto p-4">
        {limitError ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-3">
            <span className="text-4xl" aria-hidden="true">🐾</span>
            <p className="font-semibold text-gray-900">Pet limit reached</p>
            <p className="text-sm text-gray-600">{limitError}</p>
            <Link
              href="/dashboard"
              className="inline-block mt-2 text-sm text-orange-600 font-medium hover:underline"
            >
              ← Back To Dashboard
            </Link>
          </div>
        ) : (
          <PetForm
            petId={newId}
            ownerUid={user.uid}
            ownerProfile={ownerProfile!}
            onSubmit={handleSubmit}
            hideStatus
            onDirtyChange={setIsDirty}
          />
        )}
      </main>
    </div>
  )
}
