import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { setGlobalOptions } from 'firebase-functions/v2'
// import { onDocumentCreated } from 'firebase-functions/v2/firestore' // re-enable with trigger below
// import { defineSecret } from 'firebase-functions/params'            // re-enable with trigger below
import { Resend } from 'resend'

initializeApp()

// Cap concurrency across every function so a traffic spike or abuse can't fan
// out into runaway invocation cost. Tune per-function with their own options
// if a specific workload needs more headroom.
setGlobalOptions({ maxInstances: 10 })

// const resendApiKey = defineSecret('resend-api-key') // re-enable with trigger below

export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export interface ScanEventData {
  scannedAt: Timestamp
  latitude?: number | null
  longitude?: number | null
  userAgent?: string | null
}

export interface ScanEventContext {
  petId: string
  data: ScanEventData | null
  getResendApiKey: () => string
}

export async function handleScanEvent(ctx: ScanEventContext): Promise<void> {
  const { petId, data } = ctx
  if (!data) return

  const db = getFirestore()

  // Rate limit: count scans in the past hour (including this one)
  const windowStart = Timestamp.fromDate(new Date(Date.now() - RATE_LIMIT_WINDOW_MS))
  const recentSnap = await db
    .collection('pets').doc(petId)
    .collection('scanEvents')
    .where('scannedAt', '>', windowStart)
    .count()
    .get()

  if (recentSnap.data().count > RATE_LIMIT_MAX) return

  // Fetch pet + owner
  const petDoc = await db.collection('pets').doc(petId).get()
  if (!petDoc.exists) return
  const pet = petDoc.data()!

  const ownerDoc = await db.collection('users').doc(pet.ownerId).get()
  if (!ownerDoc.exists) return
  const owner = ownerDoc.data()!

  const scannedAt = data.scannedAt.toDate()
  const latitude: number | null = data.latitude ?? null
  const longitude: number | null = data.longitude ?? null

  const locationText = latitude && longitude
    ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    : 'Location not shared by finder'

  const mapsUrl = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null

  const resend = new Resend(ctx.getResendApiKey())

  await resend.emails.send({
    from: 'PawCode Alerts <alerts@pawcode.app>',
    to: owner.email as string,
    subject: `🐾 Someone scanned ${pet.name as string}'s tag!`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #f97316;">Someone found ${pet.name}!</h2>
        <p>Hi ${owner.fullName},</p>
        <p>
          A good samaritan just scanned <strong>${pet.name}</strong>'s PawCode tag.
          They can see your contact information and may be reaching out shortly.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; background: #f9fafb; font-weight: bold;">Time</td>
            <td style="padding: 8px;">${scannedAt.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f9fafb; font-weight: bold;">Location</td>
            <td style="padding: 8px;">
              ${locationText}
              ${mapsUrl ? `<br/><a href="${mapsUrl}" style="color: #f97316;">View on Google Maps</a>` : ''}
            </td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 14px;">
          If your pet is not lost, no action needed. You can update
          ${pet.name}'s status in your PawCode dashboard.
        </p>
      </div>
    `,
  })
}

// Trigger disabled until a custom domain is available for Resend.
// To re-enable: uncomment and redeploy.
//
// export const onScanEvent = onDocumentCreated(
//   {
//     document: 'pets/{petId}/scanEvents/{scanId}',
//     secrets: [resendApiKey],
//   },
//   async (event) => {
//     await handleScanEvent({
//       petId: event.params.petId,
//       data: event.data?.data() as ScanEventData | null ?? null,
//       getResendApiKey: () => resendApiKey.value(),
//     })
//   }
// )
