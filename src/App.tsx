import { useEffect, useState, useCallback } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Library from './pages/Library'
import WeekPlan from './pages/WeekPlan'
import DayPlan from './pages/DayPlan'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Admin from './pages/Admin'
import Household from './pages/Household'
import { useSession, signOut } from './lib/auth'
import { ensureSeeded } from './lib/data'
import { getMyProfile, Profile } from './lib/profiles'
import { Logo } from './components/Logo'

// ── Shell (navigationsramme) ──────────────────────────────────────────

function Shell({
  children,
  isAdmin,
}: {
  children: React.ReactNode
  isAdmin: boolean
}) {
  const { session, cloud } = useSession()
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur bg-cream/80 border-b border-line">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center gap-6">
          <Logo />
          <nav className="flex gap-1 flex-1 ml-4">
            <NavLink
              to="/week"
              className={({ isActive }) =>
                `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
              }
            >
              Ugeplan
            </NavLink>
            <NavLink
              to="/day"
              className={({ isActive }) =>
                `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
              }
            >
              Dagsplan
            </NavLink>
            <NavLink
              to="/library"
              className={({ isActive }) =>
                `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
              }
            >
              Bibliotek
            </NavLink>
            {cloud && (
              <NavLink
                to="/household"
                className={({ isActive }) =>
                  `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
                }
              >
                Husstand
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
          <div className="text-xs text-muted flex items-center gap-2">
            {cloud ? (
              <>
                <span className="hidden sm:inline">{session?.user?.email}</span>
                <button className="btn btn-ghost" onClick={() => signOut()}>
                  Log ud
                </button>
              </>
            ) : (
              <span
                className="px-2.5 py-1 rounded-full bg-sage-soft text-sage-dark text-[11px] font-medium"
                title="Data gemmes lokalt i browseren"
              >
                Lokal tilstand
              </span>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-muted">
        Lavet med <span className="text-terracotta">♥</span> og masser af skyr
      </footer>
    </div>
  )
}

// ── Pending-skærm ─────────────────────────────────────────────────────

function PendingApproval({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [checking, setChecking] = useState(false)
  async function check() {
    setChecking(true)
    await onRefresh()
    setChecking(false)
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="card p-8 w-full max-w-sm text-center shadow-lg">
        <div className="flex justify-center mb-4">
          <Logo size={44} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">
          Afventer godkendelse
        </h1>
        <p className="text-muted text-sm mb-6">
          Din konto er oprettet og afventer godkendelse fra administratoren.
          Du får adgang, så snart den er godkendt.
        </p>
        <button
          className="btn btn-primary w-full justify-center mb-3"
          onClick={check}
          disabled={checking}
        >
          {checking ? 'Tjekker…' : 'Tjek status'}
        </button>
        <button
          className="btn btn-ghost w-full justify-center text-sm"
          onClick={() => signOut()}
        >
          Log ud
        </button>
      </div>
    </div>
  )
}

// ── Afvist-skærm ─────────────────────────────────────────────────────

function RejectedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="card p-8 w-full max-w-sm text-center shadow-lg">
        <div className="flex justify-center mb-4">
          <Logo size={44} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-2">
          Adgang nægtet
        </h1>
        <p className="text-muted text-sm mb-6">
          Din adgang er blevet afvist. Kontakt administratoren
          for mere information.
        </p>
        <button
          className="btn btn-ghost w-full justify-center"
          onClick={() => signOut()}
        >
          Log ud
        </button>
      </div>
    </div>
  )
}

// ── Hoved-app ─────────────────────────────────────────────────────────

export default function App() {
  const { session, loading, cloud } = useSession()
  const [seeded, setSeeded]         = useState(false)
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!cloud || !session) return
    setProfileLoading(true)
    const p = await getMyProfile()
    setProfile(p)
    setProfileLoading(false)
  }, [cloud, session])

  // Hent profil ved login
  useEffect(() => {
    if (loading || !cloud || !session) return
    fetchProfile()
  }, [loading, cloud, session, fetchProfile])

  // Seed kun hvis brugeren er godkendt (eller vi er i lokalmode)
  const isApproved =
    !cloud || !profile || profile.status === 'approved'

  useEffect(() => {
    if (loading) return
    if (cloud && !session) return
    if (cloud && profileLoading) return
    if (!isApproved) return
    ensureSeeded().then(() => setSeeded(true))
  }, [loading, cloud, session, profileLoading, isApproved])

  // ── Loading ───────────────────────────────────────────────────────
  if (loading || (cloud && session && profileLoading))
    return (
      <div className="p-10 text-center text-muted font-display">
        Indlæser…
      </div>
    )

  // ── Ikke logget ind ───────────────────────────────────────────────
  if (cloud && !session) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  // ── Afventer godkendelse ──────────────────────────────────────────
  if (cloud && profile?.status === 'pending') {
    return <PendingApproval onRefresh={fetchProfile} />
  }

  // ── Adgang nægtet ────────────────────────────────────────────────
  if (cloud && profile?.status === 'rejected') {
    return <RejectedScreen />
  }

  // ── Seed-loading ─────────────────────────────────────────────────
  if (!seeded)
    return (
      <div className="p-10 text-center text-muted font-display">
        Klargør bibliotek…
      </div>
    )

  const isAdmin = profile?.role === 'admin'

  // ── App ───────────────────────────────────────────────────────────
  return (
    <Shell isAdmin={isAdmin}>
      <Routes>
        <Route path="/"               element={<Navigate to="/week" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/week"           element={<WeekPlan />} />
        <Route path="/day"            element={<DayPlan />} />
        <Route path="/library"        element={<Library />} />
        {cloud && (
          <Route path="/household" element={<Household />} />
        )}
        {isAdmin && (
          <Route path="/admin" element={<Admin />} />
        )}
        <Route path="*" element={<Navigate to="/week" replace />} />
      </Routes>
    </Shell>
  )
}
