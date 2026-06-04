'use client'

export const dynamic = 'force-static'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { getFirebaseAuth } from '@/lib/firebase'
import { getPetsByOwner, updatePet, deletePet } from '@/lib/pets'
import { getUser } from '@/lib/users'
import { canAddPet, addPetLimitMessage } from '@/lib/petLimits'
import type { Pet, UserProfile } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  lost:     'bg-red-100 text-red-700',
  active:   'bg-gray-100 text-gray-600',
  inactive: 'bg-gray-200 text-gray-400',
}

const STATUS_LABEL: Record<string, string> = {
  lost: 'Lost', active: 'Active', inactive: 'Inactive',
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [petsLoading, setPetsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Pet | null>(null)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getPetsByOwner(user.uid).then(setPets).finally(() => setPetsLoading(false))
    getUser(user.uid).then(setUserProfile)
  }, [user])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  const toggleStatus = async (pet: Pet) => {
    const next = pet.status === 'lost' ? 'active' : 'lost'
    await updatePet(pet.id, { status: next })
    setPets(ps => ps.map(p => p.id === pet.id ? { ...p, status: next } : p))
  }

  const setInactive = async (pet: Pet) => {
    await updatePet(pet.id, { status: 'inactive' })
    setPets(ps => ps.map(p => p.id === pet.id ? { ...p, status: 'inactive' } : p))
  }

  const reactivate = async (pet: Pet) => {
    await updatePet(pet.id, { status: 'active' })
    setPets(ps => ps.map(p => p.id === pet.id ? { ...p, status: 'active' } : p))
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deletePet(confirmDelete.id, confirmDelete.ownerId)
      setPets(ps => ps.filter(p => p.id !== confirmDelete.id))
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleSignOut = () => {
    signOut(getFirebaseAuth()).then(() => router.push('/login'))
  }

  if (loading || !user) return null

  const firstName = userProfile?.fullName?.split(' ')[0] ?? user.email ?? ''
  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (user.email?.[0] ?? '?').toUpperCase()

  // Active/lost first, inactive at bottom; newest first within each bucket
  const sortedPets = [...pets].sort((a, b) => {
    const aInactive = a.status === 'inactive'
    const bInactive = b.status === 'inactive'
    if (aInactive !== bInactive) return aInactive ? 1 : -1
    return a.createdAt.getTime() - b.createdAt.getTime()
  })

  const canAdd = canAddPet(pets)
  const addPetLimitMsg = addPetLimitMessage(pets)

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="text-2xl font-bold text-orange-500">🐾 PawCode</span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(m => !m)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-xl px-2 py-1.5 transition-colors"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-orange-100 flex-shrink-0 flex items-center justify-center">
              {userProfile?.photoUrl
                ? <Image src={userProfile.photoUrl} alt="Profile" fill className="object-cover" />
                : <span className="text-xs font-bold text-orange-500">{initials}</span>
              }
            </div>
            <span className="text-base font-medium text-gray-700">{firstName}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-gray-400">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-40 z-20">
              <Link
                href="/dashboard/profile"
                onClick={() => setShowMenu(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Profile
              </Link>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">My Pets</h1>
          {canAdd ? (
            <Link
              href="/dashboard/pets/new"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Add Pet
            </Link>
          ) : (
            <span
              title={addPetLimitMsg}
              className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg opacity-40 cursor-not-allowed select-none"
            >
              + Add Pet
            </span>
          )}
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
              Add Pet
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPets.map(pet => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Pet info row — dimmed when inactive */}
                <div className={`flex items-center gap-4 p-4 ${pet.status === 'inactive' ? 'opacity-50' : ''}`}>
                  <div className="relative w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                    {pet.photoUrl
                      ? <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" />
                      : <span aria-hidden="true">🐾</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{pet.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BADGE[pet.status]}`}>
                        {STATUS_LABEL[pet.status]}
                      </span>
                    </div>
                    {pet.breed && <p className="text-sm text-gray-600 truncate">{pet.breed}</p>}
                  </div>
                </div>

                {pet.status === 'inactive' ? (
                  /* Inactive: QR + Reactivate + Delete */
                  <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-3 gap-2">
                    <Link
                      href={`/dashboard/qr?id=${pet.id}`}
                      className="flex items-center justify-center gap-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <rect x="0" y="0" width="5" height="5" rx="1" fill="currentColor"/>
                        <rect x="8" y="0" width="5" height="5" rx="1" fill="currentColor"/>
                        <rect x="0" y="8" width="5" height="5" rx="1" fill="currentColor"/>
                        <rect x="8" y="8" width="2" height="2" fill="currentColor"/>
                        <rect x="11" y="8" width="2" height="2" fill="currentColor"/>
                        <rect x="8" y="11" width="2" height="2" fill="currentColor"/>
                        <rect x="11" y="11" width="2" height="2" fill="currentColor"/>
                      </svg>
                      QR
                    </Link>
                    <button
                      onClick={() => reactivate(pet)}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-green-200 hover:bg-green-300 text-green-700 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <path d="M4 3.5L2 5.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 5.5H8a3 3 0 1 1-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      Reactivate
                    </button>
                    <button
                      onClick={() => setConfirmDelete(pet)}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-red-200 hover:bg-red-300 text-red-700 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <path d="M2 4h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <path d="M10 4l-.5 7h-6L3 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 4V3h3v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                ) : (
                  /* Active / Lost: QR + Edit + Status toggle + Set Inactive link */
                  <>
                    <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-3 gap-2">
                      <Link
                        href={`/dashboard/qr?id=${pet.id}`}
                        className="flex items-center justify-center gap-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <rect x="0" y="0" width="5" height="5" rx="1" fill="currentColor"/>
                          <rect x="8" y="0" width="5" height="5" rx="1" fill="currentColor"/>
                          <rect x="0" y="8" width="5" height="5" rx="1" fill="currentColor"/>
                          <rect x="8" y="8" width="2" height="2" fill="currentColor"/>
                          <rect x="11" y="8" width="2" height="2" fill="currentColor"/>
                          <rect x="8" y="11" width="2" height="2" fill="currentColor"/>
                          <rect x="11" y="11" width="2" height="2" fill="currentColor"/>
                        </svg>
                        QR
                      </Link>
                      <Link
                        href={`/dashboard/edit?id=${pet.id}`}
                        className="flex items-center justify-center gap-1.5 text-xs bg-orange-200 hover:bg-orange-300 text-orange-700 px-3 py-2 rounded-lg font-medium transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <path d="M9 1.5a1.5 1.5 0 0 1 2.5 1.5L4 11H1.5V8.5L9 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                          <path d="M7.5 3l2 2" stroke="currentColor" strokeWidth="1.3"/>
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleStatus(pet)}
                        className={`flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-colors ${
                          pet.status === 'lost'
                            ? 'bg-green-200 hover:bg-green-300 text-green-700'
                            : 'bg-red-200 hover:bg-red-300 text-red-700'
                        }`}
                      >
                        {pet.status === 'lost' ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                              <path d="M2 7l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Mark Safe
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                              <path d="M6.5 2.5l4.5 8H2l4.5-8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                              <path d="M6.5 5.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                              <circle cx="6.5" cy="9.2" r="0.65" fill="currentColor"/>
                            </svg>
                            Mark Lost
                          </>
                        )}
                      </button>
                    </div>
                    <div className="px-4 pb-3 flex justify-end">
                      <button
                        onClick={() => setInactive(pet)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <path d="M1.5 3.5h10v2h-10z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                          <path d="M2.5 5.5v5h8v-5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                          <path d="M5 8.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                        Set As Inactive
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="text-center">
              <span className="text-4xl" aria-hidden="true">⚠️</span>
              <h2 className="text-lg font-bold text-gray-900 mt-2">Delete {confirmDelete.name}?</h2>
              <p className="text-sm text-gray-600 mt-2">
                This will permanently delete <span className="font-semibold">{confirmDelete.name}</span> and all associated data including scan history. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold rounded-lg py-2.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
