import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './features/auth/LoginPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { VehicleCreatePage } from './features/vehicles/VehicleCreatePage'
import { VehicleDetailPage } from './features/vehicles/VehicleDetailPage'
import { VehicleEditPage } from './features/vehicles/VehicleEditPage'
import { VehicleListPage } from './features/vehicles/VehicleListPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles">
              <Route index element={<VehicleListPage />} />
              <Route path="new" element={<VehicleCreatePage />} />
              <Route path=":vehicleId/edit" element={<VehicleEditPage />} />
              <Route path=":vehicleId" element={<VehicleDetailPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
