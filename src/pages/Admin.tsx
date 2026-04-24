import { useState, useEffect } from 'react'
import { listAllProfiles, updateProfile, Profile } from '../lib/profiles'

type Tab = 'pending' | 'all'

const STATUS_LABEL: Record<Profile['status'], string> = {
  pending:  'Afventer',
  approved: 'Godkendt',
  rejected: 'Afvist',
}
const STATUS_STYLE: Record<Profile['status'], string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-sage-soft text-sage-dark',
  rejected: 'bg-red-100 text-red-600',
}
const ROLE_LABEL: Record<Profile['role'], string> = {
  user:  'Bruger',
  admin: 'Admin',
}

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [tab, setTab]           = useState<Tab>('pending')

  async function load() {
    setLoading(true)
    setProfiles(await listAllProfiles())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handle(
    userId: string,
    patch: Partial<Pick<Profile, 'status' | 'role'>>
  ) {
    setUpdating(userId)
    try {
      await updateProfile(userId, patch)
      await load()
    } finally {
      setUpdating(null)
    }
  }

  const pending  = profiles.filter(p => p.status === 'pending')
  const shown    = tab === 'pending' ? pending : profiles

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">
          Brugerstyring
        </h1>
        <p className="text-muted text-sm">
          Godkend nye brugere og administrer adgang.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-line pb-0">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            tab === 'pending'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Afventer godkendelse
          {pending.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-terracotta text-white">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            tab === 'all'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Alle brugere
          <span className="ml-2 text-muted font-normal">({profiles.length})</span>
        </button>
      </div>

      {/* Indhold */}
      {loading ? (
        <div className="text-muted text-sm animate-pulse">Indlæser brugere…</div>
      ) : shown.length === 0 ? (
        <div className="card p-8 text-center text-muted text-sm">
          {tab === 'pending'
            ? 'Ingen brugere afventer godkendelse.'
            : 'Ingen brugere endnu.'}
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {shown.map(p => (
            <div
              key={p.user_id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"
            >
              {/* Bruger-info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-ink truncate">
                    {p.email}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLE[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                  {p.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-terracotta/10 text-terracotta">
                      Admin
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Tilmeldt {new Date(p.created_at).toLocaleDateString('da-DK', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                  {p.approved_at && ` · Godkendt ${new Date(p.approved_at).toLocaleDateString('da-DK')}`}
                </div>
              </div>

              {/* Handlinger */}
              <div className="flex gap-2 shrink-0 flex-wrap">
                {p.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-sage text-sm"
                      disabled={updating === p.user_id}
                      onClick={() => handle(p.user_id, { status: 'approved' })}
                    >
                      {updating === p.user_id ? '…' : '✓ Godkend'}
                    </button>
                    <button
                      className="btn btn-ghost text-sm text-red-500 hover:bg-red-50"
                      disabled={updating === p.user_id}
                      onClick={() => handle(p.user_id, { status: 'rejected' })}
                    >
                      Afvis
                    </button>
                  </>
                )}

                {p.status === 'approved' && p.role !== 'admin' && (
                  <>
                    <button
                      className="btn btn-ghost text-sm"
                      disabled={updating === p.user_id}
                      onClick={() => handle(p.user_id, { role: 'admin' })}
                      title="Giv admin-rettigheder"
                    >
                      Gør til admin
                    </button>
                    <button
                      className="btn btn-ghost text-sm text-red-500 hover:bg-red-50"
                      disabled={updating === p.user_id}
                      onClick={() => handle(p.user_id, { status: 'rejected' })}
                    >
                      Fjern adgang
                    </button>
                  </>
                )}

                {p.status === 'approved' && p.role === 'admin' && (
                  <button
                    className="btn btn-ghost text-sm"
                    disabled={updating === p.user_id}
                    onClick={() => handle(p.user_id, { role: 'user' })}
                    title="Fjern admin-rettigheder"
                  >
                    Fjern admin
                  </button>
                )}

                {p.status === 'rejected' && (
                  <button
                    className="btn btn-sage text-sm"
                    disabled={updating === p.user_id}
                    onClick={() => handle(p.user_id, { status: 'approved' })}
                  >
                    Genaktivér
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
