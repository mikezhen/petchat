'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getPet, updatePet } from '@/lib/pets'
import PetForm from '@/components/PetForm'
import type { Pet } from '@/types'
import Link from 'next/link'

export default function EditPetPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getPet(id).then(p => {
      setPet(p)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>
  if (!pet || pet.ownerId !== user?.uid) return <div className="p-4 text-red-500">Not found</div>

  const handleSubmit = async (data: Omit<Pet, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    await updatePet(id, data)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-lg font-semibold text-gray-900">Edit {pet.name}</h1>
      </header>
      <main className="max-w-lg mx-auto p-4">
        <PetForm
          initial={pet}
          petId={id}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </main>
    </div>
  )
}
