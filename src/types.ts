export type Category = 'morgenmad' | 'snack' | 'frokost' | 'aftensmad'

export type Slot =
  | 'morgenmad'
  | 'snack_1'
  | 'frokost'
  | 'snack_2'
  | 'snack_3'
  | 'aftensmad'
  | 'snack_4'

export const SLOTS: Slot[] = [
  'morgenmad',
  'snack_1',
  'frokost',
  'snack_2',
  'snack_3',
  'aftensmad',
  'snack_4'
]

export const SLOT_LABELS: Record<Slot, string> = {
  morgenmad: 'Morgenmad',
  snack_1: 'Snack',
  frokost: 'Frokost',
  snack_2: 'Snack',
  snack_3: 'Snack',
  aftensmad: 'Aftensmad',
  snack_4: 'Snack'
}

export const CATEGORIES: Category[] = ['morgenmad', 'snack', 'frokost', 'aftensmad']

export const CATEGORY_LABELS: Record<Category, string> = {
  morgenmad: 'Morgenmad',
  snack: 'Snack',
  frokost: 'Frokost',
  aftensmad: 'Aftensmad'
}

export const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'] as const

export function slotCategory(slot: Slot): Category {
  if (slot.startsWith('snack')) return 'snack'
  return slot as Category
}

export type Meal = {
  id: string
  user_id?: string
  name: string
  category: Category
  description: string | null
  tags: string[]
  created_at?: string
}

export type MealPlanEntry = {
  id?: string
  user_id?: string
  year: number
  week: number
  day_of_week: number // 1..7
  slot: Slot
  meal_id: string | null
}

export type WeekPlan = {
  year: number
  week: number
  entries: Record<number, Record<Slot, string | null>>
}
