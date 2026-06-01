import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

export async function sendScanAlert({
  ownerEmail,
  ownerName,
  petName,
  latitude,
  longitude,
  scannedAt,
}: {
  ownerEmail: string
  ownerName: string
  petName: string
  latitude: number | null
  longitude: number | null
  scannedAt: Date
}) {
  const locationText = latitude && longitude
    ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    : 'Location not shared by finder'

  const mapsUrl = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null

  await getResend().emails.send({
    from: 'PawCode Alerts <alerts@pawcode.app>',
    to: ownerEmail,
    subject: `🐾 Someone scanned ${petName}'s tag!`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #f97316;">Someone found ${petName}!</h2>
        <p>Hi ${ownerName},</p>
        <p>
          A good samaritan just scanned <strong>${petName}</strong>'s PawCode tag.
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
          ${petName}'s status in your PawCode dashboard.
        </p>
      </div>
    `,
  })
}
