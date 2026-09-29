import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Radio } from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeSwitch from './ThemeSwitch';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-nerv-950 text-text-primary">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-nerv-900/90 backdrop-blur-xl border-b border-nerv-700/20 z-30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-nerv-800 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-sm">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">NERV-TRUST</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitch collapsed className="!border-none !bg-transparent" />
          <div className="badge badge-demo text-[0.6rem] py-0.5 px-2">
            Prototype
          </div>
        </div>
      </div>

      {/* Sidebar with mobile drawer support */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 min-h-screen pt-14 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
