import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { sendScanAlert } from '@/lib/resend'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

async function isRateLimited(petId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
  const snap = await getAdminDb()
    .collection('pets').doc(petId)
    .collection('scanEvents')
    .where('scannedAt', '>', Timestamp.fromDate(windowStart))
    .count()
    .get()
  return snap.data().count >= RATE_LIMIT_MAX
}

export async function POST(req: NextRequest) {
  try {
    const { petId, latitude, longitude } = await req.json()

    if (!petId || typeof petId !== 'string') {
      return NextResponse.json({ error: 'Missing petId' }, { status: 400 })
    }

    if (await isRateLimited(petId)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const scannedAt = new Date()

    await getAdminDb().collection('pets').doc(petId)
      .collection('scanEvents').add({
        scannedAt: Timestamp.fromDate(scannedAt),
        latitude: typeof latitude === 'number' ? latitude : null,
        longitude: typeof longitude === 'number' ? longitude : null,
        userAgent: req.headers.get('user-agent') ?? null,
      })

    const petDoc = await getAdminDb().collection('pets').doc(petId).get()
    if (!petDoc.exists) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const pet = petDoc.data()!
    const ownerDoc = await getAdminDb().collection('users').doc(pet.ownerId).get()
    if (!ownerDoc.exists) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    const owner = ownerDoc.data()!

    await sendScanAlert({
      ownerEmail: owner.email,
      ownerName: owner.fullName,
      petName: pet.name,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      scannedAt,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[scan] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
