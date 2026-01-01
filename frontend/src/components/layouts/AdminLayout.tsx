// src/components/layouts/AdminLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { Header } from '@/components/header/Header';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  DollarSign, 
  Settings,
  BarChart3,
  FileText,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pools', href: '/admin/pools', icon: Briefcase },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Retraits', href: '/admin/withdrawals', icon: DollarSign },
  { name: 'Transactions', href: '/admin/transactions', icon: FileText },
  { name: 'Sécurité', href: '/admin/security', icon: Shield },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 flex flex-col">
      {/* Header Fixe en haut */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      
      <div className="flex pt-20 h-screen">
        {/* Sidebar Fixe à gauche */}
        <aside className="w-64 bg-dark-900 border-r border-gray-800 hidden md:flex flex-col fixed left-0 top-20 bottom-0 overflow-y-auto z-40">
          <div className="p-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Menu Principal
            </div>
            <nav className="space-y-1">
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-dark-800'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Contenu Principal - Avec marge à gauche pour éviter la sidebar */}
        <main className="flex-1 md:ml-64 p-6 overflow-y-auto bg-dark-950">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
