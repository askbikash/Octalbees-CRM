import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Building2, Settings, LogOut, Menu, X, Sun, Moon, Zap, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Follow-ups', path: '/followups', icon: CalendarDays },
    { name: 'Colleges', path: '/colleges', icon: Building2 },
    { name: 'Team & Users', path: '/users', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    navItems.splice(5, 0, { name: 'Audit Trail', path: '/audit', icon: Activity });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50">
        <div>
          {isDarkMode ? (
            <img src="/Logo-white.png" alt="Octalbees" className="h-8 w-auto object-contain" />
          ) : (
            <img src="/logo-black.png" alt="Octalbees" className="h-8 w-auto object-contain" />
          )}
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 dark:text-slate-300">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-zinc-800 hidden md:flex">
          {isDarkMode ? (
            <img src="/Logo-white.png" alt="Octalbees" className="h-10 w-auto object-contain" />
          ) : (
            <img src="/logo-black.png" alt="Octalbees" className="h-10 w-auto object-contain" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-2">Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-orange-400 shadow-sm" 
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon size={20} className={cn("transition-colors", isActive ? "text-purple-600 dark:text-orange-400" : "")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
          
          {/* Unified Account Card */}
          <div className="bg-slate-50 dark:bg-zinc-900/80 rounded-2xl p-3 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-purple-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate tracking-wide">{user?.role}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-1 border-t border-slate-200 dark:border-zinc-800/80 my-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                {isDarkMode ? <Moon size={14} className="text-orange-400" /> : <Sun size={14} className="text-purple-600" />} Theme
              </span>
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-zinc-800 transition-colors hover:bg-slate-300 dark:hover:bg-zinc-700 focus:outline-none border border-slate-300 dark:border-zinc-700"
                aria-label="Toggle dark mode"
              >
                <span
                  className={cn(
                    "inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm",
                    isDarkMode ? "translate-x-6 bg-zinc-300" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/30"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64 flex flex-col min-h-screen pt-16 md:pt-0">
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
