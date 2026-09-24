import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, XCircle, AlertCircle, Phone, Mail, Calendar, Clock, Loader2, MessageCircle, X } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('today');
  const [actionModal, setActionModal] = useState({ open: false, id: null, status: null });
  const [actionNotes, setActionNotes] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchFollowUps();
  }, [timeframe]);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/followups?timeframe=${timeframe}&status=PENDING`);
      setFollowUps(res.data.data);
    } catch (error) {
      console.error('Failed to fetch follow-ups', error);
      toast.error('Failed to load follow-ups.');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (id, status) => {
    setActionModal({ open: true, id, status });
    setActionNotes('');
  };

  const handleActionSubmit = async () => {
    try {
      setIsActioning(true);
      await api.patch(`/followups/${actionModal.id}`, { status: actionModal.status, notes: actionNotes || undefined });
      toast.success(`Follow-up marked as ${actionModal.status.toLowerCase()}!`);
      setActionModal({ open: false, id: null, status: null });
      fetchFollowUps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update follow-up.');
    } finally {
      setIsActioning(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CALL': return <Phone size={16} />;
      case 'EMAIL': return <Mail size={16} />;
      case 'MEETING': return <Calendar size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-purple-600 dark:text-orange-400" />
            Follow-up Schedule
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">Never miss a call or meeting.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm w-fit">
          <button
            onClick={() => setTimeframe('overdue')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              timeframe === 'overdue' ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            Overdue
          </button>
          <button
            onClick={() => setTimeframe('today')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              timeframe === 'today' ? "bg-purple-50 text-purple-700 dark:bg-orange-500/10 dark:text-orange-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('upcoming')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              timeframe === 'upcoming' ? "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            Upcoming
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400">
            <Loader2 className="animate-spin text-purple-600 dark:text-orange-400 mb-4" size={32} />
            <p>Loading your schedule...</p>
          </div>
        ) : followUps.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400">
            <CheckCircle2 className="text-emerald-500 mb-4" size={48} opacity={0.2} />
            <p className="text-lg font-medium text-slate-900 dark:text-white">All caught up!</p>
            <p className="text-sm">No {timeframe} follow-ups pending.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followUps.map((task) => (
              <div key={task.id} className="group p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 hover:border-purple-300 dark:hover:border-orange-500/30 transition-all shadow-sm">
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-orange-500/10 flex items-center justify-center text-purple-600 dark:text-orange-400">
                      {getTypeIcon(task.type)}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-purple-600 dark:text-orange-400">{task.type}</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                        {new Date(task.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  {timeframe === 'overdue' && <AlertCircle size={16} className="text-red-500" />}
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{task.lead.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{task.lead.college?.name || 'No College'}</p>
                  
                  <div className="mt-3 space-y-1">
                    {task.lead.phone && <p className="text-xs font-mono text-slate-600 dark:text-zinc-300">📞 {task.lead.phone}</p>}
                    {task.notes && <p className="text-xs text-slate-500 dark:text-zinc-500 italic mt-2">"{task.notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-zinc-800/50">
                  <button 
                    onClick={() => openActionModal(task.id, 'COMPLETED')}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-colors"
                  >
                    Complete
                  </button>
                  {task.lead.phone && (
                    <a 
                      href={`https://wa.me/${task.lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-[#25D366] hover:bg-[#25D366]/10 dark:bg-[#25D366]/10 dark:hover:bg-[#25D366]/20 transition-colors"
                      title="Message on WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                  )}
                  <button 
                    onClick={() => openActionModal(task.id, 'MISSED')}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                    title="Mark as Missed"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActionModal({ open: false, id: null, status: null })}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {actionModal.status === 'COMPLETED' ? '✅ Complete Follow-up' : '❌ Mark as Missed'}
              </h3>
              <button onClick={() => setActionModal({ open: false, id: null, status: null })} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Notes (optional)</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this follow-up..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 transition-all resize-none"
              />
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setActionModal({ open: false, id: null, status: null })}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={isActioning}
                className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${
                  actionModal.status === 'COMPLETED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isActioning ? <Loader2 className="animate-spin" size={16} /> : null}
                {actionModal.status === 'COMPLETED' ? 'Mark Complete' : 'Mark Missed'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FollowUps;
