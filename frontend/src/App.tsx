import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layouts/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { PoolsExplorerPage } from './pages/PoolsExplorerPage'
import { PoolDetailPage } from './pages/PoolDetailPage'

// A placeholder for the protected route logic
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // For now, we will assume the user is authenticated to show the new layout.
  const isAuthenticated = true; 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* All protected routes go within this wrapper */}
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
        
        {/* 
          Other pages can be added here later.
          For example:
          <Route path="admin" element={<AdminDashboardPage />} />
        */}
      </Route>

      {/* Catch-all redirects to the main dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App;