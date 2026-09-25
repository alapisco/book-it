import { Navigate, Route, Routes } from 'react-router'
import { Placeholder } from './pages/Placeholder'
import { Layout } from './shell/Layout'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/schedule" element={<Placeholder title="Schedule" />} />
        <Route path="/bookings" element={<Placeholder title="My bookings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/schedule" replace />} />
    </Routes>
  )
}
