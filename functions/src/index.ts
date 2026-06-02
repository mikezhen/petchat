import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { defineSecret } from 'firebase-functions/params'
import { Resend } from 'resend'

initializeApp()

const resendApiKey = defineSecret('RESEND_API_KEY')

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export const onScanEvent = onDocumentCreated(
  {
    document: 'pets/{petId}/scanEvents/{scanId}',
    secrets: [resendApiKey],
  },
  async (event) => {
    const db = getFirestore()
    const { petId } = event.params
    const scanData = event.data?.data()
    if (!scanData) return

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

    const scannedAt = (scanData.scannedAt as Timestamp).toDate()
    const latitude: number | null = scanData.latitude ?? null
    const longitude: number | null = scanData.longitude ?? null

    const locationText = latitude && longitude
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : 'Location not shared by finder'

    const mapsUrl = latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null

    const resend = new Resend(resendApiKey.value())

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
)
