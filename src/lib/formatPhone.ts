export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 0) return ''

  // 11 digits starting with 1 → +1 (XXX) XXX-XXXX
  if (digits.startsWith('1') && digits.length >= 11) {
    const local = digits.slice(1, 11)
    const area = local.slice(0, 3)
    const mid = local.slice(3, 6)
    const last = local.slice(6)
    if (last) return `+1 (${area}) ${mid}-${last}`
    if (mid) return `+1 (${area}) ${mid}`
    return `+1 (${area}`
  }

  // Up to 10 digits → (XXX) XXX-XXXX
  const d = digits.slice(0, 10)
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}
