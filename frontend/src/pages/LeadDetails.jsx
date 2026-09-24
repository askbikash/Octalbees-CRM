import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Building2, Calendar, Clock, Activity, Flag, ChevronDown, CheckCircle2, AlertCircle, Briefcase } from 'lucide-react';
import api from '../services/api';

const statusColors = {
  NEW: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  CONTACTED: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  INTERESTED: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
  FOLLOW_UP: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  MEETING_SCHEDULED: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  NEGOTIATION: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  CONVERTED: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  NOT_INTERESTED: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  LOST: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
};

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLeadDetails();
    fetchUsers();
  }, [id]);

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
        const messages = error.response.data.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        alert(`Validation failed - ${messages}`);
      } else {
        alert(error.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (e) => {
    const newAssignee = e.target.value;
    try {
      await api.put(`/leads/${id}`, { assigned_to: newAssignee || null });
      fetchLeadDetails();
    } catch (error) {
      if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        alert(`Validation failed - ${messages}`);
      } else {
        alert(error.response?.data?.message || 'Failed to update assignee');
      }
    }
  };

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-orange-400 mr-3"></div>
        Loading lead details...
      </div>
    );
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
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-orange-500/10 flex items-center justify-center text-purple-600 dark:text-orange-400 font-bold text-xl">
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
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.phone || '-'}</p>
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
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm h-full min-h-[500px]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Activity size={16} className="text-purple-600 dark:text-orange-400" /> Activity Timeline
            </h3>

            <div className="relative border-l-2 border-slate-100 dark:border-zinc-800/80 ml-3 pl-6 space-y-8">
              
              {/* Follow Ups Scheduled (if any) */}
              {lead.follow_ups?.filter(f => f.status === 'PENDING').map(followup => (
                <div key={followup.id} className="relative">
                  <div className="absolute -left-[35px] w-5 h-5 rounded-full bg-orange-50 border-2 border-orange-500 dark:bg-zinc-900 flex items-center justify-center">
                    <Clock size={10} className="text-orange-500" />
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-orange-800 dark:text-orange-400">Upcoming {followup.type}</p>
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-500 bg-white dark:bg-orange-500/10 px-2 py-0.5 rounded-md">
                        {new Date(followup.scheduled_at).toLocaleString()}
                      </span>
                    </div>
                    {followup.notes && <p className="text-xs text-orange-700 dark:text-orange-500/80 mt-2">{followup.notes}</p>}
                  </div>
                </div>
              ))}

              {/* Past Activities */}
              {lead.activities?.map((activity, idx) => (
                <div key={activity.id} className="relative">
                  <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{activity.user?.name || 'System'}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!lead.activities || lead.activities.length === 0) && (
                <p className="text-sm text-slate-400 dark:text-zinc-500 italic">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeadDetails;
