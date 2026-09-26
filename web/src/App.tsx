import { Navigate, Route, Routes } from 'react-router'
import { BookingsPage } from './pages/BookingsPage'
import { CalendarPage } from './pages/CalendarPage'
import { ClassPage } from './pages/ClassPage'
import { LoginPage } from './pages/LoginPage'
import { PoliciesPage } from './pages/PoliciesPage'
import { SchedulePage } from './pages/SchedulePage'
import { Layout } from './shell/Layout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/classes/:id" element={<ClassPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Route>
      <Route element={<Layout isPublic />}>
        <Route path="/policies" element={<PoliciesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/schedule" replace />} />
    </Routes>
  )
}
