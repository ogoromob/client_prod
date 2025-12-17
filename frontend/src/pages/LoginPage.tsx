// src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Validation
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

  // Handle submit
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
      
      // Sauvegarder dans le store
      login(user, tokens.accessToken, tokens.refreshToken);
      
      // Notification de succès
      toast.success('Connexion réussie', {
        description: `Bienvenue ${user.email}`,
        icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
      });
      
      // Redirection selon le rôle
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-dark-900 to-dark-950 p-4">
      <Card className="w-full max-w-md" glass>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Connexion</CardTitle>
          <p className="text-center text-gray-400 text-sm mt-2">
            Accédez à votre plateforme de trading
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="sesshomaru@admin.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-dark-800 border rounded-md p-2 text-white focus:ring-2 focus:outline-none transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-700 focus:ring-primary-500 focus:border-primary-500'
                }`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full bg-dark-800 border rounded-md p-2 pr-10 text-white focus:ring-2 focus:outline-none transition-colors ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-700 bg-dark-800 text-primary-500 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="#" className="text-primary-500 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-4">
            <Button 
              type="submit"
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
            
            <p className="text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary-500 hover:underline">
                S'inscrire
              </Link>
            </p>

            {/* Demo credentials hint */}
            <div className="w-full p-3 bg-dark-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                <strong className="text-gray-300">Demo:</strong> sesshomaru@admin.com / inyasha
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
