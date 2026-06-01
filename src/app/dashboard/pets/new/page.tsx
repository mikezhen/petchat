'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createPet } from '@/lib/pets'
import PetForm from '@/components/PetForm'
import type { Pet } from '@/types'
import Link from 'next/link'

export default function NewPetPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (data: Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return
    const petId = await createPet(user.uid, data)
    router.push(`/dashboard/pets/${petId}/qr`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-lg font-semibold text-gray-900">Add new pet</h1>
      </header>
      <main className="max-w-lg mx-auto p-4">
        <PetForm onSubmit={handleSubmit} submitLabel="Save & get QR code" />
      </main>
    </div>
  )
}
