import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ShieldCheck, Zap, TrendingUp, Copy, Check } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const TEST_ACCOUNTS = [
  {
    name: 'Super Admin',
    email: 'superadmin@tradingpool.com',
    password: 'SuperAdmin@2024',
    role: 'SUPER_ADMIN',
    description: 'Accès complet à toutes les fonctionnalités',
  },
  {
    name: 'Admin',
    email: 'admin@tradingpool.com',
    password: 'Admin@2024',
    role: 'ADMIN',
    description: 'Gestion des pools et utilisateurs',
  },
  {
    name: 'Investor',
    email: 'investor@tradingpool.com',
    password: 'Investor@2024',
    role: 'INVESTOR',
    description: 'Accès utilisateur standard',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: 'superadmin@tradingpool.com',
    password: 'SuperAdmin@2024',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setLoading(true);
    
    try {
      const { user, tokens } = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      login(user, tokens.accessToken, tokens.refreshToken);
      
      toast.success('Connexion réussie', {
        description: `Bienvenue ${user.email}`,
        icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
      });
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Échec de la connexion', {
        description: error.response?.data?.message || error.message || 'Email ou mot de passe incorrect',
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur-lg opacity-75 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              TradingPool
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium">Plateforme de Trading Avancée</p>
        </div>

        {/* Login Card */}
        <div className="relative group animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Card glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse" />
          
          {/* Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
            {/* Card header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Connexion</h2>
              <p className="text-slate-400 text-sm">Accédez à votre plateforme de trading</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2 group/input">
                <label htmlFor="email" className="text-sm font-semibold text-slate-300 block">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="sesshomaru@admin.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-slate-800/50 backdrop-blur-sm border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-slate-700/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                    }`}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within/input:from-cyan-500/10 group-focus-within/input:via-cyan-500/5 group-focus-within/input:to-blue-500/10 pointer-events-none transition-all duration-300" />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2 group/input">
                <label htmlFor="password" className="text-sm font-semibold text-slate-300 block">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full bg-slate-800/50 backdrop-blur-sm border rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-slate-700/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-blue-500/0 group-focus-within/input:from-cyan-500/10 group-focus-within/input:via-cyan-500/5 group-focus-within/input:to-blue-500/10 pointer-events-none transition-all duration-300" />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                    disabled={isLoading}
                  />
                  <span>Se souvenir de moi</span>
                </label>
                <Link to="#" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group/btn mt-8"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-75 group-hover/btn:opacity-100 transition duration-300 group-disabled/btn:opacity-50" />
                <div className="relative px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 group-hover/btn:from-cyan-500 group-hover/btn:to-blue-500 transition-all duration-300">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5" />
                      Se connecter
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/80 text-slate-400">Comptes de Test</span>
              </div>
            </div>

            {/* Test Accounts */}
            <div className="space-y-3 mb-6">
              {TEST_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setFormData({
                      email: account.email,
                      password: account.password,
                    });
                  }}
                  className="w-full text-left p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {account.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{account.description}</p>
                      <p className="text-xs font-mono text-slate-500 mt-2">{account.email}</p>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-700/50 text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-all">
                      {account.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-slate-400 mt-6">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-12 text-center text-xs text-slate-500">
          <p>Plateforme sécurisée • Authentification JWT • Données chiffrées</p>
        </div>
      </div>
    </div>
  );
}
