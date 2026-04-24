import { useState } from 'react'
import { signInWithPassword, sendMagicLink, sendPasswordReset } from '../lib/auth'
import { Logo } from '../components/Logo'

type Mode = 'password' | 'magic' | 'reset'

export default function Login() {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function switchMode(m: Mode) {
    setMode(m)
    setErr(null)
    setSent(false)
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await signInWithPassword(email.trim(), password)
    } catch (e: any) {
      setErr('Forkert email eller adgangskode.')
    } finally {
      setLoading(false)
    }
  }

  async function submitMagic(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await sendMagicLink(email.trim())
      setSent(true)
    } catch (e: any) {
      setErr(e.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await sendPasswordReset(email.trim())
      setSent(true)
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
          Velkommen tilbage
        </h1>

        {/* ── Password login ── */}
        {mode === 'password' && (
          <>
            <p className="text-muted text-sm text-center mb-6">
              Log ind med email og adgangskode.
            </p>
            <form onSubmit={submitPassword} className="space-y-3">
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="din@email.dk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                autoComplete="current-password"
                className="input"
                placeholder="Adgangskode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="btn btn-primary w-full justify-center"
                disabled={loading}
              >
                {loading ? 'Logger ind…' : 'Log ind'}
              </button>
              {err && (
                <div className="text-sm text-red-600 text-center">{err}</div>
              )}
              <div className="flex justify-between text-xs text-muted pt-1">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="hover:text-terracotta transition-colors"
                >
                  Glemt adgangskode?
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('magic')}
                  className="hover:text-terracotta transition-colors"
                >
                  Brug magisk link →
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Magic link ── */}
        {mode === 'magic' && !sent && (
          <>
            <p className="text-muted text-sm text-center mb-6">
              Vi sender et enganglink til din indbakke.
            </p>
            <form onSubmit={submitMagic} className="space-y-3">
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="din@email.dk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn btn-primary w-full justify-center"
                disabled={loading}
              >
                {loading ? 'Sender…' : 'Send magisk link'}
              </button>
              {err && (
                <div className="text-sm text-red-600 text-center">{err}</div>
              )}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className="text-xs text-muted hover:text-terracotta transition-colors"
                >
                  ← Log ind med adgangskode
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Reset password ── */}
        {mode === 'reset' && !sent && (
          <>
            <p className="text-muted text-sm text-center mb-6">
              Indtast din email — vi sender et nulstillingslink.
            </p>
            <form onSubmit={submitReset} className="space-y-3">
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="din@email.dk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn btn-primary w-full justify-center"
                disabled={loading}
              >
                {loading ? 'Sender…' : 'Send nulstillingslink'}
              </button>
              {err && (
                <div className="text-sm text-red-600 text-center">{err}</div>
              )}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className="text-xs text-muted hover:text-terracotta transition-colors"
                >
                  ← Tilbage til login
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Sent confirmation ── */}
        {sent && (
          <div className="mt-6">
            <div className="p-4 rounded-xl bg-sage-soft text-sage-dark text-sm text-center">
              {mode === 'reset' ? (
                <>
                  Tjek din indbakke på <strong>{email}</strong>.
                  <br />
                  Klik på linket for at vælge en ny adgangskode.
                </>
              ) : (
                <>
                  Tjek din indbakke på <strong>{email}</strong> og klik på linket.
                </>
              )}
            </div>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => switchMode('password')}
                className="text-xs text-muted hover:text-terracotta transition-colors"
              >
                ← Tilbage til login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
