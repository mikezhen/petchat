'use client'

export type SaveStatus = 'idle' | 'saving' | 'saved'

interface Props {
  status: SaveStatus
  /** Disable the button when there's nothing to save. */
  disabled?: boolean
  idleLabel?: string
}

export default function SaveButton({ status, disabled = false, idleLabel = 'Save' }: Props) {
  const isSaved = status === 'saved'
  const inactive = status === 'idle' && disabled

  const color = isSaved ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'
  const dim = inactive ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      type="submit"
      disabled={disabled || status !== 'idle'}
      className={`w-full font-semibold rounded-lg py-3 text-white transition-colors inline-flex items-center justify-center gap-2 ${color} ${dim}`}
    >
      {status === 'idle' && idleLabel}
      {status === 'saving' && 'Saving…'}
      {isSaved && (
        <>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
            <path className="animate-draw-check" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Saved
        </>
      )}
    </button>
  )
}
