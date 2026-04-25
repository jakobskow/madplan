import { useEffect, useMemo, useState } from 'react'
import { Meal, Slot, SLOTS, slotCategory } from '../types'
import { WeekTable } from '../components/WeekTable'
import { MealPicker } from '../components/MealPicker'
import {
  listMeals,
  listWeekPlan,
  upsertPlanEntry,
  clearWeek,
  setWeekEntries
} from '../lib/data'
import { addWeeks, currentIsoWeek } from '../lib/iso-week'
import { randomDay, randomWeek } from '../lib/random'
import { exportWeekDocx } from '../lib/export/exportDocx'
import { exportWeekXlsx } from '../lib/export/exportXlsx'
import { exportWeekPdf } from '../lib/export/exportPdf'
import { getMyHouseholds, HouseholdWithMembers } from '../lib/households'
import { useSession } from '../lib/auth'
import { getDefaultHouseholdId, setDefaultHouseholdId } from '../lib/defaultHousehold'

function emptyWeek(): Record<number, Record<Slot, string | null>> {
  const out: Record<number, Record<Slot, string | null>> = {}
  for (let d = 1; d <= 7; d++) {
    const row = {} as Record<Slot, string | null>
    for (const s of SLOTS) row[s] = null
    out[d] = row
  }
  return out
}

export default function WeekPlan() {
  const { session, cloud } = useSession()
  const myUserId = session?.user?.id ?? ''

  const [{ year, week }, setYW] = useState(currentIsoWeek())
  const [meals, setMeals] = useState<Meal[]>([])
  const [entries, setEntries] = useState<Record<number, Record<Slot, string | null>>>(emptyWeek())
  const [picker, setPicker] = useState<{ day: number; slot: Slot } | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [households, setHouseholds] = useState<HouseholdWithMembers[]>([])
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null)
  // Prevents loading the plan before we know which household is the default.
  // In local mode (no cloud) we're ready immediately.
  const [householdsReady, setHouseholdsReady] = useState(!cloud)

  // Load households and restore default selection
  useEffect(() => {
    if (!myUserId) return
    getMyHouseholds(myUserId).then((hh) => {
      setHouseholds(hh)
      const saved = getDefaultHouseholdId(myUserId)
      if (saved && hh.some((h) => h.id === saved)) {
        setSelectedHouseholdId(saved)
      }
      setHouseholdsReady(true)
    })
  }, [myUserId])

  function selectPlan(householdId: string | null) {
    setSelectedHouseholdId(householdId)
    setDefaultHouseholdId(myUserId, householdId)
  }

  async function loadAll() {
    const ms = await listMeals()
    setMeals(ms)
    const plan = await listWeekPlan(year, week, selectedHouseholdId)
    const base = emptyWeek()
    for (const p of plan) {
      if (!base[p.day_of_week]) base[p.day_of_week] = {} as Record<Slot, string | null>
      base[p.day_of_week][p.slot] = p.meal_id ?? null
    }
    setEntries(base)
  }

  useEffect(() => {
    if (!householdsReady) return
    loadAll()
  }, [year, week, selectedHouseholdId, householdsReady])

  const mealsById = useMemo(() => {
    const m: Record<string, Meal> = {}
    for (const x of meals) m[x.id] = x
    return m
  }, [meals])

  async function pickMeal(day: number, slot: Slot, mealId: string | null) {
    const next = { ...entries, [day]: { ...entries[day], [slot]: mealId } }
    setEntries(next)
    await upsertPlanEntry({ year, week, day_of_week: day, slot, meal_id: mealId }, selectedHouseholdId)
  }

  async function randomizeWeek() {
    if (!confirm('Generér tilfældig uge? Dette overskriver nuværende ugeplan.')) return
    const next = randomWeek(meals)
    setEntries(next)
    await setWeekEntries(year, week, next, selectedHouseholdId)
  }

  async function randomizeDay(day: number) {
    const dayRes = randomDay(meals)
    const next = { ...entries, [day]: dayRes }
    setEntries(next)
    for (const s of SLOTS) {
      await upsertPlanEntry({ year, week, day_of_week: day, slot: s, meal_id: dayRes[s] }, selectedHouseholdId)
    }
  }

  async function clearAll() {
    if (!confirm('Ryd hele ugen?')) return
    setEntries(emptyWeek())
    await clearWeek(year, week, selectedHouseholdId)
  }

  function shift(delta: number) {
    setYW(addWeeks(year, week, delta))
  }

  return (
    <div>
      {/* ── Plan-vælger (kun hvis brugeren har hustande) ─────────── */}
      {households.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => selectPlan(null)}
            className={`btn text-sm ${selectedHouseholdId === null ? 'btn-primary' : 'btn-ghost'}`}
          >
            Min plan
          </button>
          {households.map((h) => (
            <button
              key={h.id}
              onClick={() => selectPlan(h.id)}
              className={`btn text-sm ${selectedHouseholdId === h.id ? 'btn-primary' : 'btn-ghost'}`}
            >
              🏠 {h.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 card px-2 py-1">
          <button className="btn btn-ghost !px-2" onClick={() => shift(-1)} aria-label="Forrige uge">
            ←
          </button>
          <div className="px-2 min-w-[110px] text-center">
            <div className="font-display text-2xl font-semibold leading-none text-ink">
              Uge {week}
            </div>
            <div className="text-[11px] text-muted">{year}</div>
          </div>
          <button className="btn btn-ghost !px-2" onClick={() => shift(1)} aria-label="Næste uge">
            →
          </button>
        </div>
        <button className="btn btn-ghost" onClick={() => setYW(currentIsoWeek())}>
          I dag
        </button>

        <div className="ml-auto flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={randomizeWeek}>
            <span>🎲</span> Random uge
          </button>
          <button className="btn btn-secondary" onClick={clearAll}>
            Ryd uge
          </button>
          <div className="relative">
            <button className="btn btn-sage" onClick={() => setExportOpen((v) => !v)}>
              <span>↓</span> Eksport
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 card overflow-hidden z-20 min-w-[160px]">
                <button
                  className="block w-full text-left px-4 py-2.5 hover:bg-cream text-sm"
                  onClick={() => {
                    setExportOpen(false)
                    exportWeekDocx(year, week, entries, mealsById)
                  }}
                >
                  📄 Word (.docx)
                </button>
                <button
                  className="block w-full text-left px-4 py-2.5 hover:bg-cream text-sm border-t border-line"
                  onClick={() => {
                    setExportOpen(false)
                    exportWeekXlsx(year, week, entries, mealsById)
                  }}
                >
                  📊 Excel (.xlsx)
                </button>
                <button
                  className="block w-full text-left px-4 py-2.5 hover:bg-cream text-sm border-t border-line"
                  onClick={() => {
                    setExportOpen(false)
                    exportWeekPdf(year, week, entries, mealsById)
                  }}
                >
                  📑 PDF (.pdf)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3 flex gap-1.5 flex-wrap items-center">
        <span className="text-xs text-muted mr-1">Random pr. dag:</span>
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <button
            key={d}
            className="btn btn-secondary !py-1 text-xs"
            onClick={() => randomizeDay(d)}
          >
            🎲 {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'][d - 1]}
          </button>
        ))}
      </div>

      <WeekTable
        entries={entries}
        mealsById={mealsById}
        onCellClick={(day, slot) => setPicker({ day, slot })}
        todayDay={(() => {
          const cw = currentIsoWeek()
          if (year !== cw.year || week !== cw.week) return undefined
          return new Date().getDay() || 7
        })()}
      />

      {picker && (
        <MealPicker
          meals={meals}
          category={slotCategory(picker.slot)}
          onPick={(id) => {
            pickMeal(picker.day, picker.slot, id)
            setPicker(null)
          }}
          onClear={() => {
            pickMeal(picker.day, picker.slot, null)
            setPicker(null)
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}
