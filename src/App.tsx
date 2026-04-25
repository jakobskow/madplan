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
  const [navOpen, setNavOpen] = useState(false)

  const navLink = (to: string, label: string) => (
    <NavLink
      to={to}
      onClick={() => setNavOpen(false)}
      className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
    >
      {label}
    </NavLink>
  )

  const navLinkMobile = (to: string, label: string) => (
    <NavLink
      to={to}
      onClick={() => setNavOpen(false)}
      className={({ isActive }) =>
        `btn ${isActive ? 'btn-primary' : 'btn-ghost'} justify-start w-full`
      }
    >
      {label}
    </NavLink>
  )

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur bg-cream/80 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 flex-1 ml-4">
            {navLink('/week', 'Ugeplan')}
            {navLink('/day', 'Dagsplan')}
            {navLink('/library', 'Bibliotek')}
            {cloud && navLink('/household', 'Husstand')}
            {isAdmin && navLink('/admin', 'Admin')}
          </nav>

          {/* Desktop: email + log ud */}
          <div className="hidden md:flex text-xs text-muted items-center gap-2">
            {cloud ? (
              <>
                <span className="hidden lg:inline">{session?.user?.email}</span>
                <button className="btn btn-ghost" onClick={() => signOut()}>Log ud</button>
              </>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-sage-soft text-sage-dark text-[11px] font-medium" title="Data gemmes lokalt i browseren">
                Lokal tilstand
              </span>
            )}
          </div>

          {/* Mobil: hamburger */}
          <button
            className="md:hidden ml-auto btn btn-ghost !px-2.5"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Menu"
          >
            <span className="text-lg leading-none">{navOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobil dropdown-menu */}
        {navOpen && (
          <div className="md:hidden border-t border-line bg-cream/95 px-4 py-3 flex flex-col gap-1">
            {navLinkMobile('/week', 'Ugeplan')}
            {navLinkMobile('/day', 'Dagsplan')}
            {navLinkMobile('/library', 'Bibliotek')}
            {cloud && navLinkMobile('/household', 'Husstand')}
            {isAdmin && navLinkMobile('/admin', 'Admin')}
            {cloud && (
              <button
                className="btn btn-ghost justify-start w-full text-sm mt-1 border-t border-line pt-2"
                onClick={() => { setNavOpen(false); signOut() }}
              >
                Log ud
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-5 py-5 md:py-8">
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
