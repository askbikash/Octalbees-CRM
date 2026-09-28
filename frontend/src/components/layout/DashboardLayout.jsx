import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Building2, Settings, LogOut, Menu, X, Sun, Moon, Zap, Activity, FileText, BarChart3, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationsMenu from './NotificationsMenu';
import UserMenu from './UserMenu';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/leads');
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder="Search leads..."]');
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Follow-ups', path: '/followups', icon: CalendarDays },
    { name: 'Colleges', path: '/colleges', icon: Building2 },
    { name: 'Templates', path: '/templates', icon: FileText },
    { name: 'Email Logs', path: '/emails', icon: Mail },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push(
      { name: 'Reports', path: '/reports', icon: BarChart3 },
      { name: 'Team & Users', path: '/users', icon: Users },
      { name: 'Audit Trail', path: '/audit', icon: Activity }
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30">
        <div>
          {isDarkMode ? (
            <img src="/Logo-white.png" alt="Octalbees" className="h-8 w-auto object-contain" />
          ) : (
            <img src="/logo-black.png" alt="Octalbees" className="h-8 w-auto object-contain" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <NotificationsMenu />
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 dark:text-slate-300 ml-1">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col shadow-2xl md:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-zinc-800">
          {isDarkMode ? (
            <img src="/Logo-white.png" alt="Octalbees" className="h-8 md:h-10 w-auto object-contain" />
          ) : (
            <img src="/logo-black.png" alt="Octalbees" className="h-8 md:h-10 w-auto object-contain" />
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white p-2"
          >
            <X size={24} />
          </button>
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

        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          <UserMenu />
          <div className="hidden md:block">
            <NotificationsMenu />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-72 flex flex-col min-h-screen pb-16 md:pb-0 relative">
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 z-30 px-2 py-2 flex justify-around items-center safe-area-pb">
        {[
          { name: 'Home', path: '/', icon: LayoutDashboard },
          { name: 'Leads', path: '/leads', icon: Users },
          { name: 'Follow-ups', path: '/followups', icon: CalendarDays },
          { name: 'Menu', action: () => setIsMobileMenuOpen(true), icon: Menu },
        ].map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.path ? (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))) : false;
          
          if (item.action) {
            return (
              <button key={idx} onClick={item.action} className="flex flex-col items-center justify-center w-16 h-12 text-slate-500 dark:text-zinc-400">
                <Icon size={20} />
                <span className="text-[10px] mt-1 font-medium">Menu</span>
              </button>
            );
          }

          return (
            <Link key={idx} to={item.path} className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${isActive ? 'text-purple-600 dark:text-orange-400' : 'text-slate-500 dark:text-zinc-400'}`}>
              <Icon size={20} className={isActive ? 'animate-in zoom-in-75 duration-200' : ''} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardLayout;
