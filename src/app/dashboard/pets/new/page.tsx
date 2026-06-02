'use client'

export const dynamic = 'force-static'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { createPet } from '@/lib/pets'
import { getUser } from '@/lib/users'
import PetForm from '@/components/PetForm'
import type { Pet, UserProfile } from '@/types'

export default function NewPetPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [ownerProfile, setOwnerProfile] = useState<Pick<UserProfile, 'fullName' | 'phone' | 'hasWhatsApp'> | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getUser(user.uid).then(profile => {
      setOwnerProfile({
        fullName: profile?.fullName ?? '',
        phone: profile?.phone ?? '',
        hasWhatsApp: profile?.hasWhatsApp ?? false,
      })
    })
  }, [user])

  const handleSubmit = async (data: Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return
    const petId = await createPet(user.uid, data)
    router.push(`/dashboard/qr?id=${petId}`)
  }

  if (loading || !user || ownerProfile === null) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">←</Link>
        <h1 className="text-lg font-semibold text-gray-900">Add new pet</h1>
      </header>
      <main className="max-w-lg mx-auto p-4">
        <PetForm
          ownerProfile={ownerProfile}
          onSubmit={handleSubmit}
          submitLabel="Save & get QR code"
        />
      </main>
    </div>
  )
}
