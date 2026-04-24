import { supabase, hasSupabase } from './supabase'
import { Meal, MealPlanEntry, Slot } from '../types'
import { SEED_MEALS } from './seed'

// Abstract data layer:
// - Hvis Supabase er konfigureret (env vars sat) → bruger cloud (cross-device, auth).
// - Ellers → bruger localStorage (single-device, intet login nødvendigt).

const LS_MEALS = 'mealplanner.meals.v1'
const LS_PLANS = 'mealplanner.plans.v1'
const LS_SEEDED = 'mealplanner.seeded.v1'

function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function lsRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function lsWrite(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function isCloudMode(): boolean {
  return hasSupabase
}

export async function ensureSeeded(): Promise<void> {
  if (isCloudMode()) {
    const { data } = await supabase!.from('meals').select('id').limit(1)
    if (data && data.length === 0) {
      await supabase!.from('meals').insert(SEED_MEALS.map((m) => ({ ...m })))
    }
  } else {
    if (!localStorage.getItem(LS_SEEDED)) {
      const meals: Meal[] = SEED_MEALS.map((m) => ({ id: uuid(), ...m }))
      lsWrite(LS_MEALS, meals)
      lsWrite(LS_SEEDED, '1')
    }
  }
}

// --- Meals ---

export async function listMeals(): Promise<Meal[]> {
  if (isCloudMode()) {
    const { data, error } = await supabase!.from('meals').select('*').order('name')
    if (error) throw error
    return data as Meal[]
  }
  const meals = lsRead<Meal[]>(LS_MEALS, [])
  return [...meals].sort((a, b) => a.name.localeCompare(b.name, 'da'))
}

export async function createMeal(input: Omit<Meal, 'id' | 'user_id' | 'created_at'>): Promise<Meal> {
  if (isCloudMode()) {
    const { data, error } = await supabase!.from('meals').insert(input).select().single()
    if (error) throw error
    return data as Meal
  }
  const meals = lsRead<Meal[]>(LS_MEALS, [])
  const meal: Meal = { id: uuid(), ...input }
  meals.push(meal)
  lsWrite(LS_MEALS, meals)
  return meal
}

export async function updateMeal(id: string, input: Partial<Omit<Meal, 'id'>>): Promise<void> {
  if (isCloudMode()) {
    const { error } = await supabase!.from('meals').update(input).eq('id', id)
    if (error) throw error
    return
  }
  const meals = lsRead<Meal[]>(LS_MEALS, [])
  const idx = meals.findIndex((m) => m.id === id)
  if (idx >= 0) {
    meals[idx] = { ...meals[idx], ...input }
    lsWrite(LS_MEALS, meals)
  }
}

export async function deleteMeal(id: string): Promise<void> {
  if (isCloudMode()) {
    const { error } = await supabase!.from('meals').delete().eq('id', id)
    if (error) throw error
    return
  }
  const meals = lsRead<Meal[]>(LS_MEALS, []).filter((m) => m.id !== id)
  lsWrite(LS_MEALS, meals)
  // Clear references in plans
  const plans = lsRead<MealPlanEntry[]>(LS_PLANS, []).map((p) =>
    p.meal_id === id ? { ...p, meal_id: null } : p
  )
  lsWrite(LS_PLANS, plans)
}

// --- Plans ---

export async function listWeekPlan(year: number, week: number): Promise<MealPlanEntry[]> {
  if (isCloudMode()) {
    const { data, error } = await supabase!
      .from('meal_plans')
      .select('*')
      .eq('year', year)
      .eq('week', week)
    if (error) throw error
    return data as MealPlanEntry[]
  }
  const plans = lsRead<MealPlanEntry[]>(LS_PLANS, [])
  return plans.filter((p) => p.year === year && p.week === week)
}

export async function upsertPlanEntry(entry: MealPlanEntry): Promise<void> {
  if (isCloudMode()) {
    const payload = {
      year: entry.year,
      week: entry.week,
      day_of_week: entry.day_of_week,
      slot: entry.slot,
      meal_id: entry.meal_id
    }
    const { error } = await supabase!.from('meal_plans').upsert(payload, {
      onConflict: 'user_id,year,week,day_of_week,slot'
    })
    if (error) throw error
    return
  }
  const plans = lsRead<MealPlanEntry[]>(LS_PLANS, [])
  const idx = plans.findIndex(
    (p) =>
      p.year === entry.year &&
      p.week === entry.week &&
      p.day_of_week === entry.day_of_week &&
      p.slot === entry.slot
  )
  if (idx >= 0) plans[idx] = { ...plans[idx], meal_id: entry.meal_id }
  else plans.push({ id: uuid(), ...entry })
  lsWrite(LS_PLANS, plans)
}

export async function clearWeek(year: number, week: number): Promise<void> {
  if (isCloudMode()) {
    const { error } = await supabase!.from('meal_plans').delete().eq('year', year).eq('week', week)
    if (error) throw error
    return
  }
  const plans = lsRead<MealPlanEntry[]>(LS_PLANS, []).filter(
    (p) => !(p.year === year && p.week === week)
  )
  lsWrite(LS_PLANS, plans)
}

export async function setWeekEntries(
  year: number,
  week: number,
  entries: Record<number, Record<Slot, string | null>>
): Promise<void> {
  // Opdater alle slots i én batch
  const rows: MealPlanEntry[] = []
  for (const day of Object.keys(entries).map(Number)) {
    for (const slot of Object.keys(entries[day]) as Slot[]) {
      rows.push({ year, week, day_of_week: day, slot, meal_id: entries[day][slot] })
    }
  }
  if (isCloudMode()) {
    const payload = rows.map((r) => ({
      year: r.year,
      week: r.week,
      day_of_week: r.day_of_week,
      slot: r.slot,
      meal_id: r.meal_id
    }))
    const { error } = await supabase!.from('meal_plans').upsert(payload, {
      onConflict: 'user_id,year,week,day_of_week,slot'
    })
    if (error) throw error
    return
  }
  for (const r of rows) await upsertPlanEntry(r)
}
