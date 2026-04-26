import { supabase } from './supabase'
import { Meal } from '../types'

export interface ImportedMeal extends Omit<Meal, 'id' | 'user_id' | 'created_at'> {
  sourceUrl?: string
  sourceImage?: string
}

/**
 * Sender en Instagram-URL til import-meal Edge Function.
 * Returnerer et Meal-objekt klar til preview og gem.
 */
export async function importMealFromUrl(url: string): Promise<ImportedMeal> {
  if (!supabase) throw new Error('Supabase er ikke konfigureret')

  const { data, error } = await supabase.functions.invoke('import-meal', {
    body: { url },
  })

  if (error) throw new Error(error.message)
  if (data?.error) throw new Error(data.error)

  return data as ImportedMeal
}
