import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Sun, Moon, Settings, User, ChevronUp, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

function cn(...inputs) {
  return clsx(inputs);
}

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative flex-1 min-w-0" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 text-left border border-transparent",
          isOpen ? "bg-white dark:bg-zinc-800 shadow-sm border-slate-200 dark:border-zinc-700" : "hover:bg-white/50 dark:hover:bg-zinc-800/50 hover:border-slate-200/50 dark:hover:border-zinc-700/50"
        )}
      >
        <div className="w-10 h-10 rounded-full bg-purple-600 dark:bg-orange-500 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate">{user?.role}</p>
        </div>
        <div className="text-slate-400 dark:text-zinc-500 ml-1 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={16} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-2">
          
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 dark:bg-orange-500 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="p-2 space-y-1">
            <Link 
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50 dark:text-zinc-300 dark:hover:text-orange-400 dark:hover:bg-orange-500/10 transition-all duration-200"
            >
              <div className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors shadow-sm">
                <Settings size={16} />
              </div>
              Settings
            </Link>

            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all duration-200 group">
              <span className="flex items-center gap-3">
                <div className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors shadow-sm">
                  {isDarkMode ? <Moon size={16} className="text-orange-400" /> : <Sun size={16} className="text-purple-600" />} 
                </div>
                Theme
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
                className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200 dark:bg-zinc-700 transition-colors hover:bg-slate-300 dark:hover:bg-zinc-600 focus:outline-none"
              >
                <span
                  className={cn(
                    "inline-flex h-3.5 w-3.5 transform items-center justify-center rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm",
                    isDarkMode ? "translate-x-4.5 bg-zinc-200" : "translate-x-1"
                  )}
                  style={{ transform: isDarkMode ? 'translateX(18px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
            
            <div className="h-px bg-slate-100 dark:bg-zinc-800/50 my-2 mx-2"></div>

            <button 
              onClick={handleLogout}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-all duration-200 text-left"
            >
              <div className="p-1 rounded-lg bg-red-50 dark:bg-red-500/10 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors shadow-sm">
                <LogOut size={16} />
              </div>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
