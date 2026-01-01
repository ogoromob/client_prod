import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  DollarSign,
  Settings,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Gestion Pools', href: '/admin/pools', icon: Briefcase },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Retraits', href: '/admin/withdrawals', icon: DollarSign },
  { name: 'Logs & Audit', href: '/admin/audit', icon: Activity },
  { name: 'Sécurité', href: '/admin/security', icon: ShieldAlert },
  { name: 'Configuration', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-dark-900 border-r border-gray-800">
      {/* Logo Area */}
      <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-gray-800/50">
        <span className="text-2xl font-bold text-white">
          TP<span className="text-primary-500">.Pro</span>
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-1 flex-col overflow-y-auto py-6 px-3">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 shadow-glow-sm border border-primary-500/20'
                    : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                )
              }
            >
              <item.icon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  'group-hover:text-white'
                )}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User / Footer Area */}
      <div className="border-t border-gray-800 p-4 bg-dark-900">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500" />
          <div>
            <p className="text-sm font-medium text-white">Super Admin</p>
            <p className="text-xs text-gray-500">Secured Session</p>
          </div>
        </div>
      </div>
    </div>
  );
}
