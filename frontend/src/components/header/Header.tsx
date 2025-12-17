// src/components/header/Header.tsx
import { Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-6 bg-dark-900 border-b border-gray-800">
      <div>
        {/* Search bar can go here */}
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <UserCircle className="h-8 w-8 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@tradingpool.pro</p>
          </div>
        </div>
      </div>
    </header>
  );
}
