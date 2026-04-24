import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../lib/auth'
import { supabase, hasSupabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasSupabase) return
    // Supabase SDK auto-processes the recovery hash from the URL.
    // Poll briefly until the session is established.
    let attempts = 0
    const check = async () => {
      const { data } = await supabase!.auth.getSession()
      if (data.session) {
        setReady(true)
      } else if (attempts < 10) {
        attempts++
        setTimeout(check, 400)
      }
    }
    check()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setErr('Adgangskoderne matcher ikke.')
      return
    }
    if (password.length < 8) {
      setErr('Adgangskoden skal være mindst 8 tegn.')
      return
    }
    setErr(null)
    setLoading(true)
    try {
      await updatePassword(password)
      setDone(true)
      setTimeout(() => navigate('/'), 2500)
    } catch (e: any) {
      setErr(e.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="card p-8 w-full max-w-sm shadow-lg">
        <div className="flex justify-center mb-4">
          <Logo size={44} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-center text-ink mb-1">
          Ny adgangskode
        </h1>

        {done ? (
          <div className="p-4 rounded-xl bg-sage-soft text-sage-dark text-sm text-center mt-6">
            ✓ Adgangskoden er opdateret!
            <br />
            Du omdirigeres nu til appen…
          </div>
        ) : !ready ? (
          <div className="text-center text-muted text-sm mt-6 animate-pulse">
            Bekræfter link…
          </div>
        ) : (
          <>
            <p className="text-muted text-sm text-center mb-6">
              Vælg en ny adgangskode til din konto.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input"
                placeholder="Ny adgangskode (min. 8 tegn)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input"
                placeholder="Gentag adgangskode"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                className="btn btn-primary w-full justify-center"
                disabled={loading}
              >
                {loading ? 'Gemmer…' : 'Gem adgangskode'}
              </button>
              {err && (
                <div className="text-sm text-red-600 text-center">{err}</div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
