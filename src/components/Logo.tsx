export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <circle cx="20" cy="20" r="19" fill="#F4D9CC" />
        <path
          d="M8 22 Q 20 34, 32 22"
          stroke="#D87456"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M20 8 V 15" stroke="#5E7D56" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="20" cy="6" r="2" fill="#5E7D56" />
        <path d="M15 22 Q 20 27, 25 22" stroke="#B85E44" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6" />
      </svg>
      <div className="leading-tight">
        <div className="font-display text-[20px] font-semibold text-ink">Madplan</div>
      </div>
    </div>
  )
}
