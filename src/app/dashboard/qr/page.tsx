'use client'

export const dynamic = 'force-static'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import QRCode from 'qrcode'
import Link from 'next/link'

function QRPageInner() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [petName, setPetName] = useState<string | null>(null)
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pet?id=${id}`

  useEffect(() => {
    if (!id) return
    getDoc(doc(getFirebaseDb(), 'pets', id)).then(snap => {
      if (snap.exists()) setPetName(snap.data().name ?? null)
    }).catch(() => {})
  }, [id])

  useEffect(() => {
    if (!canvasRef.current || !id) return
    QRCode.toCanvas(canvasRef.current, profileUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }, (err) => {
      if (!err && canvasRef.current) setDataUrl(canvasRef.current.toDataURL('image/png'))
    })
  }, [id, profileUrl])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">←</Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {petName ? `${petName}'s QR Code` : 'QR Code'}
          </h1>
          {petName && <p className="text-xs text-gray-400">{`Scan to view ${petName}'s profile`}</p>}
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 flex flex-col items-center gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4 w-full">
          <canvas ref={canvasRef} className="rounded-xl" />
          <p className="text-xs text-gray-400 text-center break-all">{profileUrl}</p>
        </div>

        {dataUrl && (
          <a
            href={dataUrl}
            download="pawcode-qr.png"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-center rounded-lg py-3 transition-colors"
          >
            Download QR Code (PNG)
          </a>
        )}

        <div className="bg-amber-100 border border-amber-100 rounded-xl p-4 w-full text-sm text-amber-800 space-y-1">
          <p className="font-semibold">Engraving tips</p>
          <ul className="list-disc list-inside space-y-1 text-amber-700">
            <li>Minimum tag size: 1 inch × 1 inch</li>
            <li>Request laser engraving, not stamping</li>
            <li>High contrast (black on silver/gold works best)</li>
            <li>Test scan the QR before attaching to collar</li>
          </ul>
        </div>

        <Link href={`/pet?id=${id}`} target="_blank" className="text-sm text-orange-500 hover:underline">
          Preview finder page →
        </Link>
      </main>
    </div>
  )
}

export default function QRPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>}>
      <QRPageInner />
    </Suspense>
  )
}
