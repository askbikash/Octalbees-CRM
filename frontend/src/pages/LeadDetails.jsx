import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Building2, Calendar, Clock, Activity, Flag, ChevronDown, CheckCircle2, AlertCircle, Briefcase, Send, Loader2, MessageCircle, Link } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { DetailSkeleton } from '../components/ui/Skeleton';

const statusColors = {
  NEW: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  CONTACTED: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  INTERESTED: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
  FOLLOW_UP: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-purple-600/10 dark:text-orange-400 dark:border-orange-500/20',
  MEETING_SCHEDULED: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  NEGOTIATION: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-purple-600/10 dark:text-orange-400 dark:border-orange-500/20',
  CONVERTED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  NOT_INTERESTED: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  LOST: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
};

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const toast = useToast();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [users, setUsers] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);

  useEffect(() => {
    fetchLeadDetails();
    fetchUsers();
    fetchLeadEmailLogs();
  }, [id]);

  const fetchLeadEmailLogs = async () => {
    try {
      const res = await api.get(`/emails/lead/${id}`);
      setEmailLogs(res.data.data);
    } catch (error) {
      console.error('Failed to fetch email logs', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.filter(u => u.is_active));
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads/${id}`);
      setLead(res.data.data);
    } catch (error) {
      console.error('Failed to fetch lead details', error);
      alert('Failed to load lead details.');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === lead.status) return;

    let reason = '';
    if (newStatus === 'LOST' || newStatus === 'NOT_INTERESTED') {
      reason = prompt('Please provide a reason for this status change:');
      if (reason === null) return; // cancelled
    }

    try {
      setIsUpdatingStatus(true);
      await api.patch(`/leads/${id}/status`, { status: newStatus, reason });
      fetchLeadDetails();
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldMap = { status: 'Status', reason: 'Reason' };
        const invalidFields = error.response.data.errors.map(err => fieldMap[err.path[0]] || err.path[0]).filter(Boolean);
        const uniqueFields = [...new Set(invalidFields)];
        toast.error(`Please check the following fields: ${uniqueFields.join(', ')}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (e) => {
    const newAssignee = e.target.value;
    try {
      await api.put(`/leads/${id}`, { assigned_to: newAssignee || null });
      toast.success('Assignee updated');
      fetchLeadDetails();
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldMap = { assigned_to: 'Assignee' };
        const invalidFields = error.response.data.errors.map(err => fieldMap[err.path[0]] || err.path[0]).filter(Boolean);
        const uniqueFields = [...new Set(invalidFields)];
        toast.error(`Please check the following fields: ${uniqueFields.join(', ')}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update assignee');
      }
    }
  };

  const submitNote = async () => {
    if (!noteText.trim()) return;
    try {
      setIsSubmittingNote(true);
      await api.post(`/leads/${id}/notes`, { note: noteText });
      setNoteText('');
      toast.success('Note added');
      fetchLeadDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (loading || !lead) {
    return <DetailSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/leads')}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors mb-3"
          >
            <ArrowLeft size={16} /> Back to Pipeline
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-600/10 flex items-center justify-center text-purple-600 dark:text-orange-400 font-bold text-xl">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {lead.name}
                <span className="text-xs font-mono px-2 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  {lead.lead_code}
                </span>
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
                {lead.designation ? `${lead.designation} at ` : ''} 
                {lead.college?.name || lead.source}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Link size={16} />
              Share Link
            </button>
            <div className="relative">
            <select
              value={lead.status}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className={`appearance-none px-4 py-2.5 pr-10 rounded-xl font-bold text-sm border shadow-sm outline-none cursor-pointer transition-all ${statusColors[lead.status]}`}
            >
              {Object.keys(statusColors).map(status => (
                <option 
                  key={status} 
                  value={status}
                  className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white"
                >
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50" size={16} />
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 dark:text-zinc-500">Assigned to:</span>
            <select
              value={lead.assigned_to || ''}
              onChange={handleAssigneeChange}
              className="text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-transparent border-none p-0 focus:ring-0 cursor-pointer appearance-none outline-none"
            >
              <option value="" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Contact */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} className="text-purple-600 dark:text-orange-400" /> Lead Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Primary Phone</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.phone || '-'}</p>
                    {lead.phone && (
                      <a 
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name.split(' ')[0]}, this is ${user?.name?.split(' ')[0] || 'your agent'} from Octalbees...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] px-2 py-0.5 rounded hover:bg-[#25D366]/20 transition-colors"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {lead.alternate_phone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Alt Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.alternate_phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Email Address</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white break-all">{lead.email || '-'}</p>
                </div>
              </div>

              {lead.designation && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Briefcase size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Designation / Role</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.designation}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Building2 size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">College / Institute</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.college?.name || 'N/A'}</p>
                  {lead.city && <p className="text-xs text-slate-500 dark:text-zinc-400">{lead.city}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Flag size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Source</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.source}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status Journey Stepper */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Flag size={16} className="text-purple-600 dark:text-orange-400" /> Lead Journey
            </h3>
            <div className="flex items-center overflow-x-auto pb-2 gap-0">
              {['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'MEETING_SCHEDULED', 'NEGOTIATION', 'CONVERTED'].map((step, i, arr) => {
                const allStatuses = ['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'MEETING_SCHEDULED', 'NEGOTIATION', 'CONVERTED'];
                const currentIndex = allStatuses.indexOf(lead.status);
                const isActive = i <= currentIndex;
                const isCurrent = lead.status === step;
                const isLost = lead.status === 'LOST' || lead.status === 'NOT_INTERESTED';
                const stepLabels = { NEW: 'New', CONTACTED: 'Contacted', INTERESTED: 'Interested', FOLLOW_UP: 'Follow Up', MEETING_SCHEDULED: 'Meeting', NEGOTIATION: 'Negotiation', CONVERTED: 'Converted' };
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center min-w-[70px]">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0 ${
                        isLost ? 'border-red-300 bg-red-50 text-red-500 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400' :
                        isCurrent ? 'border-purple-500 bg-purple-600 text-white dark:border-orange-500 dark:bg-orange-500 shadow-sm shadow-purple-500/30 dark:shadow-orange-500/30' :
                        isActive ? 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        'border-slate-200 bg-slate-50 text-slate-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500'
                      }`}>
                        {isActive && !isCurrent ? '✓' : i + 1}
                      </div>
                      <span className={`text-[9px] font-semibold mt-1 whitespace-nowrap ${
                        isCurrent ? 'text-purple-600 dark:text-orange-400' :
                        isActive ? 'text-emerald-600 dark:text-emerald-400' :
                        'text-slate-400 dark:text-zinc-500'
                      }`}>
                        {stepLabels[step]}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 min-w-[20px] mt-[-12px] ${
                        isActive && i < currentIndex ? 'bg-emerald-400 dark:bg-emerald-500/40' : 'bg-slate-200 dark:bg-zinc-700'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {(lead.status === 'LOST' || lead.status === 'NOT_INTERESTED') && (
              <div className="mt-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400">
                ❌ Lead marked as {lead.status === 'LOST' ? 'Lost' : 'Not Interested'}{lead.lost_reason ? ` — "${lead.lost_reason}"` : ''}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm min-h-[400px]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity size={16} className="text-purple-600 dark:text-orange-400" /> Activity Timeline
            </h3>

            {/* Quick Note Input */}
            <div className="mb-8 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <User size={14} className="text-slate-500" />
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write a quick note..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:border-purple-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-purple-500 dark:focus:ring-orange-500 transition-all resize-none min-h-[60px]"
                />
                <button
                  onClick={submitNote}
                  disabled={!noteText.trim() || isSubmittingNote}
                  className="absolute right-2 top-2 p-2 bg-purple-600 dark:bg-purple-500 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  {isSubmittingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>

            <div className="relative border-l-2 border-slate-100 dark:border-zinc-800/80 ml-3 pl-6 space-y-6">
              
              {/* Follow Ups Scheduled (if any) */}
              {lead.follow_ups?.filter(f => f.status === 'PENDING').map(followup => (
                <div key={followup.id} className="relative">
                  <div className="absolute -left-[35px] w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-500 dark:bg-zinc-900 flex items-center justify-center">
                    <Clock size={10} className="text-orange-500" />
                  </div>
                  <div className="bg-orange-50 dark:bg-purple-600/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-orange-800 dark:text-orange-400">Upcoming {followup.type}</p>
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-500 bg-white dark:bg-purple-600/10 px-2 py-0.5 rounded-md">
                        {new Date(followup.scheduled_at).toLocaleString()}
                      </span>
                    </div>
                    {followup.notes && <p className="text-xs text-orange-700 dark:text-orange-500/80 mt-2">{followup.notes}</p>}
                  </div>
                </div>
              ))}

              {/* Past Activities with type-specific icons */}
              {lead.activities?.map((activity) => {
                const typeConfig = {
                  NOTE: { icon: '📝', bg: 'bg-blue-50 dark:bg-blue-500/5', border: 'border-blue-100 dark:border-blue-500/10', dot: 'bg-blue-400 dark:bg-blue-500' },
                  STATUS_CHANGE: { icon: '🔄', bg: 'bg-purple-50 dark:bg-purple-500/5', border: 'border-purple-100 dark:border-purple-500/10', dot: 'bg-purple-500 dark:bg-purple-400' },
                  EMAIL: { icon: '📧', bg: 'bg-indigo-50 dark:bg-indigo-500/5', border: 'border-indigo-100 dark:border-indigo-500/10', dot: 'bg-indigo-500 dark:bg-indigo-400' },
                  CALL: { icon: '📞', bg: 'bg-emerald-50 dark:bg-emerald-500/5', border: 'border-emerald-100 dark:border-emerald-500/10', dot: 'bg-emerald-500 dark:bg-emerald-400' },
                  WHATSAPP: { icon: '💬', bg: 'bg-green-50 dark:bg-green-500/5', border: 'border-green-100 dark:border-green-500/10', dot: 'bg-green-500 dark:bg-green-400' },
                  MEETING: { icon: '🤝', bg: 'bg-amber-50 dark:bg-amber-500/5', border: 'border-amber-100 dark:border-amber-500/10', dot: 'bg-amber-500 dark:bg-amber-400' },
                  ASSIGNMENT: { icon: '👤', bg: 'bg-cyan-50 dark:bg-cyan-500/5', border: 'border-cyan-100 dark:border-cyan-500/10', dot: 'bg-cyan-500 dark:bg-cyan-400' },
                  FOLLOW_UP_CREATED: { icon: '📅', bg: 'bg-orange-50 dark:bg-orange-500/5', border: 'border-orange-100 dark:border-orange-500/10', dot: 'bg-orange-500 dark:bg-orange-400' },
                  FOLLOW_UP_COMPLETED: { icon: '✅', bg: 'bg-emerald-50 dark:bg-emerald-500/5', border: 'border-emerald-100 dark:border-emerald-500/10', dot: 'bg-emerald-500 dark:bg-emerald-400' },
                };
                const config = typeConfig[activity.type] || typeConfig.NOTE;

                return (
                  <div key={activity.id} className="relative">
                    <div className={`absolute -left-[33px] w-4 h-4 rounded-full ${config.dot} border-4 border-white dark:border-zinc-900`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">{config.icon}</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{activity.user?.name || 'System'}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-sm text-slate-600 dark:text-zinc-400 ${config.bg} ${config.border} border p-3 rounded-xl`}>
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {(!lead.activities || lead.activities.length === 0) && (
                <p className="text-sm text-slate-400 dark:text-zinc-500 italic">No activity recorded yet.</p>
              )}
            </div>
          </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm mt-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Mail size={16} className="text-purple-600 dark:text-orange-400" /> Sent Emails
        </h3>
        
        <div className="space-y-4">
          {emailLogs.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-zinc-500 italic">No emails sent to this lead yet.</p>
          ) : (
            emailLogs.map((log) => (
              <div key={log.id} className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-zinc-200">{log.subject}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1"><User size={12}/> {log.sender?.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(log.sent_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                    log.status === 'OPENED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                    log.status === 'CLICKED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {log.status}
                  </span>
                  <div className="flex gap-3 text-xs text-slate-500 dark:text-zinc-400">
                    <span title="Opens" className="flex items-center gap-1">👁️ {log.open_count}</span>
                    <span title="Clicks" className="flex items-center gap-1">🖱️ {log.click_count}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;

