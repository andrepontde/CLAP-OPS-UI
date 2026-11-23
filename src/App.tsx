import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './features/auth/LoginPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { OperatorCreatePage } from './features/operators/OperatorCreatePage'
import { OperatorDetailPage } from './features/operators/OperatorDetailPage'
import { OperatorEditPage } from './features/operators/OperatorEditPage'
import { OperatorListPage } from './features/operators/OperatorListPage'
import { VehicleCreatePage } from './features/vehicles/VehicleCreatePage'
import { VehicleDetailPage } from './features/vehicles/VehicleDetailPage'
import { VehicleEditPage } from './features/vehicles/VehicleEditPage'
import { VehicleListPage } from './features/vehicles/VehicleListPage'
import { FuelEnergyListPage } from './features/fuel-energy/FuelEnergyListPage'
import { FuelEnergyCreatePage } from './features/fuel-energy/FuelEnergyCreatePage'
import { FuelEnergyDetailPage } from './features/fuel-energy/FuelEnergyDetailPage'
import { FuelEnergyEditPage } from './features/fuel-energy/FuelEnergyEditPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/operators">
              <Route index element={<OperatorListPage />} />
              <Route path="new" element={<OperatorCreatePage />} />
              <Route path=":operatorId/edit" element={<OperatorEditPage />} />
              <Route path=":operatorId" element={<OperatorDetailPage />} />
            </Route>
            <Route path="/vehicles">
              <Route index element={<VehicleListPage />} />
              <Route path="new" element={<VehicleCreatePage />} />
              <Route path=":vehicleId/edit" element={<VehicleEditPage />} />
              <Route path=":vehicleId" element={<VehicleDetailPage />} />
            </Route>
            <Route path="/fuel-energy">
              <Route index element={<FuelEnergyListPage />} />
              <Route path=":kind/new" element={<FuelEnergyCreatePage />} />
              <Route path=":kind/:entryId/edit" element={<FuelEnergyEditPage />} />
              <Route path=":kind/:entryId" element={<FuelEnergyDetailPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
