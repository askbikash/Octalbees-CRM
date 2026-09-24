import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Loader2, ArrowRight, User, Hash, Clock, ArrowDownToLine, Phone, Mail, MessageCircle, CalendarDays } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AuditTrail = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUser] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [filterUser, filterType, currentPage]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let query = `/activities?page=${currentPage}&limit=25`;
      if (filterUser) query += `&user_id=${filterUser}`;
      if (filterType) query += `&type=${filterType}`;
      
      const res = await api.get(query);
      setActivities(res.data.data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch activities', error);
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL': return <Phone size={14} className="text-blue-500" />;
      case 'EMAIL': return <Mail size={14} className="text-purple-500" />;
      case 'WHATSAPP': return <MessageCircle size={14} className="text-green-500" />;
      case 'STATUS_CHANGE': return <ArrowRight size={14} className="text-orange-500" />;
      case 'NOTE': return <Activity size={14} className="text-yellow-500" />;
      case 'FOLLOW_UP_COMPLETED': return <CalendarDays size={14} className="text-emerald-500" />;
      case 'IMPORT': return <ArrowDownToLine size={14} className="text-indigo-500" />;
      default: return <Clock size={14} className="text-slate-500" />;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-purple-600 dark:text-orange-400" />
            Audit Trail
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">Track all actions performed across the CRM.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer focus:border-purple-500 dark:focus:border-orange-500 transition-colors w-full sm:w-auto"
            >
              <option value="">All Action Types</option>
              <option value="CALL">Call</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="STATUS_CHANGE">Status Change</option>
              <option value="NOTE">Note</option>
              <option value="IMPORT">Import</option>
              <option value="FOLLOW_UP_COMPLETED">Follow Up Completed</option>
            </select>
          </div>
          
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterUser}
              onChange={(e) => { setFilterUser(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer focus:border-purple-500 dark:focus:border-orange-500 transition-colors w-full sm:w-auto"
            >
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0 flex-1">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
                <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Action Type</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Description</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Related Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-purple-600 dark:text-orange-400 mb-4" size={32} />
                    <p className="text-slate-500 dark:text-zinc-400">Loading audit trail...</p>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-20 text-center">
                    <Activity className="mx-auto text-slate-300 dark:text-zinc-600 mb-4" size={48} />
                    <p className="text-lg font-bold text-slate-900 dark:text-white">No activities found</p>
                    <p className="text-slate-500 dark:text-zinc-400">Try adjusting your filters.</p>
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                      {formatTime(act.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-orange-500/20 text-purple-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                          {act.user?.name?.[0] || '?'}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{act.user?.name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                          {getActivityIcon(act.type)}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{act.type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md truncate" title={act.description}>
                        {act.description}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      {act.lead ? (
                        <div 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-orange-500/10 text-purple-700 dark:text-orange-400 text-xs font-bold cursor-pointer hover:underline"
                          onClick={() => navigate(`/leads/${act.lead.id}`)}
                        >
                          <Hash size={12} />
                          {act.lead.lead_code} - {act.lead.name}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="shrink-0 px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Showing <span className="font-bold text-slate-700 dark:text-zinc-200">{((currentPage - 1) * 25) + 1}-{Math.min(currentPage * 25, pagination.total)}</span> of <span className="font-bold text-slate-700 dark:text-zinc-200">{pagination.total}</span> records
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-purple-600 dark:bg-orange-500 text-white dark:text-zinc-950'
                        : 'border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} 
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
