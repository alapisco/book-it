import { Navigate, Outlet, useSearchParams } from 'react-router'
import { getToken } from '../api'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'
import { WapNav } from './WapNav'
import { WebNav } from './WebNav'

// isPublic: no auth gate, nav only when logged in. ?embed=1 hides the nav
// (the native apps embed /policies in a webview; docs/tech/studio-policies.md).
export function Layout({ isPublic = false }: { isPublic?: boolean }) {
  const isWap = useMediaQuery(WAP_QUERY)
  const [params] = useSearchParams()
  const loggedIn = getToken() !== null
  if (!isPublic && !loggedIn) return <Navigate to="/login" replace />
  const showNav = loggedIn && params.get('embed') !== '1'
  return (
    <div data-platform={isWap ? 'wap' : 'web'} className="min-h-screen bg-slate-50 text-slate-900">
      {showNav && (isWap ? <WapNav /> : <WebNav />)}
      <main className={isWap ? 'px-4 py-4' : 'mx-auto max-w-6xl px-6 py-8'}>
        <Outlet />
      </main>
    </div>
  )
}
