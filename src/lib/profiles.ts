import { supabase, hasSupabase } from './supabase'

export interface Profile {
  id: string
  user_id: string
  email: string
  role: 'user' | 'admin'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  approved_at: string | null
}

/** Henter den indloggede brugers egen profil */
export async function getMyProfile(): Promise<Profile | null> {
  if (!hasSupabase) return null
  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .eq('user_id', (await supabase!.auth.getUser()).data.user?.id ?? '')
    .single()
  if (error) return null
  return data as Profile
}

/** Admin: henter alle profiler, sorteret nyeste først */
export async function listAllProfiles(): Promise<Profile[]> {
  if (!hasSupabase) return []
  const { data } = await supabase!
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
}

/** Admin: opdaterer en brugers status og/eller rolle */
export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, 'status' | 'role'>>
): Promise<void> {
  if (!hasSupabase) return
  const update: Record<string, unknown> = { ...patch }
  if (patch.status === 'approved') update.approved_at = new Date().toISOString()
  if (patch.status === 'rejected') update.approved_at = null
  const { error } = await supabase!
    .from('profiles')
    .update(update)
    .eq('user_id', userId)
  if (error) throw error
}
