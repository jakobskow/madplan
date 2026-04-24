import { useEffect, useMemo, useState } from 'react'
import { DAYS, Meal, Slot, SLOTS, SLOT_LABELS, slotCategory } from '../types'
import { listMeals, listWeekPlan, upsertPlanEntry } from '../lib/data'
import { MealPicker } from '../components/MealPicker'
import { currentIsoWeek, isoDayOfWeek } from '../lib/iso-week'
import { randomDay } from '../lib/random'

export default function DayPlan() {
  const [{ year, week }] = useState(currentIsoWeek())
  const [day, setDay] = useState(isoDayOfWeek(new Date()))
  const [meals, setMeals] = useState<Meal[]>([])
  const [entries, setEntries] = useState<Record<Slot, string | null>>(
    Object.fromEntries(SLOTS.map((s) => [s, null])) as Record<Slot, string | null>
  )
  const [picker, setPicker] = useState<Slot | null>(null)

  async function load() {
    setMeals(await listMeals())
    const plan = await listWeekPlan(year, week)
    const row = Object.fromEntries(SLOTS.map((s) => [s, null])) as Record<Slot, string | null>
    for (const p of plan) if (p.day_of_week === day) row[p.slot] = p.meal_id ?? null
    setEntries(row)
  }

  useEffect(() => {
    load()
  }, [year, week, day])

  const mealsById = useMemo(() => {
    const m: Record<string, Meal> = {}
    for (const x of meals) m[x.id] = x
    return m
  }, [meals])

  async function set(slot: Slot, mealId: string | null) {
    setEntries((prev) => ({ ...prev, [slot]: mealId }))
    await upsertPlanEntry({ year, week, day_of_week: day, slot, meal_id: mealId })
  }

  async function randomize() {
    const r = randomDay(meals)
    setEntries(r)
    for (const s of SLOTS) await upsertPlanEntry({ year, week, day_of_week: day, slot: s, meal_id: r[s] })
  }

  const SLOT_ICON: Record<Slot, string> = {
    morgenmad: '🥣',
    snack_1: '🥐',
    frokost: '🥪',
    snack_2: '🍎',
    snack_3: '🥕',
    aftensmad: '🍲',
    snack_4: '🍪'
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{DAYS[day - 1]}</h1>
          <div className="text-muted text-sm">Uge {week}, {year}</div>
        </div>
        <select
          className="input max-w-[160px]"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
        >
          {DAYS.map((d, i) => (
            <option key={d} value={i + 1}>
              {d}
            </option>
          ))}
        </select>
        <button className="btn btn-primary ml-auto" onClick={randomize}>
          🎲 Random dag
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {SLOTS.map((slot) => {
          const m = entries[slot] ? mealsById[entries[slot]!] : null
          return (
            <button
              key={slot}
              onClick={() => setPicker(slot)}
              className={`text-left card p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                m ? '' : 'cell-empty'
              }`}
            >
              <div className="text-xs text-muted uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                <span className="text-base">{SLOT_ICON[slot]}</span>
                {SLOT_LABELS[slot]}
              </div>
              {m ? (
                <>
                  <div className="font-display text-lg font-semibold text-ink leading-tight">
                    {m.name}
                  </div>
                  {m.description && (
                    <div className="text-sm text-muted mt-1">{m.description}</div>
                  )}
                </>
              ) : (
                <div className="text-muted italic">+ vælg måltid</div>
              )}
            </button>
          )
        })}
      </div>

      {picker && (
        <MealPicker
          meals={meals}
          category={slotCategory(picker)}
          onPick={(id) => {
            set(picker, id)
            setPicker(null)
          }}
          onClear={() => {
            set(picker, null)
            setPicker(null)
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}
