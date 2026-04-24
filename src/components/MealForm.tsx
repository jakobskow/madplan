import { useState } from 'react'
import { Meal, Category, CATEGORIES, CATEGORY_LABELS } from '../types'
import { TagSelector } from './TagSelector'

export function MealForm({
  initial,
  allTags,
  onCancel,
  onSave
}: {
  initial?: Partial<Meal>
  allTags: string[]
  onCancel: () => void
  onSave: (m: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>((initial?.category ?? 'morgenmad') as Category)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), category, description: description.trim() || null, tags })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Navn</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Kategori</label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Beskrivelse / ingredienser</label>
        <textarea
          className="input"
          rows={3}
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        <TagSelector value={tags} suggestions={allTags} onChange={setTags} />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Annuller
        </button>
        <button type="submit" className="btn btn-primary">
          Gem
        </button>
      </div>
    </form>
  )
}
