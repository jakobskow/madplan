import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Library from './pages/Library'
import WeekPlan from './pages/WeekPlan'
import DayPlan from './pages/DayPlan'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import { useSession, signOut } from './lib/auth'
import { ensureSeeded, isCloudMode } from './lib/data'
import { Logo } from './components/Logo'

function Shell({ children }: { children: React.ReactNode }) {
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8">{children}</main>
      <footer className="py-6 text-center text-xs text-muted">
        Lavet med <span className="text-terracotta">♥</span> og masser af skyr
      </footer>
    </div>
  )
}

export default function App() {
  const { session, loading, cloud } = useSession()
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    if (loading) return
    if (cloud && !session) return
    ensureSeeded().then(() => setSeeded(true))
  }, [loading, cloud, session])

  if (loading)
    return (
      <div className="p-10 text-center text-muted font-display">Indlæser…</div>
    )

  if (cloud && !session) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  if (!seeded)
    return (
      <div className="p-10 text-center text-muted font-display">
        Klargør bibliotek…
      </div>
    )

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/week" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/week" element={<WeekPlan />} />
        <Route path="/day" element={<DayPlan />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </Shell>
  )
}
