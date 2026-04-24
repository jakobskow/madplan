import { useEffect, useMemo, useState } from 'react'
import { Meal, Category, CATEGORIES, CATEGORY_LABELS } from '../types'
import { listMeals, createMeal, updateMeal, deleteMeal } from '../lib/data'
import { MealForm } from '../components/MealForm'
import { Modal } from '../components/Modal'

const CAT_EMOJI: Record<Category, string> = {
  morgenmad: '🥣',
  snack: '🍪',
  frokost: '🥪',
  aftensmad: '🍲'
}

const CAT_BADGE: Record<Category, string> = {
  morgenmad: 'bg-mustard/15 text-mustard border-mustard/30',
  snack: 'bg-sage-soft text-sage-dark border-sage/40',
  frokost: 'bg-terracotta-soft text-terracotta-dark border-terracotta/40',
  aftensmad: 'bg-terracotta/15 text-terracotta-dark border-terracotta/40'
}

export default function Library() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [editing, setEditing] = useState<Meal | null>(null)
  const [creating, setCreating] = useState(false)

  async function refresh() {
    setMeals(await listMeals())
  }
  useEffect(() => {
    refresh()
  }, [])

  const allTags = useMemo(
    () => Array.from(new Set(meals.flatMap((m) => m.tags))).sort(),
    [meals]
  )

  const filtered = useMemo(() => {
    return meals.filter((m) => {
      if (cat !== 'all' && m.category !== cat) return false
      if (activeTags.length && !activeTags.every((t) => m.tags.includes(t))) return false
      if (search) {
        const q = search.toLowerCase()
        if (!m.name.toLowerCase().includes(q) && !(m.description ?? '').toLowerCase().includes(q))
          return false
      }
      return true
    })
  }, [meals, cat, activeTags, search])

  function toggleTag(t: string) {
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Bibliotek</h1>
          <p className="text-muted text-sm mt-1">
            Dine måltider — tag dem, søg dem, brug dem igen.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          + Nyt måltid
        </button>
      </div>

      <div className="card p-4 mb-5 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            className="input max-w-xs"
            placeholder="🔍 Søg på navn eller ingrediens…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              className={`btn ${cat === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCat('all')}
            >
              Alle
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`btn ${cat === c ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCat(c)}
              >
                <span>{CAT_EMOJI[c]}</span>
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
        {allTags.length > 0 && (
          <div>
            <div className="text-xs text-muted mb-1.5 font-medium uppercase tracking-wide">
              Hovedingredienser
            </div>
            <div className="flex flex-wrap">
              {allTags.map((t) => (
                <span
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`tag cursor-pointer ${activeTags.includes(t) ? 'tag-on' : ''}`}
                >
                  {t}
                </span>
              ))}
              {activeTags.length > 0 && (
                <button className="btn btn-ghost text-xs" onClick={() => setActiveTags([])}>
                  Ryd
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-muted mb-3">{filtered.length} måltid(er)</div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-display text-lg font-semibold text-ink leading-tight">
                {m.name}
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${CAT_BADGE[m.category]}`}
              >
                {CAT_EMOJI[m.category]} {CATEGORY_LABELS[m.category]}
              </span>
            </div>
            {m.description && (
              <div className="text-sm text-muted mb-3">{m.description}</div>
            )}
            {m.tags.length > 0 && (
              <div className="mb-3">
                {m.tags.map((t) => (
                  <span key={t} className="tag tag-sage">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-line">
              <button className="btn btn-ghost text-xs" onClick={() => setEditing(m)}>
                ✎ Redigér
              </button>
              <button
                className="btn btn-ghost text-xs text-red-600 hover:bg-red-50"
                onClick={async () => {
                  if (confirm(`Slet "${m.name}"?`)) {
                    await deleteMeal(m.id)
                    refresh()
                  }
                }}
              >
                🗑 Slet
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-muted col-span-full text-center py-12 font-display italic">
            Ingen måltider matcher — prøv at rydde filteret.
          </div>
        )}
      </div>

      {creating && (
        <Modal title="Nyt måltid" onClose={() => setCreating(false)}>
          <MealForm
            allTags={allTags}
            onCancel={() => setCreating(false)}
            onSave={async (m) => {
              await createMeal(m)
              setCreating(false)
              refresh()
            }}
          />
        </Modal>
      )}
      {editing && (
        <Modal title="Redigér måltid" onClose={() => setEditing(null)}>
          <MealForm
            initial={editing}
            allTags={allTags}
            onCancel={() => setEditing(null)}
            onSave={async (m) => {
              await updateMeal(editing.id, m)
              setEditing(null)
              refresh()
            }}
          />
        </Modal>
      )}
    </div>
  )
}
