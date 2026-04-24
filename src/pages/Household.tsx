import { useState, useEffect, useCallback } from 'react'
import { useSession } from '../lib/auth'
import { getDefaultHouseholdId, setDefaultHouseholdId } from '../lib/defaultHousehold'
import {
  getMyHouseholds,
  getMyPendingInvitations,
  createHousehold,
  inviteMember,
  acceptInvitation,
  leaveOrDeclineHousehold,
  removeMember,
  renameHousehold,
  deleteHousehold,
  HouseholdWithMembers,
  PendingInvitation,
} from '../lib/households'

export default function Household() {
  const { session }  = useSession()
  const myUserId     = session?.user?.id ?? ''
  const myEmail      = session?.user?.email ?? ''

  const [households,   setHouseholds]   = useState<HouseholdWithMembers[]>([])
  const [invitations,  setInvitations]  = useState<PendingInvitation[]>([])
  const [loading,      setLoading]      = useState(true)
  const [creating,     setCreating]     = useState(false)
  const [newName,      setNewName]      = useState('')
  const [inviteEmail,  setInviteEmail]  = useState<Record<string, string>>({})
  const [inviting,     setInviting]     = useState<string | null>(null)
  const [err,          setErr]          = useState<Record<string, string>>({})
  const [actionId,     setActionId]     = useState<string | null>(null)
  const [defaultId,    setDefaultId]    = useState<string | null>(() => getDefaultHouseholdId(myUserId))

  const load = useCallback(async () => {
    if (!myUserId) return
    setLoading(true)
    const [hh, inv] = await Promise.all([
      getMyHouseholds(myUserId),
      getMyPendingInvitations(),
    ])
    setHouseholds(hh)
    setInvitations(inv)
    setLoading(false)
  }, [myUserId])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createHousehold(newName.trim())
      setNewName('')
      await load()
    } finally {
      setCreating(false)
    }
  }

  async function handleInvite(e: React.FormEvent, householdId: string) {
    e.preventDefault()
    const email = inviteEmail[householdId]?.trim()
    if (!email) return
    setInviting(householdId)
    setErr({})
    try {
      await inviteMember(householdId, email)
      setInviteEmail((prev) => ({ ...prev, [householdId]: '' }))
      await load()
    } catch (e: any) {
      setErr((prev) => ({ ...prev, [householdId]: e.message ?? 'Fejl ved invitation' }))
    } finally {
      setInviting(null)
    }
  }

  async function handleAccept(inv: PendingInvitation) {
    setActionId(inv.id)
    try {
      await acceptInvitation(inv.id)
      await load()
    } finally {
      setActionId(null)
    }
  }

  async function handleDecline(inv: PendingInvitation) {
    setActionId(inv.id)
    try {
      await leaveOrDeclineHousehold(inv.id)
      await load()
    } finally {
      setActionId(null)
    }
  }

  async function handleRemoveMember(memberId: string) {
    setActionId(memberId)
    try {
      await removeMember(memberId)
      await load()
    } finally {
      setActionId(null)
    }
  }

  async function handleLeave(h: HouseholdWithMembers) {
    if (!confirm(`Er du sikker på, at du vil forlade "${h.name}"?`)) return
    const myMember = h.members.find((m) => m.user_id === myUserId)
    if (!myMember) return
    setActionId(myMember.id)
    try {
      await leaveOrDeclineHousehold(myMember.id)
      if (defaultId === h.id) { setDefaultHouseholdId(myUserId, null); setDefaultId(null) }
      await load()
    } finally {
      setActionId(null)
    }
  }

  function handleSetDefault(h: HouseholdWithMembers) {
    const next = defaultId === h.id ? null : h.id
    setDefaultHouseholdId(myUserId, next)
    setDefaultId(next)
  }

  async function handleDelete(h: HouseholdWithMembers) {
    if (!confirm(`Slet "${h.name}" permanent? Alle medlemmer mister adgang til den fælles plan.`)) return
    setActionId(h.id)
    try {
      await deleteHousehold(h.id)
      if (defaultId === h.id) { setDefaultHouseholdId(myUserId, null); setDefaultId(null) }
      await load()
    } finally {
      setActionId(null)
    }
  }

  if (loading)
    return <div className="text-muted text-sm animate-pulse">Indlæser husstand…</div>

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Husstand</h1>
        <p className="text-muted text-sm">
          Del ugeplaner med andre — begge kan se og redigere den fælles plan.
        </p>
      </div>

      {/* ── Afventende invitationer ─────────────────────────────────── */}
      {invitations.length > 0 && (
        <section>
          <h2 className="font-semibold text-ink mb-3 flex items-center gap-2">
            Invitationer
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-terracotta text-white">
              {invitations.length}
            </span>
          </h2>
          <div className="card divide-y divide-line">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {inv.household?.name ?? 'Husstand'}
                  </p>
                  <p className="text-xs text-muted">
                    Inviteret af {inv.invited_by === myUserId ? 'dig' : 'en anden bruger'}
                    {' · '}
                    {new Date(inv.created_at).toLocaleDateString('da-DK')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className="btn btn-sage text-sm"
                    disabled={actionId === inv.id}
                    onClick={() => handleAccept(inv)}
                  >
                    {actionId === inv.id ? '…' : '✓ Acceptér'}
                  </button>
                  <button
                    className="btn btn-ghost text-sm text-red-500 hover:bg-red-50"
                    disabled={actionId === inv.id}
                    onClick={() => handleDecline(inv)}
                  >
                    Afvis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Mine hustande ───────────────────────────────────────────── */}
      {households.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-ink">Mine hustande</h2>
          {households.map((h) => (
            <div key={h.id} className="card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink">{h.name}</h3>
                    {defaultId === h.id && (
                      <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-sage-soft text-sage-dark font-medium">
                        Standard
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {h.isOwner ? 'Ejer' : 'Medlem'} · {h.members.filter(m => m.status === 'accepted').length} {h.members.filter(m => m.status === 'accepted').length === 1 ? 'medlem' : 'medlemmer'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className={`btn text-sm ${defaultId === h.id ? 'btn-sage' : 'btn-ghost'}`}
                    onClick={() => handleSetDefault(h)}
                    title={defaultId === h.id ? 'Fjern som standard' : 'Sæt som standard'}
                  >
                    {defaultId === h.id ? '★ Standard' : '☆ Standard'}
                  </button>
                  {h.isOwner ? (
                    <button
                      className="btn btn-ghost text-sm text-red-500 hover:bg-red-50"
                      disabled={actionId === h.id}
                      onClick={() => handleDelete(h)}
                    >
                      {actionId === h.id ? '…' : 'Slet'}
                    </button>
                  ) : (
                    <button
                      className="btn btn-ghost text-sm text-red-500 hover:bg-red-50"
                      onClick={() => handleLeave(h)}
                    >
                      Forlad
                    </button>
                  )}
                </div>
              </div>

              {/* Medlemsliste */}
              <div className="space-y-1">
                {h.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-cream/60 gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta text-xs font-semibold flex items-center justify-center shrink-0">
                        {m.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">
                          {m.email}
                          {m.user_id === myUserId && (
                            <span className="ml-1.5 text-xs text-muted">(dig)</span>
                          )}
                        </p>
                        {m.status === 'pending' && (
                          <p className="text-[11px] text-amber-600">Afventer svar</p>
                        )}
                      </div>
                    </div>
                    {h.isOwner && m.user_id !== myUserId && (
                      <button
                        className="text-xs text-muted hover:text-red-500 transition-colors shrink-0"
                        disabled={actionId === m.id}
                        onClick={() => handleRemoveMember(m.id)}
                      >
                        {actionId === m.id ? '…' : 'Fjern'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Inviter (kun ejer) */}
              {h.isOwner && (
                <form
                  onSubmit={(e) => handleInvite(e, h.id)}
                  className="flex gap-2 pt-1 border-t border-line"
                >
                  <input
                    type="email"
                    required
                    className="input flex-1 !py-2 text-sm"
                    placeholder="Inviter via email…"
                    value={inviteEmail[h.id] ?? ''}
                    onChange={(e) =>
                      setInviteEmail((prev) => ({ ...prev, [h.id]: e.target.value }))
                    }
                  />
                  <button
                    className="btn btn-sage text-sm shrink-0"
                    disabled={inviting === h.id}
                  >
                    {inviting === h.id ? '…' : 'Inviter'}
                  </button>
                </form>
              )}
              {err[h.id] && (
                <p className="text-xs text-red-600">{err[h.id]}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Opret ny husstand ───────────────────────────────────────── */}
      <section>
        <h2 className="font-semibold text-ink mb-3">
          {households.length === 0 ? 'Opret en husstand' : 'Opret ny husstand'}
        </h2>
        {households.length === 0 && (
          <p className="text-muted text-sm mb-4">
            Opret en husstand og inviter din partner — så kan I planlægge mad sammen.
          </p>
        )}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            required
            className="input flex-1"
            placeholder="Navn på husstand, fx. Jakob & Amalie"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btn btn-primary shrink-0" disabled={creating}>
            {creating ? 'Opretter…' : 'Opret'}
          </button>
        </form>
      </section>
    </div>
  )
}
