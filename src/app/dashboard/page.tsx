'use client'

export const dynamic = 'force-static'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { getFirebaseAuth } from '@/lib/firebase'
import { getPetsByOwner } from '@/lib/pets'
import type { Pet } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  lost:   'bg-red-100 text-red-700',
  found:  'bg-green-100 text-green-700',
  active: 'bg-gray-100 text-gray-600',
}

const STATUS_LABEL: Record<string, string> = {
  lost: 'Lost', found: 'Found', active: 'Active',
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [petsLoading, setPetsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getPetsByOwner(user.uid)
      .then(setPets)
      .finally(() => setPetsLoading(false))
  }, [user])

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-orange-500">🐾 PawCode</span>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile" className="text-sm text-gray-700 hover:text-gray-900">
            Profile
          </Link>
          <button
            onClick={() => signOut(getFirebaseAuth()).then(() => router.push('/login'))}
            className="text-sm text-gray-700 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Pets</h1>
          <Link
            href="/dashboard/pets/new"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Add pet
          </Link>
        </div>

        {petsLoading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : pets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <span className="text-5xl" aria-hidden="true">🐶</span>
            <p className="mt-4 text-gray-900 font-medium">No pets yet</p>
            <p className="text-sm text-gray-600 mt-1">Add your first pet to get a QR tag</p>
            <Link
              href="/dashboard/pets/new"
              className="inline-block mt-4 bg-orange-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg"
            >
              Add pet
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map(pet => (
              <div key={pet.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                  {pet.photoUrl
                    ? <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" />
                    : <span aria-hidden="true">🐾</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{pet.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[pet.status]}`}>
                      {STATUS_LABEL[pet.status]}
                    </span>
                  </div>
                  {pet.breed && <p className="text-sm text-gray-600 truncate">{pet.breed}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/dashboard/qr?id=${pet.id}`}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    QR
                  </Link>
                  <Link
                    href={`/dashboard/edit?id=${pet.id}`}
                    className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
