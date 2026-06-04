import { useRef } from 'react'

export const SEND_COOLDOWN_MS = 60_000

/**
 * Throttles repeated "send" actions (e.g. magic-link emails) within a browser
 * session to curb accidental or casual repeat-sends.
 *
 * Note: this is a client-side guard only — a scripted attacker can call the
 * Firebase Auth API directly and bypass it. Real abuse protection comes from
 * App Check on Authentication + Firebase's built-in per-IP/project quotas.
 */
export function useSendCooldown(cooldownMs = SEND_COOLDOWN_MS) {
  const lastSentRef = useRef(0)
  return {
    /** Whether a send is currently allowed (outside the cooldown window). */
    canSend(): boolean {
      return Date.now() - lastSentRef.current >= cooldownMs
    },
    /** Record that a send just happened, starting the cooldown window. */
    markSent(): void {
      lastSentRef.current = Date.now()
    },
  }
}
