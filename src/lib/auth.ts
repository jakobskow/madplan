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

export async function sendMagicLink(email: string): Promise<void> {
  if (!hasSupabase) throw new Error('Supabase er ikke konfigureret')
  const { error } = await supabase!.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  if (!hasSupabase) return
  await supabase!.auth.signOut()
}
