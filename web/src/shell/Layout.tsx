import { Outlet } from 'react-router'
import { useMediaQuery, WAP_QUERY } from '../useMediaQuery'
import { WapNav } from './WapNav'
import { WebNav } from './WebNav'

export function Layout() {
  const isWap = useMediaQuery(WAP_QUERY)
  return (
    <div data-platform={isWap ? 'wap' : 'web'} className="min-h-screen bg-slate-50 text-slate-900">
      {isWap ? <WapNav /> : <WebNav />}
      <main className={isWap ? 'px-4 py-4' : 'mx-auto max-w-6xl px-6 py-8'}>
        <Outlet />
      </main>
    </div>
  )
}
