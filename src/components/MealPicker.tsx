import { useMemo, useState } from 'react'
import { Meal, Category, CATEGORY_LABELS } from '../types'
import { Modal } from './Modal'

export function MealPicker({
  meals,
  category,
  onPick,
  onClear,
  onClose
}: {
  meals: Meal[]
  category: Category
  onPick: (mealId: string) => void
  onClear: () => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])

  const relevant = useMemo(() => meals.filter((m) => m.category === category), [meals, category])
  const allTags = useMemo(() => Array.from(new Set(relevant.flatMap((m) => m.tags))).sort(), [relevant])

  const filtered = relevant.filter((m) => {
    if (activeTags.length && !activeTags.every((t) => m.tags.includes(t))) return false
    if (search) {
      const q = search.toLowerCase()
      if (!m.name.toLowerCase().includes(q) && !(m.description ?? '').toLowerCase().includes(q))
        return false
    }
    return true
  })

  function toggleTag(t: string) {
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  return (
    <Modal title={`Vælg ${CATEGORY_LABELS[category]}`} onClose={onClose} wide>
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <input
            className="input max-w-xs"
            placeholder="Søg…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={onClear}>
            Ryd slot
          </button>
        </div>
        {allTags.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Tags:</div>
            {allTags.map((t) => (
              <span
                key={t}
                onClick={() => toggleTag(t)}
                className={`tag cursor-pointer ${activeTags.includes(t) ? 'tag-on' : ''}`}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="max-h-96 overflow-y-auto border rounded">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              className="block w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-0"
            >
              <div className="font-medium">{m.name}</div>
              {m.description && <div className="text-xs text-gray-600">{m.description}</div>}
              {m.tags.length > 0 && (
                <div className="mt-1">
                  {m.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-gray-500">Ingen måltider i denne kategori.</div>
          )}
        </div>
      </div>
    </Modal>
  )
}
