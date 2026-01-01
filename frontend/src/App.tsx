import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layouts/MainLayout'
import { AdminLayout } from './components/layouts/AdminLayout'
import { LoadingSpinner } from './components/LoadingSpinner'

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const PoolsExplorerPage = lazy(() => import('./pages/PoolsExplorerPage').then(m => ({ default: m.PoolsExplorerPage })))
const PoolDetailPage = lazy(() => import('./pages/PoolDetailPage').then(m => ({ default: m.PoolDetailPage })))

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.default })))
const PoolsManagementPage = lazy(() => import('./pages/admin/PoolsManagementPage').then(m => ({ default: m.default })))
const WithdrawalsManagementPage = lazy(() => import('./pages/admin/WithdrawalsManagementPage').then(m => ({ default: m.default })))
const UsersManagementPage = lazy(() => import('./pages/admin/UsersManagementPage').then(m => ({ default: m.default })))

// Protected route component with real authentication check
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = Boolean(localStorage.getItem('accessToken'));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark-900"><LoadingSpinner size="lg" /></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Investor routes */}
        <Route 
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pools" element={<PoolsExplorerPage />} />
          <Route path="pools/:id" element={<PoolDetailPage />} />
        </Route>

        {/* Admin routes */}
        <Route 
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="pools" element={<PoolsManagementPage />} />
          <Route path="withdrawals" element={<WithdrawalsManagementPage />} />
          <Route path="users" element={<UsersManagementPage />} />
          {/* More admin routes will be added here */}
        </Route>

        {/* Catch-all redirects to the main dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App;