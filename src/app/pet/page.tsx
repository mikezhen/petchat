'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import FinderView from './FinderView'

function PetPageInner() {
  const params = useSearchParams()
  const petId = params.get('id')

  if (!petId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-5xl">🐾</span>
          <p className="mt-4 text-gray-600 font-medium">Invalid pet tag</p>
          <p className="text-sm text-gray-400 mt-1">This QR code does not link to a valid pet profile.</p>
        </div>
      </div>
    )
  }

  return <FinderView petId={petId} />
}

export default function PetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading…</p>
      </div>
    }>
      <PetPageInner />
    </Suspense>
  )
}
