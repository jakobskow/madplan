import { useEffect, useState } from 'react'
import { supabase, hasSupabase } from './supabase'
import type { Session } from '@supabase/supabase-js'

export function useSession(): { session: Session | null; loading: boolean; cloud: boolean } {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(hasSupabase)

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false)
      return
    }
    supabase!.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase!.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, loading, cloud: hasSupabase }
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  if (!hasSupabase) throw new Error('Supabase er ikke konfigureret')
  const { error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error) throw error
}

/** Anmod om adgang — opretter en pending-konto */
export async function requestAccess(email: string, password: string): Promise<'confirm_email' | 'pending'> {
  if (!hasSupabase) throw new Error('Supabase er ikke konfigureret')
  const { data, error } = await supabase!.auth.signUp({ email, password })
  if (error) throw error
  // Supabase returnerer en session med det samme hvis email-bekræftelse er slået fra,
  // ellers er session null og brugeren skal bekræfte email.
  return data.session ? 'pending' : 'confirm_email'
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!hasSupabase) throw new Error('Supabase er ikke konfigureret')
  const { error } = await supabase!.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string): Promise<void> {
  if (!hasSupabase) throw new Error('Supabase er ikke konfigureret')
  const { error } = await supabase!.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  if (!hasSupabase) return
  await supabase!.auth.signOut()
}
