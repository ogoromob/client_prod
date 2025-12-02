import { Routes, Route, Navigate, Outlet, Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from './services/authService'
import { poolService, investmentService } from './services/poolService'
import { withdrawalService } from './services/withdrawalService'
import { adminService } from './services/adminService'
import { formatCurrency, formatPercentage, getPercentageColor, formatDate, formatRelativeDate } from './utils/format'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { 
  Home, TrendingUp, Wallet, LogOut, Shield, Users, 
  DollarSign, Activity, AlertCircle, CheckCircle, Clock, X, Menu
} from 'lucide-react'

// Protected Route Component
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

// Public Layout
function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <nav className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary-500">TradingPool</Link>
            <div className="flex gap-4">
              <Link to="/login" className="btn-secondary">Connexion</Link>
              <Link to="/register" className="btn-primary">S'inscrire</Link>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

// Investor Layout
function InvestorLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Déconnexion réussie')
  }
  
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-dark-800 border-r border-dark-700 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="text-xl font-bold text-primary-500">
              {sidebarOpen ? 'TradingPool' : 'TP'}
            </Link>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
          
          <nav className="space-y-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-gray-300 hover:text-white transition-colors">
              <Home size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </Link>
            <Link to="/pools" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-gray-300 hover:text-white transition-colors">
              <TrendingUp size={20} />
              {sidebarOpen && <span>Pools</span>}
            </Link>
            <Link to="/investments" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-gray-300 hover:text-white transition-colors">
              <Wallet size={20} />
              {sidebarOpen && <span>Mes investissements</span>}
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-yellow-400 hover:text-yellow-300 transition-colors">
                <Shield size={20} />
                {sidebarOpen && <span>Admin</span>}
              </Link>
            )}
          </nav>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

// Admin Layout (similar to Investor but with admin styling)
function AdminLayout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Déconnexion réussie')
  }
  
  return (
    <div className="min-h-screen bg-dark-900">
      <aside className={`fixed left-0 top-0 h-full bg-dark-800 border-r border-yellow-600/30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <Link to="/admin" className="text-xl font-bold text-yellow-500">
              {sidebarOpen ? 'Admin Panel' : 'AP'}
            </Link>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
          
          <nav className="space-y-2">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-gray-300 hover:text-white transition-colors">
              <Activity size={20} />
              {sidebarOpen && <span>Dashboard</span>}
            </Link>
            <Link to="/admin/pools" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-gray-300 hover:text-white transition-colors">
              <TrendingUp size={20} />
              {sidebarOpen && <span>Pools</span>}
            </Link>
            <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-gray-300 hover:text-white transition-colors">
              <Users size={20} />
              {sidebarOpen && <span>Utilisateurs</span>}
            </Link>
            <Link to="/admin/withdrawals" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-gray-300 hover:text-white transition-colors">
              <DollarSign size={20} />
              {sidebarOpen && <span>Retraits</span>}
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 text-primary-400 hover:text-primary-300 transition-colors">
              <Home size={20} />
              {sidebarOpen && <span>Vue investisseur</span>}
            </Link>
          </nav>
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

// Landing Page
function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Investissez dans des Pools de Trading
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Accédez à des stratégies de trading profitables gérées par des experts. 
          Diversifiez votre portfolio et maximisez vos rendements.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Commencer maintenant
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">
            Se connecter
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="glass-card p-6">
            <div className="text-primary-500 text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Sécurisé</h3>
            <p className="text-gray-400">Vos fonds sont protégés avec les dernières technologies de sécurité</p>
          </div>
          <div className="glass-card p-6">
            <div className="text-primary-500 text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">Performant</h3>
            <p className="text-gray-400">Stratégies de trading éprouvées avec un historique de performances positives</p>
          </div>
          <div className="glass-card p-6">
            <div className="text-primary-500 text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Transparent</h3>
            <p className="text-gray-400">Suivi en temps réel de vos investissements et performances</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Login Page
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { user, tokens } = await authService.login({ email, password })
      login(user, tokens.accessToken, tokens.refreshToken)
      toast.success('Connexion réussie')
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (error: any) {
      toast.error('Erreur de connexion', { description: error.message })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto glass-card p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Connexion</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Pas encore de compte ? <Link to="/register" className="text-primary-500 hover:underline">S'inscrire</Link></p>
          <p className="mt-4">Test: investor@example.com / Password123!</p>
          <p>Admin: sesshomaru@admin.com / inyasha</p>
        </div>
      </div>
    </div>
  )
}

// Register Page
function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    setLoading(true)
    
    try {
      const { user, tokens } = await authService.register({ email, password, confirmPassword })
      login(user, tokens.accessToken, tokens.refreshToken)
      toast.success('Inscription réussie')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error('Erreur d\'inscription', { description: error.message })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto glass-card p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Inscription</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={12}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Déjà un compte ? <Link to="/login" className="text-primary-500 hover:underline">Se connecter</Link></p>
        </div>
      </div>
    </div>
  )
}

// Dashboard Page
function DashboardPage() {
  const { data: investments = [] } = useQuery({
    queryKey: ['my-investments'],
    queryFn: investmentService.getMyInvestments,
  })
  
  const { data: pools = [] } = useQuery({
    queryKey: ['pools'],
    queryFn: poolService.getPools,
  })
  
  const totalInvested = investments.reduce((sum, inv) => sum + inv.initialAmount, 0)
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalPnL = totalCurrent - totalInvested
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Total investi</div>
          <div className="text-3xl font-bold">{formatCurrency(totalInvested)}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Valeur actuelle</div>
          <div className="text-3xl font-bold">{formatCurrency(totalCurrent)}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">P&L Total</div>
          <div className={`text-3xl font-bold ${getPercentageColor(totalPnLPercentage)}`}>
            {formatCurrency(totalPnL)}
          </div>
          <div className={`text-sm ${getPercentageColor(totalPnLPercentage)}`}>
            {formatPercentage(totalPnLPercentage)}
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Mes investissements</h2>
          <div className="space-y-3">
            {investments.length === 0 ? (
              <div className="glass-card p-6 text-center text-gray-400">
                Aucun investissement pour le moment
              </div>
            ) : (
              investments.map((inv) => (
                <Link key={inv.id} to={`/investments/${inv.id}`} className="glass-card p-4 block hover:bg-dark-700/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{inv.poolName}</div>
                      <div className="text-sm text-gray-400">{formatDate(inv.investedAt)}</div>
                    </div>
                    <span className={inv.status === 'locked' ? 'status-active' : inv.status === 'withdrawable' ? 'status-pending' : 'status-closed'}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Investi</div>
                      <div className="font-semibold">{formatCurrency(inv.initialAmount)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Valeur actuelle</div>
                      <div className="font-semibold">{formatCurrency(inv.currentValue)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">P&L</div>
                      <div className={`font-semibold ${getPercentageColor(inv.pnlPercentage)}`}>
                        {formatPercentage(inv.pnlPercentage)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Pools disponibles</h2>
          <div className="space-y-3">
            {pools.slice(0, 3).map((pool) => (
              <Link key={pool.id} to={`/pools/${pool.id}`} className="glass-card p-4 block hover:bg-dark-700/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold">{pool.name}</div>
                  <span className={`status-${pool.status}`}>{pool.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-gray-400">Collecté</div>
                    <div className="font-semibold">{formatCurrency(pool.currentAmount)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400">P&L</div>
                    <div className={`font-semibold ${getPercentageColor((pool.totalPnL / pool.totalInvested) * 100)}`}>
                      {formatPercentage((pool.totalPnL / pool.totalInvested) * 100)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/pools" className="btn-primary w-full mt-4">
            Voir tous les pools
          </Link>
        </div>
      </div>
    </div>
  )
}

// Pools Page
function PoolsPage() {
  const { data: pools = [], isLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: poolService.getPools,
  })
  
  if (isLoading) {
    return <div className="text-center py-20">Chargement...</div>
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pools d'investissement</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map((pool) => (
          <Link key={pool.id} to={`/pools/${pool.id}`} className="glass-card p-6 hover:bg-dark-700/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{pool.name}</h3>
                <p className="text-sm text-gray-400">{pool.tradingStrategy}</p>
              </div>
              <span className={`status-${pool.status}`}>{pool.status}</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400 mb-1">Progression</div>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${(pool.currentAmount / pool.targetAmount) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>{formatCurrency(pool.currentAmount)}</span>
                  <span className="text-gray-400">{formatCurrency(pool.targetAmount)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Investissement min</div>
                  <div className="font-semibold">{formatCurrency(pool.minInvestment)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Frais manager</div>
                  <div className="font-semibold">{pool.managerFeePercentage}%</div>
                </div>
              </div>
              
              {pool.totalPnL !== 0 && (
                <div>
                  <div className="text-sm text-gray-400">Performance</div>
                  <div className={`font-semibold text-lg ${getPercentageColor((pool.totalPnL / pool.totalInvested) * 100)}`}>
                    {formatPercentage((pool.totalPnL / pool.totalInvested) * 100)}
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Pool Detail Page (simplified)
function PoolDetailPage() {
  const { id } = useParams()
  const { data: pool, isLoading } = useQuery({
    queryKey: ['pool', id],
    queryFn: () => poolService.getPoolById(id!),
  })
  
  if (isLoading) return <div className="text-center py-20">Chargement...</div>
  if (!pool) return <div>Pool not found</div>
  
  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{pool.name}</h1>
          <p className="text-gray-400">{pool.description}</p>
        </div>
        <span className={`status-${pool.status} text-lg`}>{pool.status}</span>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Montant collecté</div>
          <div className="text-2xl font-bold">{formatCurrency(pool.currentAmount)}</div>
          <div className="text-sm text-gray-400">/ {formatCurrency(pool.targetAmount)}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Performance</div>
          <div className={`text-2xl font-bold ${getPercentageColor((pool.totalPnL / pool.totalInvested) * 100)}`}>
            {formatPercentage((pool.totalPnL / pool.totalInvested) * 100)}
          </div>
          <div className="text-sm text-gray-400">{formatCurrency(pool.totalPnL)}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Investisseurs</div>
          <div className="text-2xl font-bold">{pool.currentInvestors || 0}</div>
          <div className="text-sm text-gray-400">/ {pool.maxInvestors}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Frais manager</div>
          <div className="text-2xl font-bold">{pool.managerFeePercentage}%</div>
          <div className="text-sm text-gray-400">sur gains</div>
        </div>
      </div>
      
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Détails de la stratégie</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-400">Stratégie:</span> {pool.tradingStrategy}</div>
          <div><span className="text-gray-400">Niveau de risque:</span> <span className="capitalize">{pool.riskLevel}</span></div>
          <div><span className="text-gray-400">Exchanges:</span> {pool.metadata?.exchanges?.join(', ')}</div>
          <div><span className="text-gray-400">Paires:</span> {pool.metadata?.pairs?.join(', ')}</div>
          {pool.startDate && <div><span className="text-gray-400">Date de début:</span> {formatDate(pool.startDate)}</div>}
          {pool.endDate && <div><span className="text-gray-400">Date de fin:</span> {formatDate(pool.endDate)}</div>}
        </div>
      </div>
      
      {pool.status === 'active' || pool.status === 'pending' ? (
        <button className="btn-primary w-full">Investir dans ce pool</button>
      ) : null}
    </div>
  )
}

// Investments Page
function InvestmentsPage() {
  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['my-investments'],
    queryFn: investmentService.getMyInvestments,
  })
  
  if (isLoading) return <div className="text-center py-20">Chargement...</div>
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mes investissements</h1>
      
      {investments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-gray-400 mb-4">Vous n'avez pas encore d'investissements</div>
          <Link to="/pools" className="btn-primary">
            Explorer les pools
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {investments.map((inv) => (
            <Link key={inv.id} to={`/investments/${inv.id}`} className="glass-card p-6 hover:bg-dark-700/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{inv.poolName}</h3>
                  <p className="text-sm text-gray-400">Investi le {formatDate(inv.investedAt)}</p>
                </div>
                <span className={inv.status === 'locked' ? 'status-active' : inv.status === 'withdrawable' ? 'status-pending' : 'status-closed'}>
                  {inv.status}
                </span>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-400">Montant initial</div>
                  <div className="text-xl font-semibold">{formatCurrency(inv.initialAmount)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Valeur actuelle</div>
                  <div className="text-xl font-semibold">{formatCurrency(inv.currentValue)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">P&L</div>
                  <div className={`text-xl font-semibold ${getPercentageColor(inv.pnlPercentage)}`}>
                    {formatCurrency(inv.pnl)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Performance</div>
                  <div className={`text-xl font-semibold ${getPercentageColor(inv.pnlPercentage)}`}>
                    {formatPercentage(inv.pnlPercentage)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Investment Detail Page
function InvestmentDetailPage() {
  const { id } = useParams()
  const { data: investment, isLoading } = useQuery({
    queryKey: ['investment', id],
    queryFn: () => investmentService.getInvestmentById(id!),
  })
  
  if (isLoading) return <div className="text-center py-20">Chargement...</div>
  if (!investment) return <div>Investment not found</div>
  
  const canWithdraw = investment.status === 'withdrawable'
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{investment.poolName}</h1>
      <p className="text-gray-400 mb-8">Investi le {formatDate(investment.investedAt)}</p>
      
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Montant initial</div>
          <div className="text-2xl font-bold">{formatCurrency(investment.initialAmount)}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Valeur actuelle</div>
          <div className="text-2xl font-bold">{formatCurrency(investment.currentValue)}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">P&L</div>
          <div className={`text-2xl font-bold ${getPercentageColor(investment.pnlPercentage)}`}>
            {formatCurrency(investment.pnl)}
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Performance</div>
          <div className={`text-2xl font-bold ${getPercentageColor(investment.pnlPercentage)}`}>
            {formatPercentage(investment.pnlPercentage)}
          </div>
        </div>
      </div>
      
      {canWithdraw && (
        <div className="glass-card p-6 mb-8 border border-primary-500/30">
          <h2 className="text-xl font-semibold mb-4 text-primary-400">Retrait disponible</h2>
          <p className="text-gray-400 mb-4">
            Votre investissement est maintenant disponible au retrait. Vous pouvez demander le retrait de vos fonds.
          </p>
          <button className="btn-primary">Demander un retrait</button>
        </div>
      )}
      
      {investment.status === 'locked' && investment.lockedUntil && (
        <div className="glass-card p-6 mb-8 border border-yellow-500/30">
          <div className="flex items-center gap-3 text-yellow-400 mb-2">
            <Clock size={24} />
            <h2 className="text-xl font-semibold">Fonds verrouillés</h2>
          </div>
          <p className="text-gray-400">
            Vos fonds sont verrouillés jusqu'au {formatDate(investment.lockedUntil)}. 
            Les retraits seront disponibles après le règlement du pool.
          </p>
        </div>
      )}
    </div>
  )
}

// Admin Dashboard
function AdminDashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminService.getDashboardMetrics,
  })
  
  if (isLoading) return <div className="text-center py-20">Chargement...</div>
  if (!metrics) return null
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-yellow-500">Administration</h1>
      <p className="text-gray-400 mb-8">Vue d'ensemble de la plateforme</p>
      
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 border border-yellow-500/20">
          <div className="text-sm text-gray-400 mb-2">AUM Total</div>
          <div className="text-3xl font-bold">{formatCurrency(metrics.totalAUM)}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Pools actifs</div>
          <div className="text-3xl font-bold">{metrics.activePools}</div>
          <div className="text-sm text-gray-400">/ {metrics.totalPools} total</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">Investisseurs</div>
          <div className="text-3xl font-bold">{metrics.totalInvestors}</div>
        </div>
        
        <div className="glass-card p-6">
          <div className="text-sm text-gray-400 mb-2">P&L Global</div>
          <div className="text-3xl font-bold text-green-400">{formatCurrency(metrics.totalPnL)}</div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <Link to="/admin/withdrawals" className="flex items-center justify-between p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <div className="flex items-center gap-3">
                <DollarSign className="text-yellow-400" />
                <span>Retraits en attente</span>
              </div>
              {metrics.pendingWithdrawals > 0 && (
                <span className="bg-yellow-500 text-dark-900 px-3 py-1 rounded-full font-bold">
                  {metrics.pendingWithdrawals}
                </span>
              )}
            </Link>
            
            <Link to="/admin/users" className="flex items-center justify-between p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400" />
                <span>KYC en attente</span>
              </div>
              {metrics.pendingKYC > 0 && (
                <span className="bg-blue-500 text-dark-900 px-3 py-1 rounded-full font-bold">
                  {metrics.pendingKYC}
                </span>
              )}
            </Link>
            
            <Link to="/admin/pools" className="flex items-center justify-between p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-400" />
                <span>Gérer les pools</span>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Alertes récentes</h2>
          <div className="space-y-3">
            {metrics.recentAlerts.length === 0 ? (
              <div className="text-center text-gray-400 py-4">Aucune alerte</div>
            ) : (
              metrics.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex gap-3 p-4 rounded-lg bg-dark-700">
                  {alert.type === 'warning' && <AlertCircle className="text-yellow-400" size={20} />}
                  {alert.type === 'info' && <CheckCircle className="text-blue-400" size={20} />}
                  <div className="flex-1">
                    <div className="font-semibold">{alert.title}</div>
                    <div className="text-sm text-gray-400">{alert.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatRelativeDate(alert.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Pools Page (simplified)
function AdminPoolsPage() {
  const { data: pools = [] } = useQuery({
    queryKey: ['pools'],
    queryFn: poolService.getPools,
  })
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-500">Gestion des Pools</h1>
        <button className="btn-primary">+ Créer un pool</button>
      </div>
      
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-700">
            <tr>
              <th className="text-left p-4">Nom</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-right p-4">AUM</th>
              <th className="text-right p-4">P&L</th>
              <th className="text-center p-4">Inv.</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool, i) => (
              <tr key={pool.id} className={i % 2 === 0 ? 'bg-dark-800/50' : ''}>
                <td className="p-4">
                  <div className="font-semibold">{pool.name}</div>
                  <div className="text-sm text-gray-400">{pool.tradingStrategy}</div>
                </td>
                <td className="p-4">
                  <span className={`status-${pool.status}`}>{pool.status}</span>
                </td>
                <td className="p-4 text-right font-semibold">{formatCurrency(pool.currentAmount)}</td>
                <td className={`p-4 text-right font-semibold ${getPercentageColor((pool.totalPnL / pool.totalInvested) * 100)}`}>
                  {formatPercentage((pool.totalPnL / pool.totalInvested) * 100)}
                </td>
                <td className="p-4 text-center">{pool.currentInvestors || 0}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button className="text-blue-400 hover:text-blue-300" title="Voir">👁️</button>
                    <button className="text-yellow-400 hover:text-yellow-300" title="Éditer">⚙️</button>
                    {pool.status === 'active' && (
                      <button className="text-red-400 hover:text-red-300" title="Pause">⏸️</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Admin Users Page (simplified)
function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-500 mb-8">Gestion des Utilisateurs</h1>
      <div className="glass-card p-6 text-center text-gray-400">
        Fonctionnalité en cours de développement
      </div>
    </div>
  )
}

// Admin Withdrawals Page
function AdminWithdrawalsPage() {
  const queryClient = useQueryClient()
  const { data: withdrawals = [] } = useQuery({
    queryKey: ['all-withdrawals'],
    queryFn: () => withdrawalService.getAllWithdrawals({ status: ['pending'] }),
  })
  
  const approveMutation = useMutation({
    mutationFn: withdrawalService.approveWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] })
      toast.success('Retrait approuvé')
    },
  })
  
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      withdrawalService.rejectWithdrawal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] })
      toast.success('Retrait rejeté')
    },
  })
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-500 mb-8">Retraits en attente</h1>
      
      {withdrawals.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          Aucun retrait en attente
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((wd) => (
            <div key={wd.id} className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-lg">Retrait #{wd.id.substring(0, 8)}</div>
                  <div className="text-sm text-gray-400">Demandé {formatRelativeDate(wd.requestedAt)}</div>
                </div>
                <span className="status-pending">{wd.status}</span>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400">Montant demandé</div>
                  <div className="text-xl font-semibold">{formatCurrency(wd.amount)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Frais manager (15%)</div>
                  <div className="text-xl font-semibold">{formatCurrency(wd.managerFee)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Montant net</div>
                  <div className="text-xl font-semibold text-green-400">{formatCurrency(wd.netAmount)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Méthode</div>
                  <div className="text-sm font-semibold capitalize">{wd.withdrawalMethod?.replace('_', ' ')}</div>
                </div>
              </div>
              
              {wd.destinationAddress && (
                <div className="mb-4 p-3 bg-dark-700 rounded">
                  <div className="text-sm text-gray-400">Adresse de destination</div>
                  <div className="font-mono text-sm">{wd.destinationAddress}</div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => approveMutation.mutate(wd.id)}
                  disabled={approveMutation.isPending}
                  className="btn-primary flex-1"
                >
                  <CheckCircle size={18} className="inline mr-2" />
                  Approuver
                </button>
                <button 
                  onClick={() => {
                    const reason = prompt('Raison du rejet:')
                    if (reason) rejectMutation.mutate({ id: wd.id, reason })
                  }}
                  disabled={rejectMutation.isPending}
                  className="btn-danger flex-1"
                >
                  <X size={18} className="inline mr-2" />
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Main App Router
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
