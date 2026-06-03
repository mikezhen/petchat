'use client'

interface Props {
  open: boolean
  onLeave: () => void
  onStay: () => void
}

export default function UnsavedChangesModal({ open, onLeave, onStay }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onStay} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-5"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-3xl" aria-hidden="true">⚠️</span>
          <h2 id="unsaved-title" className="text-lg font-semibold text-gray-900">Unsaved changes</h2>
          <p className="text-sm text-gray-600">
            You have changes that haven&apos;t been saved. If you leave now, they&apos;ll be lost.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onStay}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg py-2.5 transition-colors"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="w-full border border-gray-300 text-gray-700 font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
          >
            Leave without saving
          </button>
        </div>
      </div>
    </div>
  )
}
