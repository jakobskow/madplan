import { useState } from 'react'

export function TagSelector({
  value,
  suggestions,
  onChange
}: {
  value: string[]
  suggestions: string[]
  onChange: (next: string[]) => void
}) {
  const [input, setInput] = useState('')

  function add(tag: string) {
    const t = tag.trim().toLowerCase()
    if (!t) return
    if (value.includes(t)) return
    onChange([...value, t])
    setInput('')
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag))
  }

  const filtered = suggestions.filter((s) => !value.includes(s) && s.includes(input.toLowerCase()))

  return (
    <div>
      <div className="mb-2">
        {value.map((t) => (
          <span key={t} className="tag tag-on cursor-pointer" onClick={() => remove(t)}>
            {t} ✕
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Tilføj tag (fx kylling, avokado)…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(input)
            }
          }}
        />
        <button type="button" className="btn btn-secondary" onClick={() => add(input)}>
          Tilføj
        </button>
      </div>
      {input && filtered.length > 0 && (
        <div className="mt-2">
          {filtered.slice(0, 12).map((s) => (
            <span key={s} className="tag cursor-pointer" onClick={() => add(s)}>
              + {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
