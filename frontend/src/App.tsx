import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { MainLayout } from './components/layouts/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'

// A placeholder for the protected route logic
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // For now, we will assume the user is authenticated to show the new layout.
  // The real logic from the old App.tsx can be re-integrated later.
  const isAuthenticated = true; // useAuthStore((state) => state.isAuthenticated);

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
        {/* The default page after login */}
        <Route index element={<DashboardPage />} />
        
        {/* 
          Other pages can be added here later.
          For example:
          <Route path="pools" element={<PoolsPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
        */}
      </Route>

      {/* Catch-all redirects to the main dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App;