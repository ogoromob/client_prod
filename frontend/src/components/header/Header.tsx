import { Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-dark-800">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-500 shadow-glow" />
      </button>

      {/* Séparateur */}
      <div className="h-6 w-px bg-gray-800" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </div>
  );
}
