import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router'
import { getToken } from '../api'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'
import { AppBar } from './AppBar'
import { TabBar } from './TabBar'
import { WebNav } from './WebNav'

const TITLES: Record<string, string> = {
  '/schedule': 'Schedule',
  '/week': 'Week',
  '/bookings': 'My bookings',
  '/policies': 'Policies',
}

// web: nav bar. wap: app bar + bottom tabs, like the native apps (ADR 0008).
// Pushed screens (class detail) render their own app bar with a back control.
// isPublic: no auth gate, shell only when logged in. ?embed=1 hides the shell
// (the native apps embed /policies in a webview).
export function Layout({ isPublic = false }: { isPublic?: boolean }) {
  const isWap = useMediaQuery(WAP_QUERY)
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const loggedIn = getToken() !== null
  if (!isPublic && !loggedIn) return <Navigate to="/login" replace />
  const showShell = loggedIn && params.get('embed') !== '1'
  const pushed = pathname.startsWith('/classes/')

  if (!isWap) {
    return (
      <div data-platform="web" className="min-h-screen bg-slate-50 text-slate-900">
        {showShell && <WebNav />}
        <main className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    )
  }
  return (
    <div data-platform="wap" className="min-h-screen bg-slate-50 text-slate-900">
      {showShell && !pushed && <AppBar title={TITLES[pathname] ?? 'BookIt'} />}
      <main className={showShell && !pushed ? 'px-4 pt-4 pb-24' : 'px-4 pb-4'}>
        <Outlet />
      </main>
      {showShell && !pushed && <TabBar />}
    </div>
  )
}
