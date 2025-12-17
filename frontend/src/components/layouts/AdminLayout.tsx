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
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Pools',
    href: '/admin/pools',
    icon: Briefcase,
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Retraits',
    href: '/admin/withdrawals',
    icon: DollarSign,
  },
  {
    name: 'Transactions',
    href: '/admin/transactions',
    icon: FileText,
  },
  {
    name: 'Statistiques',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Sécurité',
    href: '/admin/security',
    icon: Shield,
  },
  {
    name: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      <div className="flex pt-16">
        {/* Admin Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-dark-900 border-r border-gray-800 p-6 hidden md:block fixed left-0 top-16 bottom-0">
          <div className="text-xl font-bold text-white mb-8">
            <Shield className="h-5 w-5 inline-block mr-2 text-primary-500" />
            Administration
          </div>
          
          <nav className="space-y-1">
            {adminNavigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>
        
        <main className="flex-1 p-8 ml-64">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
