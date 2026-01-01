import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/header/Header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Menu, X } from 'lucide-react';

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-dark-950 text-gray-200 overflow-hidden font-sans">
      {/* 1. Sidebar Desktop (Cachée sur mobile, visible sur md+) */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>

      {/* 2. Sidebar Mobile (Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Fond sombre cliquable pour fermer */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* La Sidebar elle-même */}
          <div className="relative flex w-64 flex-1 flex-col bg-dark-900 border-r border-gray-800 transition-transform duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Zone de Contenu Principal */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-0">
        {/* Header avec bouton Menu Mobile */}
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-dark-900/50 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Ouvrir menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              TradingPool Admin
            </div>
          </div>
          {/* Composant Header existant pour les notifs/profil */}
          <div className="flex items-center">
            <Header />
          </div>
        </header>

        {/* Contenu Scrollable */}
        <main className="flex-1 overflow-y-auto bg-dark-950 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
