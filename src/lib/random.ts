import { Meal, Slot, SLOTS, slotCategory } from '../types'

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomDay(
  meals: Meal[],
  opts: { avoidDayDuplicates?: boolean } = { avoidDayDuplicates: true }
): Record<Slot, string | null> {
  const used = new Set<string>()
  const result = {} as Record<Slot, string | null>
  for (const slot of SLOTS) {
    const cat = slotCategory(slot)
    let pool = meals.filter((m) => m.category === cat)
    if (opts.avoidDayDuplicates) pool = pool.filter((m) => !used.has(m.id))
    const pick = pickRandom(pool)
    result[slot] = pick?.id ?? null
    if (pick) used.add(pick.id)
  }
  return result
}

export function randomWeek(
  meals: Meal[],
  opts: { avoidWeekDuplicatesForMainMeals?: boolean } = { avoidWeekDuplicatesForMainMeals: true }
): Record<number, Record<Slot, string | null>> {
  const usedMain = new Set<string>()
  const entries: Record<number, Record<Slot, string | null>> = {}
  for (let day = 1; day <= 7; day++) {
    const dayUsed = new Set<string>()
    const dayRes = {} as Record<Slot, string | null>
    for (const slot of SLOTS) {
      const cat = slotCategory(slot)
      const isMain = cat === 'morgenmad' || cat === 'frokost' || cat === 'aftensmad'
      let pool = meals.filter((m) => m.category === cat)
      pool = pool.filter((m) => !dayUsed.has(m.id))
      if (opts.avoidWeekDuplicatesForMainMeals && isMain && pool.length > usedMain.size)
        pool = pool.filter((m) => !usedMain.has(m.id))
      const pick = pickRandom(pool)
      dayRes[slot] = pick?.id ?? null
      if (pick) {
        dayUsed.add(pick.id)
        if (isMain) usedMain.add(pick.id)
      }
    }
    entries[day] = dayRes
  }
  return entries
}
