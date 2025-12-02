#!/bin/bash

# Script pour générer tous les composants frontend manquants
# Ce script crée une application React complète avec authentification, gestion de pools, et interface admin

echo "🚀 Génération de l'application frontend Trading Pool..."

cd /home/user/webapp/frontend/src

# Créer le fichier main.tsx
cat > main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
EOF

# Créer App.tsx
cat > App.tsx << 'EOF'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import InvestorLayout from './components/layout/InvestorLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'

// Investor Pages
import DashboardPage from './pages/investor/DashboardPage'
import PoolsPage from './pages/investor/PoolsPage'
import PoolDetailPage from './pages/investor/PoolDetailPage'
import InvestmentsPage from './pages/investor/InvestmentsPage'
import InvestmentDetailPage from './pages/investor/InvestmentDetailPage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminPoolsPage from './pages/admin/AdminPoolsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Investor Routes */}
      <Route element={<ProtectedRoute><InvestorLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pools" element={<PoolsPage />} />
        <Route path="/pools/:id" element={<PoolDetailPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/investments/:id" element={<InvestmentDetailPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/pools" element={<AdminPoolsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
EOF

echo "✅ Fichiers principaux créés"
echo "📦 Application frontend Trading Pool générée avec succès!"
echo ""
echo "Pour continuer:"
echo "1. cd /home/user/webapp/frontend"
echo "2. npm run dev"
echo ""
echo "Credentials de test:"
echo "  Investisseur: investor@example.com / Password123!"
echo "  Admin: sesshomaru@admin.com / inyasha"
EOF

chmod +x /home/user/webapp/generate-frontend.sh

echo "Script de génération créé avec succès!"
