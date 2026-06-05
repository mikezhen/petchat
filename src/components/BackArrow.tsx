/** Bold back chevron used in page headers. Inherits color via currentColor. */
export default function BackArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`w-6 h-6 ${className}`}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
