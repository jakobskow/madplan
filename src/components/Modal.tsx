export function Modal({
  title,
  onClose,
  children,
  wide
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 flex items-start justify-center p-4 overflow-y-auto">
      <div className={`card w-full ${wide ? 'max-w-3xl' : 'max-w-md'} mt-10 overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-cream/50">
          <h2 className="font-display text-lg text-ink">{title}</h2>
          <button className="btn btn-ghost !px-2" onClick={onClose} aria-label="Luk">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
