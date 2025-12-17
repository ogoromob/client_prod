// src/components/sidebar/Sidebar.tsx
import { Home, BarChart2, Settings, Users } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-dark-900 border-r border-gray-800 p-6 hidden md:block">
      <div className="text-2xl font-bold text-primary-500 mb-12">
        TradingPool
      </div>
      <nav className="space-y-4">
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </a>
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
          <BarChart2 className="h-5 w-5" />
          <span>Pools</span>
        </a>
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
          <Users className="h-5 w-5" />
          <span>Admin</span>
        </a>
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </a>
      </nav>
    </aside>
  );
}
