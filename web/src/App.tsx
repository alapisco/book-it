import { Navigate, Route, Routes } from 'react-router'
import { BookingsPage } from './pages/BookingsPage'
import { ClassPage } from './pages/ClassPage'
import { LoginPage } from './pages/LoginPage'
import { PoliciesPage } from './pages/PoliciesPage'
import { SchedulePage } from './pages/SchedulePage'
import { WeekPage } from './pages/WeekPage'
import { Layout } from './shell/Layout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/classes/:id" element={<ClassPage />} />
        <Route path="/week" element={<WeekPage />} />
        {/* The web-only calendar grid was removed in M4 (week-calendar v2). */}
        <Route path="/calendar" element={<Navigate to="/schedule" replace />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Route>
      <Route element={<Layout isPublic />}>
        <Route path="/policies" element={<PoliciesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/schedule" replace />} />
    </Routes>
  )
}
