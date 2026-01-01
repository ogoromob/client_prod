import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/header/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Menu, X } from 'lucide-react';

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-200 overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* 1. Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col relative z-20">
        <Sidebar />
      </div>

      {/* 2. Sidebar Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex w-64 flex-1 flex-col bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 transition-transform duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl px-4 sm:px-6 lg:px-8 shadow-lg shadow-slate-900/50">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-cyan-400 md:hidden transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Ouvrir menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              TradingPool Admin
            </div>
          </div>
          <div className="flex items-center">
            <Header />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
