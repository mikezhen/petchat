'use client'

export const dynamic = 'force-static'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getPet, updatePet } from '@/lib/pets'
import { getUser } from '@/lib/users'
import PetForm from '@/components/PetForm'
import type { Pet, UserProfile } from '@/types'
import Link from 'next/link'

function EditPageInner() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const { user } = useAuth()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user) return
    Promise.all([getPet(id), getUser(user.uid)]).then(([p, profile]) => {
      setPet(p)
      setOwnerProfile(profile)
      setLoading(false)
    })
  }, [id, user])

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-600">Loading…</div>
  if (!pet || pet.ownerId !== user?.uid || !ownerProfile) return <div className="p-4 text-red-700">Not found</div>

  const handleSubmit = async (data: Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    await updatePet(id, data)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">←</Link>
        <h1 className="text-lg font-semibold text-gray-900">Edit {pet.name}</h1>
      </header>
      <main className="max-w-lg mx-auto p-4">
        <PetForm initial={pet} petId={id} ownerProfile={ownerProfile} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </main>
    </div>
  )
}

export default function EditPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-600">Loading…</div>}>
      <EditPageInner />
    </Suspense>
  )
}
