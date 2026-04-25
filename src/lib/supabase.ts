import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabase = Boolean(url && anon && !url.includes('YOUR-PROJECT'))

// Cookie-based storage so iOS Safari's 7-day ITP doesn't clear the session.
// Non-HttpOnly cookies have the same XSS risk as localStorage, and
// SameSite=Strict prevents CSRF — no meaningful security regression.
const SESSION_DAYS = 30
const MAX_AGE = 60 * 60 * 24 * SESSION_DAYS

const cookieStorage = {
  getItem(key: string): string | null {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const m = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'))
    return m ? decodeURIComponent(m[1]) : null
  },
  setItem(key: string, value: string): void {
    document.cookie = `${key}=${encodeURIComponent(value)}; max-age=${MAX_AGE}; path=/; SameSite=Strict`
  },
  removeItem(key: string): void {
    document.cookie = `${key}=; max-age=0; path=/`
  },
}

export const supabase = hasSupabase
  ? createClient(url!, anon!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: cookieStorage,
      },
    })
  : null
