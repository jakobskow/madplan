import { useState } from 'react'
import { signInWithPassword, requestAccess, sendPasswordReset } from '../lib/auth'
import { Logo } from '../components/Logo'

type Mode = 'login' | 'signup' | 'reset'

export default function Login() {
  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [sent, setSent]         = useState<'confirm_email' | 'pending' | 'reset' | null>(null)
  const [err, setErr]           = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  function switchMode(m: Mode) {
    setMode(m)
    setErr(null)
    setSent(null)
    setPassword('')
    setConfirm('')
  }

  // ── Log ind ────────────────────────────────────────────────────────
  async function submitLogin(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await signInWithPassword(email.trim(), password)
    } catch {
      setErr('Forkert email eller adgangskode.')
    } finally {
      setLoading(false)
    }
  }

  // ── Anmod om adgang ────────────────────────────────────────────────
  async function submitSignup(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (password !== confirm) {
      setErr('Adgangskoderne matcher ikke.')
      return
    }
    if (password.length < 8) {
      setErr('Adgangskoden skal være mindst 8 tegn.')
      return
    }
    setLoading(true)
    try {
      const result = await requestAccess(email.trim(), password)
      setSent(result)
    } catch (e: any) {
      // "User already registered" → give a neutral message
      if (e?.message?.toLowerCase().includes('already')) {
        setErr('Der findes allerede en konto med denne email.')
      } else {
        setErr(e?.message ?? 'Noget gik galt. Prøv igen.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Glemt adgangskode ──────────────────────────────────────────────
  async function submitReset(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await sendPasswordReset(email.trim())
      setSent('reset')
    } catch (e: any) {
      setErr(e?.message ?? 'Noget gik galt. Prøv igen.')
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

        {/* ── Log ind ─────────────────────────────────────────────── */}
        {mode === 'login' && (
          <>
            <h1 className="font-display text-2xl font-semibold text-center text-ink mb-1">
              Velkommen tilbage
            </h1>
            <p className="text-muted text-sm text-center mb-6">
              Log ind med email og adgangskode.
            </p>
            <form onSubmit={submitLogin} className="space-y-3">
              <input
                type="email" required autoComplete="email"
                className="input" placeholder="din@email.dk"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <input
                type="password" required autoComplete="current-password"
                className="input" placeholder="Adgangskode"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button className="btn btn-primary w-full justify-center" disabled={loading}>
                {loading ? 'Logger ind…' : 'Log ind'}
              </button>
              {err && <p className="text-sm text-red-600 text-center">{err}</p>}
              <div className="flex justify-between text-xs text-muted pt-1">
                <button type="button" onClick={() => switchMode('reset')}
                  className="hover:text-terracotta transition-colors">
                  Glemt adgangskode?
                </button>
                <button type="button" onClick={() => switchMode('signup')}
                  className="hover:text-terracotta transition-colors">
                  Anmod om adgang →
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Anmod om adgang ─────────────────────────────────────── */}
        {mode === 'signup' && !sent && (
          <>
            <h1 className="font-display text-2xl font-semibold text-center text-ink mb-1">
              Anmod om adgang
            </h1>
            <p className="text-muted text-sm text-center mb-6">
              Opret en konto — en administrator godkender din adgang.
            </p>
            <form onSubmit={submitSignup} className="space-y-3">
              <input
                type="email" required autoComplete="email"
                className="input" placeholder="din@email.dk"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <input
                type="password" required autoComplete="new-password"
                className="input" placeholder="Vælg adgangskode (min. 8 tegn)"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <input
                type="password" required autoComplete="new-password"
                className="input" placeholder="Gentag adgangskode"
                value={confirm} onChange={e => setConfirm(e.target.value)}
              />
              <button className="btn btn-primary w-full justify-center" disabled={loading}>
                {loading ? 'Sender anmodning…' : 'Send anmodning'}
              </button>
              {err && <p className="text-sm text-red-600 text-center">{err}</p>}
              <div className="text-center">
                <button type="button" onClick={() => switchMode('login')}
                  className="text-xs text-muted hover:text-terracotta transition-colors">
                  ← Har du allerede adgang? Log ind
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Glemt adgangskode ────────────────────────────────────── */}
        {mode === 'reset' && !sent && (
          <>
            <h1 className="font-display text-2xl font-semibold text-center text-ink mb-1">
              Nulstil adgangskode
            </h1>
            <p className="text-muted text-sm text-center mb-6">
              Indtast din email — vi sender et nulstillingslink.
            </p>
            <form onSubmit={submitReset} className="space-y-3">
              <input
                type="email" required autoComplete="email"
                className="input" placeholder="din@email.dk"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <button className="btn btn-primary w-full justify-center" disabled={loading}>
                {loading ? 'Sender…' : 'Send nulstillingslink'}
              </button>
              {err && <p className="text-sm text-red-600 text-center">{err}</p>}
              <div className="text-center">
                <button type="button" onClick={() => switchMode('login')}
                  className="text-xs text-muted hover:text-terracotta transition-colors">
                  ← Tilbage til login
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Bekræftelse: email skal bekræftes ───────────────────── */}
        {sent === 'confirm_email' && (
          <div className="mt-2">
            <h1 className="font-display text-2xl font-semibold text-center text-ink mb-4">
              Bekræft din email
            </h1>
            <div className="p-4 rounded-xl bg-sage-soft text-sage-dark text-sm text-center space-y-2">
              <p>Vi har sendt et bekræftelseslink til</p>
              <p className="font-semibold">{email}</p>
              <p>Klik på linket i emailen. Derefter afventer din konto godkendelse fra administratoren.</p>
            </div>
            <div className="text-center mt-4">
              <button type="button" onClick={() => switchMode('login')}
                className="text-xs text-muted hover:text-terracotta transition-colors">
                ← Tilbage til login
              </button>
            </div>
          </div>
        )}

        {/* ── Bekræftelse: direkte pending (ingen email-krav) ─────── */}
        {sent === 'pending' && (
          <div className="mt-2">
            <h1 className="font-display text-2xl font-semibold text-center text-ink mb-4">
              Anmodning sendt
            </h1>
            <div className="p-4 rounded-xl bg-sage-soft text-sage-dark text-sm text-center space-y-2">
              <p>Din konto er oprettet og afventer godkendelse fra administratoren.</p>
              <p>Du får besked, når du har fået adgang — og kan derefter logge ind nedenfor.</p>
            </div>
            <div className="text-center mt-4">
              <button type="button" onClick={() => switchMode('login')}
                className="text-xs text-muted hover:text-terracotta transition-colors">
                ← Gå til login
              </button>
            </div>
          </div>
        )}

        {/* ── Bekræftelse: nulstillingslink sendt ─────────────────── */}
        {sent === 'reset' && (
          <div className="mt-2">
            <h1 className="font-display text-2xl font-semibold text-center text-ink mb-4">
              Email sendt
            </h1>
            <div className="p-4 rounded-xl bg-sage-soft text-sage-dark text-sm text-center space-y-2">
              <p>Tjek din indbakke på</p>
              <p className="font-semibold">{email}</p>
              <p>og klik på nulstillingslinket.</p>
            </div>
            <div className="text-center mt-4">
              <button type="button" onClick={() => switchMode('login')}
                className="text-xs text-muted hover:text-terracotta transition-colors">
                ← Tilbage til login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
