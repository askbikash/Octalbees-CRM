import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, XCircle, AlertCircle, Phone, Mail, Calendar, Clock, Loader2, MessageCircle, X, ChevronLeft, ChevronRight, List, Grid3X3 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ListSkeleton } from '../components/ui/Skeleton';

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

  // Calendar state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchFollowUps();
    }
  }, [timeframe, viewMode]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchCalendarData();
    }
  }, [calendarDate, viewMode]);

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

  const fetchCalendarData = async () => {
    try {
      setCalendarLoading(true);
      const month = calendarDate.getMonth() + 1;
      const year = calendarDate.getFullYear();
      const res = await api.get(`/followups/calendar?month=${month}&year=${year}`);
      setCalendarData(res.data.data);
    } catch (error) {
      toast.error('Failed to load calendar data.');
    } finally {
      setCalendarLoading(false);
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
      if (viewMode === 'list') fetchFollowUps();
      else fetchCalendarData();
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
      case 'WHATSAPP': return <MessageCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Calendar helpers
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  const goToToday = () => { setCalendarDate(new Date()); setSelectedDay(null); };

  const getDateKey = (day) => {
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    return d.toISOString().split('T')[0];
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && calendarDate.getMonth() === today.getMonth() && calendarDate.getFullYear() === today.getFullYear();
  };

  const isPast = (day) => {
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 md:h-28 border border-slate-100 dark:border-zinc-800/50 bg-slate-50/30 dark:bg-zinc-950/30" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(day);
      const dayFollowUps = calendarData[dateKey] || [];
      const pending = dayFollowUps.filter(f => f.status === 'PENDING');
      const completed = dayFollowUps.filter(f => f.status === 'COMPLETED');
      const missed = dayFollowUps.filter(f => f.status === 'MISSED');
      const isSelected = selectedDay === day;
      const past = isPast(day);
      const todayClass = isToday(day);

      cells.push(
        <div
          key={day}
          onClick={() => setSelectedDay(isSelected ? null : day)}
          className={cn(
            "h-24 md:h-28 border p-1.5 md:p-2 cursor-pointer transition-all relative overflow-hidden",
            todayClass ? "border-purple-300 dark:border-orange-500/50 bg-purple-50/50 dark:bg-orange-500/5" : "border-slate-100 dark:border-zinc-800/50",
            isSelected ? "ring-2 ring-purple-500 dark:ring-orange-500 bg-purple-50 dark:bg-purple-900/10" : "hover:bg-slate-50 dark:hover:bg-zinc-800/30"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn(
              "text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full",
              todayClass ? "bg-purple-600 dark:bg-orange-500 text-white" : "text-slate-700 dark:text-zinc-300"
            )}>
              {day}
            </span>
          </div>

          {/* Follow-up dots/badges */}
          <div className="flex flex-wrap gap-0.5 mt-0.5">
            {pending.length > 0 && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                past && pending.length > 0
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              )}>
                {pending.length} {past ? '⚠' : '⏳'}
              </span>
            )}
            {completed.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {completed.length} ✓
              </span>
            )}
            {missed.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {missed.length} ✗
              </span>
            )}
          </div>

          {/* Preview of first follow-up on larger screens */}
          {dayFollowUps.length > 0 && (
            <div className="hidden md:block mt-1">
              <p className="text-[10px] text-slate-600 dark:text-zinc-400 truncate font-medium">
                {dayFollowUps[0].lead?.name}
              </p>
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  const selectedDayData = selectedDay ? (calendarData[getDateKey(selectedDay)] || []) : [];

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

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex p-1 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-purple-600 dark:bg-orange-500 text-white shadow-sm" : "text-slate-500 dark:text-zinc-400 hover:text-slate-700"
              )}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'calendar' ? "bg-purple-600 dark:bg-orange-500 text-white shadow-sm" : "text-slate-500 dark:text-zinc-400 hover:text-slate-700"
              )}
              title="Calendar View"
            >
              <Grid3X3 size={16} />
            </button>
          </div>

          {/* List view timeframe tabs */}
          {viewMode === 'list' && (
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
                  timeframe === 'today' ? "bg-purple-50 text-purple-700 dark:bg-purple-600/10 dark:text-orange-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
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
          )}
        </div>
      </div>

      {/* ===== CALENDAR VIEW ===== */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white min-w-[180px] text-center">
                {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            <button onClick={goToToday} className="px-4 py-2 text-sm font-bold text-purple-600 dark:text-orange-400 bg-purple-50 dark:bg-orange-500/10 rounded-xl hover:bg-purple-100 dark:hover:bg-orange-500/20 transition-colors">
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          {calendarLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-purple-500 dark:text-orange-400" size={32} />
            </div>
          ) : (
            <div className="p-2 md:p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {dayNames.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider py-2">
                    {d}
                  </div>
                ))}
              </div>
              {/* Calendar cells */}
              <div className="grid grid-cols-7 rounded-xl overflow-hidden border border-slate-100 dark:border-zinc-800">
                {renderCalendar()}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 px-2 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Pending</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Overdue/Missed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed</span>
              </div>
            </div>
          )}

          {/* Selected Day Detail Panel */}
          {selectedDay && (
            <div className="border-t border-slate-200 dark:border-zinc-800 p-4 md:p-6 bg-slate-50/50 dark:bg-zinc-950/30 animate-in slide-in-from-bottom-4 duration-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                📅 {selectedDay} {monthNames[calendarDate.getMonth()]} — {selectedDayData.length} follow-up{selectedDayData.length !== 1 ? 's' : ''}
              </h3>
              {selectedDayData.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-400">No follow-ups scheduled for this day.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDayData.map((fu) => (
                    <div key={fu.id} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-600/10 flex items-center justify-center text-purple-600 dark:text-orange-400">
                            {getTypeIcon(fu.type)}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-purple-600 dark:text-orange-400">{fu.type}</p>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                              {new Date(fu.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          fu.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          fu.status === 'MISSED' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}>
                          {fu.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{fu.lead?.name}</h4>
                      {fu.lead?.phone && <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-1">📞 {fu.lead.phone}</p>}
                      {fu.notes && <p className="text-xs text-slate-500 dark:text-zinc-500 italic mt-1 truncate">"{fu.notes}"</p>}
                      {fu.assigned_user && <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">→ {fu.assigned_user.name}</p>}

                      {fu.status === 'PENDING' && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                          <button
                            onClick={() => openActionModal(fu.id, 'COMPLETED')}
                            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => openActionModal(fu.id, 'MISSED')}
                            className="py-1.5 px-2 rounded-lg text-[11px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== LIST VIEW ===== */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6">
          
          {loading ? (
            <div className="py-6 flex items-center justify-center">
              <ListSkeleton />
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
                      <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-600/10 flex items-center justify-center text-purple-600 dark:text-orange-400">
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
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{task.lead.organization?.name || 'No Organization'}</p>
                    
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
      )}

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
