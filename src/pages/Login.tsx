import { useState } from 'react'
import { sendMagicLink } from '../lib/auth'
import { Logo } from '../components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="flex justify-center mb-3">
          <Logo size={44} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-center mb-1">
          Velkommen tilbage
        </h1>
        <p className="text-muted text-sm text-center mb-6">
          Vi sender et magisk link til din indbakke.
        </p>
        {sent ? (
          <div className="p-4 rounded-xl bg-sage-soft text-sage-dark text-sm text-center">
            Tjek din indbakke på <b>{email}</b> og klik på linket.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              required
              className="input"
              placeholder="din@email.dk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Sender…' : 'Send magisk link'}
            </button>
            {err && <div className="text-sm text-red-600">{err}</div>}
          </form>
        )}
      </div>
    </div>
  )
}
