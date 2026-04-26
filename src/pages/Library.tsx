import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Meal, Category, CATEGORIES, CATEGORY_LABELS } from '../types'
import { listMeals, createMeal, updateMeal, deleteMeal } from '../lib/data'
import { importMealFromUrl, ImportedMeal } from '../lib/importMeal'
import { MealForm } from '../components/MealForm'
import { Modal } from '../components/Modal'
import { isCloudMode } from '../lib/data'

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
  const [saveError, setSaveError] = useState<string | null>(null)

  // Import fra Instagram
  const [searchParams, setSearchParams] = useSearchParams()
  const [showImport, setShowImport] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importPreview, setImportPreview] = useState<ImportedMeal | null>(null)

  async function refresh() {
    setMeals(await listMeals())
  }
  useEffect(() => {
    refresh()
  }, [])

  // Håndter ?import=URL fra Web Share Target og iOS Shortcuts
  useEffect(() => {
    const urlParam = searchParams.get('import')
    if (urlParam) {
      setImportUrl(urlParam)
      setShowImport(true)
      setSearchParams({}, { replace: true }) // Ryd URL-param
      handleImport(urlParam) // Start parse med det samme
    }
  }, []) // Kun ved mount

  async function handleImport(url?: string) {
    const target = url ?? importUrl
    if (!target.trim()) return
    setImporting(true)
    setImportError(null)
    setImportPreview(null)
    try {
      const result = await importMealFromUrl(target.trim())
      setImportPreview(result)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Ukendt fejl')
    } finally {
      setImporting(false)
    }
  }

  function closeImport() {
    setShowImport(false)
    setImportUrl('')
    setImportPreview(null)
    setImportError(null)
  }

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
        <div className="flex gap-2">
          {isCloudMode() && (
            <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
              📸 Importér fra link
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            + Nyt måltid
          </button>
        </div>
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
      {/* Import fra Instagram/link modal */}
      {showImport && (
        <Modal title="📸 Importér opskrift fra link" onClose={closeImport}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Instagram- eller opskriftslink</label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="https://www.instagram.com/reel/..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                />
                <button
                  className="btn btn-primary shrink-0"
                  onClick={() => handleImport()}
                  disabled={importing || !importUrl.trim()}
                >
                  {importing ? '⏳ Henter…' : 'Hent'}
                </button>
              </div>
            </div>

            {importError && (
              <p className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
                ⚠️ {importError}
              </p>
            )}

            {importing && (
              <p className="text-muted text-sm text-center py-4 font-display italic">
                Læser opskrift og spørger Claude…
              </p>
            )}

            {importPreview && !importing && (
              <div>
                <p className="text-sm text-muted mb-3">
                  Tjek oplysningerne og ret hvis nødvendigt, så gemmer vi den.
                </p>
                {importPreview.sourceImage && (
                  <img
                    src={importPreview.sourceImage}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                <MealForm
                  initial={importPreview}
                  allTags={allTags}
                  onCancel={closeImport}
                  onSave={async (m) => {
                    await createMeal(m)
                    closeImport()
                    refresh()
                  }}
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {editing && (
        <Modal title="Redigér måltid" onClose={() => { setEditing(null); setSaveError(null) }}>
          {saveError && (
            <p className="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
              ⚠️ {saveError}
            </p>
          )}
          <MealForm
            initial={editing}
            allTags={allTags}
            onCancel={() => { setEditing(null); setSaveError(null) }}
            onSave={async (m) => {
              setSaveError(null)
              try {
                await updateMeal(editing.id, m)
                setEditing(null)
                refresh()
              } catch (err) {
                setSaveError(err instanceof Error ? err.message : 'Ukendt fejl – prøv igen.')
              }
            }}
          />
        </Modal>
      )}
    </div>
  )
}
