import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LeadsPage from './pages/LeadsPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import OrderDetailPage from './pages/OrderDetailPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import AttributionPage from './pages/AttributionPage.jsx'
import ContentPage from './pages/ContentPage.jsx'
import LinkedInPage from './pages/LinkedInPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />

        <Route
          path="leads"
          element={
            <ProtectedRoute roles={['superadmin', 'admin', 'staff']}>
              <LeadsPage />
            </ProtectedRoute>
          }
        />

        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="customers" element={<CustomersPage />} />

        <Route
          path="users"
          element={
            <ProtectedRoute roles={['superadmin', 'admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="pricing"
          element={
            <ProtectedRoute roles={['superadmin', 'admin']}>
              <PricingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="attribution"
          element={
            <ProtectedRoute roles={['superadmin', 'admin']}>
              <AttributionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="content"
          element={
            <ProtectedRoute roles={['superadmin', 'admin']}>
              <ContentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="linkedin"
          element={
            <ProtectedRoute roles={['superadmin']}>
              <LinkedInPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
