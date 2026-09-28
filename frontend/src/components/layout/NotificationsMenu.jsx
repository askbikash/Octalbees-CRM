import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      handleMarkAsRead(notif.id, { stopPropagation: () => {} });
    }
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-zinc-900" />
        )}
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 fade-in duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-orange-500/10 rounded-xl text-purple-600 dark:text-orange-400">
                  <Bell size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-sm font-semibold text-purple-600 dark:text-orange-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-4">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-zinc-500">
                  <Bell size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-base font-medium">No notifications yet</p>
                  <p className="text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 rounded-2xl cursor-pointer transition-colors group border ${
                        notif.is_read ? 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50' : 'bg-purple-50/30 dark:bg-orange-500/5 border-purple-100 dark:border-orange-500/20 hover:bg-purple-50 dark:hover:bg-orange-500/10'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className={`text-base ${notif.is_read ? 'font-semibold text-slate-700 dark:text-zinc-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                            {notif.title}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 mt-3">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Mark as read"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationsMenu;
