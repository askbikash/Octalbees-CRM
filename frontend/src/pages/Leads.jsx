import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Loader2, Calendar, Phone, Mail, X, AlertTriangle, Edit, Trash2, MoreHorizontal, Upload, FileText, Eye, ChevronDown, Download, MessageSquare, CheckSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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

const priorityColors = {
  LOW: 'text-slate-400 dark:text-zinc-500',
  MEDIUM: 'text-purple-500 dark:text-orange-500',
  HIGH: 'text-orange-500',
  HOT: 'text-red-500'
};

const Leads = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const toast = useToast();

  // Selection & Bulk Actions
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isBulkActioning, setIsBulkActioning] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteModal, setNoteModal] = useState({ open: false, leadId: null, note: '' });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [editingLead, setEditingLead] = useState(null);

  // Follow Up Modal State
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      priority: 'MEDIUM',
      source: 'OTHER',
      lead_type: 'STUDENT'
    }
  });

  const { register: registerFollowUp, handleSubmit: handleFollowUpSubmit, reset: resetFollowUp, formState: { isSubmitting: isSubmittingFollowUp } } = useForm();

  useEffect(() => {
    fetchLeads();
    fetchColleges(); // For the dropdown
    fetchUsers(); // For assignment
  }, [search, filterStatus, filterAssignee, currentPage]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.filter(u => u.is_active));
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export leads');
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterAssignee]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let query = `/leads?search=${search}&page=${currentPage}&limit=25`;
      if (filterStatus) query += `&status=${filterStatus}`;
      if (filterAssignee) query += `&assigned_to=${filterAssignee}`;
      const res = await api.get(query);
      setLeads(res.data.data);
      if (res.data.pagination) setPagination(res.data.pagination);
      setSelectedLeads([]); // clear selection on fetch
    } catch (error) {
      console.error('Failed to fetch leads', error);
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action, value = null) => {
    if (selectedLeads.length === 0) return;
    
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) return;
    }

    try {
      setIsBulkActioning(true);
      await api.post('/leads/bulk', { leadIds: selectedLeads, action, value });
      toast.success(`Bulk action completed on ${selectedLeads.length} leads`);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk action failed');
    } finally {
      setIsBulkActioning(false);
    }
  };

  const submitQuickNote = async () => {
    if (!noteModal.note.trim()) return;
    try {
      await api.post(`/leads/${noteModal.leadId}/notes`, { note: noteModal.note });
      toast.success('Note added successfully');
      setNoteModal({ open: false, leadId: null, note: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add note');
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await api.get(`/colleges?limit=100`);
      setColleges(res.data.data);
    } catch (error) {
      console.error('Failed to fetch colleges for dropdown', error);
    }
  };

  const onSubmit = async (data, force = false) => {
    try {
      setSubmitError('');
      setDuplicateWarning(null);

      const payload = { ...data, force };
      
      // Clean up empty optional fields
      if (!payload.email) delete payload.email;
      if (!payload.phone) delete payload.phone;
      if (!payload.college_id) delete payload.college_id;

      if (editingLead) {
        await api.put(`/leads/${editingLead.id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      
      setIsModalOpen(false);
      setEditingLead(null);
      reset();
      fetchLeads();
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.isDuplicateWarning) {
        setDuplicateWarning(error.response.data.duplicates);
      } else if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        setSubmitError(`Validation failed - ${messages}`);
      } else {
        setSubmitError(error.response?.data?.message || 'Failed to save lead');
      }
    }
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    reset({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      designation: lead.designation || '',
      lead_type: lead.lead_type || 'STUDENT',
      source: lead.source || 'OTHER',
      priority: lead.priority || 'MEDIUM',
      college_id: lead.college_id || ''
    });
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete lead ${name}? This will also delete their activity and follow-ups. This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete lead.');
    }
  };

  const handleQuickStatusChange = async (leadId, newStatus) => {
    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      fetchLeads(); // Refresh leads table silently
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const onFollowUpSubmit = async (data) => {
    try {
      setSubmitError('');
      await api.post('/followups', {
        lead_id: selectedLeadForFollowUp.id,
        scheduled_at: new Date(data.scheduled_at).toISOString(),
        type: data.type,
        notes: data.notes
      });
      setIsFollowUpModalOpen(false);
      resetFollowUp();
      fetchLeads(); // Refresh leads to show updated next follow-up date
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to schedule follow-up');
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.post('/leads/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult({ type: 'success', message: res.data.message });
      fetchLeads(); // Refresh leads
    } catch (error) {
      setImportResult({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to import CSV'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,phone,alternate_phone,designation,source,lead_type,priority\nJohn Doe,john@example.com,9876543210,,,OTHER,STUDENT,MEDIUM";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-purple-600 dark:text-orange-400" />
            Lead Pipeline
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">Track and manage your potential conversions</p>
        </div>
        
        <div className="flex gap-3">
          {user.role === 'ADMIN' && (
            <>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors shadow-sm"
              >
                <Download size={18} />
                Export CSV
              </button>
              <button 
                onClick={() => { setImportResult(null); setImportFile(null); setIsImportModalOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors shadow-sm"
              >
                <Upload size={18} />
                Import CSV
              </button>
            </>
          )}
          <button 
            onClick={() => { setEditingLead(null); reset({}); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-zinc-950 text-white rounded-xl font-bold transition-colors shadow-sm shadow-purple-600/20 dark:shadow-orange-500/20 w-fit"
          >
            <Plus size={18} />
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-zinc-950/30 shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone or OB-code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 focus:border-purple-500 dark:focus:border-orange-500 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 outline-none text-sm text-slate-900 dark:text-white cursor-pointer w-full md:w-40"
            >
              <option value="">All Statuses</option>
              {Object.keys(statusColors).map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 outline-none text-sm text-slate-900 dark:text-white cursor-pointer w-full md:w-48"
            >
              <option value="">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-slate-50/95 dark:bg-zinc-900/95 backdrop-blur-md text-slate-500 dark:text-zinc-400 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 w-10">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-orange-500"
                      checked={selectedLeads.length === leads.length && leads.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Lead Information</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Contact</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Assigned To</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Next Action</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/50 bg-white dark:bg-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-3 text-purple-500 dark:text-orange-500" size={28} />
                    <p className="font-medium">Loading pipeline...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center text-slate-500 dark:text-zinc-400">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="text-slate-400" size={24} />
                    </div>
                    <p className="font-medium">No leads found in the pipeline.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer bg-white dark:bg-zinc-900"
                  >
                    <td className="px-6 py-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-orange-500"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleSelectLead(lead.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${priorityColors[lead.priority] || priorityColors.MEDIUM}`} style={{ backgroundColor: 'currentColor' }} />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {lead.name}
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                              {lead.lead_code}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{lead.college?.name || lead.source}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
                          <Phone size={12} className="text-slate-400 dark:text-zinc-500" /> {lead.phone}
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
                          <Mail size={12} className="text-slate-400 dark:text-zinc-500" /> {lead.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 relative" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block w-full max-w-[140px]">
                        <select
                          value={lead.status}
                          onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                          className={`appearance-none w-full px-2.5 py-1.5 pr-6 rounded-full text-[10px] font-bold border shadow-sm outline-none cursor-pointer transition-all ${statusColors[lead.status]}`}
                        >
                          {Object.keys(statusColors).map(status => (
                            <option key={status} value={status} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white text-sm">
                              {status.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" size={12} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                          {lead.assigned_user?.name?.charAt(0) || '-'}
                        </div>
                        <span className="text-slate-700 dark:text-zinc-300 font-medium">{lead.assigned_user?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.next_follow_up_at ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-purple-600 dark:text-orange-400 text-xs font-semibold">
                            <Calendar size={14} />
                            {new Date(lead.next_follow_up_at).toLocaleDateString()}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedLeadForFollowUp(lead); setIsFollowUpModalOpen(true); }}
                            className="text-[10px] uppercase font-bold text-slate-500 hover:text-purple-600 dark:text-zinc-500 dark:hover:text-orange-400 transition-colors text-left"
                          >
                            Reschedule
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedLeadForFollowUp(lead); setIsFollowUpModalOpen(true); }}
                          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-600 dark:text-zinc-500 dark:hover:text-orange-400 bg-slate-100 hover:bg-purple-50 dark:bg-zinc-800 dark:hover:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Plus size={14} /> Schedule
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative group/menu inline-block text-left">
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-all"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-1 w-32 origin-top-right bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 flex flex-col p-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-300 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors text-left"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setNoteModal({ open: true, leadId: lead.id, note: '' }); }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-zinc-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors text-left"
                          >
                            <MessageSquare size={14} /> Quick Note
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(lead); }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-zinc-300 dark:hover:text-orange-400 dark:hover:bg-orange-500/10 rounded-lg transition-colors text-left"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(lead.id, lead.name); }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-zinc-300 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/50 flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400 font-medium shrink-0 backdrop-blur-md">
          <span>Showing {leads.length} active leads</span>
          <span className="flex items-center gap-1.5 opacity-70">
            <Users size={14} className="text-purple-500 dark:text-orange-500" /> Pipeline Overview
          </span>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col my-8">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingLead ? 'Edit Lead' : 'Create New Lead'}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingLead(null); reset({}); setSubmitError(''); setDuplicateWarning(null); }}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {submitError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                  {submitError}
                </div>
              )}

              {duplicateWarning && (
                <div className="mb-6 p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex gap-3 items-start">
                  <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-bold text-orange-800 dark:text-orange-500 mb-1">Potential Duplicates Found!</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                      We found existing leads that match this email, phone, or name:
                    </p>
                    <ul className="text-sm font-medium text-orange-900 dark:text-orange-200 space-y-1 mb-4">
                      {duplicateWarning.map(dup => (
                        <li key={dup.id}>• {dup.name} ({dup.lead_code}) - assigned to {dup.assigned_user?.name || 'No one'}</li>
                      ))}
                    </ul>
                    <button 
                      onClick={handleSubmit((data) => onSubmit(data, true))}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white dark:text-zinc-950 rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                      Ignore Warning & Create Anyway
                    </button>
                  </div>
                </div>
              )}

              <form id="lead-form" onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Lead Name *</label>
                    <input 
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="Full Name"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Primary Phone</label>
                    <input 
                      {...register('phone')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="+91..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Email Address</label>
                    <input 
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Designation / Role</label>
                    <input 
                      {...register('designation')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="e.g. CEO, Student, Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Priority</label>
                    <select 
                      {...register('priority')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="HOT">Hot 🔥</option>
                    </select>
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-zinc-800" />

                {/* Relational Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Lead Source</label>
                    <select 
                      {...register('source')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="WEBSITE">Website Form</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="LINKEDIN">LinkedIn</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="COLLEGE_OUTREACH">College Outreach</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Associated College</label>
                    <select 
                      {...register('college_id')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="">-- None / Independent --</option>
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Assigned To</label>
                    <select 
                      {...register('assigned_to')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="">-- Unassigned --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 flex justify-end gap-3 mt-auto">
              <button 
                onClick={() => { setIsModalOpen(false); setEditingLead(null); reset({}); setDuplicateWarning(null); }}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                form="lead-form"
                type="submit"
                disabled={isSubmitting || duplicateWarning}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-zinc-950 disabled:opacity-50 transition-colors shadow-sm shadow-purple-500/25 dark:shadow-orange-500/25"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                {editingLead ? 'Update Lead' : 'Create Lead'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Schedule Follow Up Modal */}
      {isFollowUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Follow-up</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">For {selectedLeadForFollowUp?.name}</p>
              </div>
              <button 
                onClick={() => { setIsFollowUpModalOpen(false); resetFollowUp(); }}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form id="schedule-form" onSubmit={handleFollowUpSubmit(onFollowUpSubmit)} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Date & Time *</label>
                  <input 
                    type="datetime-local"
                    {...registerFollowUp('scheduled_at', { required: 'Date and time are required' })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Follow-up Type</label>
                  <select 
                    {...registerFollowUp('type')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Notes / Agenda</label>
                  <textarea 
                    {...registerFollowUp('notes')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all resize-none"
                    placeholder="What needs to be discussed?"
                  />
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 flex justify-end gap-3 mt-auto">
              <button 
                form="schedule-form"
                type="submit"
                disabled={isSubmittingFollowUp}
                className="w-full flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-zinc-950 disabled:opacity-50 transition-colors shadow-sm shadow-purple-500/25 dark:shadow-orange-500/25"
              >
                {isSubmittingFollowUp && <Loader2 className="animate-spin" size={18} />}
                Confirm Schedule
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/30">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="text-purple-600 dark:text-orange-400" />
                Import Leads via CSV
              </h2>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="bg-purple-50 dark:bg-orange-500/10 p-4 rounded-xl text-sm text-purple-800 dark:text-orange-200 border border-purple-100 dark:border-orange-500/20">
                Upload a CSV file containing your leads. The first row must be headers matching the exact field names.
              </div>
              
              <button 
                onClick={downloadTemplate}
                className="text-sm font-semibold text-purple-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <FileText size={16} /> Download CSV Template
              </button>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Select CSV File</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              {importResult && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${importResult.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                  {importResult.message}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 flex justify-end gap-3 mt-auto">
              <button 
                onClick={handleImportSubmit}
                disabled={!importFile || isImporting}
                className="w-full flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-zinc-950 disabled:opacity-50 transition-colors shadow-sm shadow-purple-500/25 dark:shadow-orange-500/25"
              >
                {isImporting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                {isImporting ? 'Importing...' : 'Upload & Import'}
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="shrink-0 px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Showing <span className="font-bold text-slate-700 dark:text-zinc-200">{((currentPage - 1) * 25) + 1}-{Math.min(currentPage * 25, pagination.total)}</span> of <span className="font-bold text-slate-700 dark:text-zinc-200">{pagination.total}</span> leads
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            >
              Previous
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
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
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
    

      {/* Quick Note Modal */}
      {noteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setNoteModal({ open: false, leadId: null, note: '' })}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="text-emerald-500" size={20} />
                Add Quick Note
              </h3>
              <button onClick={() => setNoteModal({ open: false, leadId: null, note: '' })} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <textarea
                autoFocus
                value={noteModal.note}
                onChange={(e) => setNoteModal(prev => ({ ...prev, note: e.target.value }))}
                rows={4}
                placeholder="Type your note here..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />
            </div>
            <div className="p-5 pt-0 flex justify-end gap-3">
              <button
                onClick={() => setNoteModal({ open: false, leadId: null, note: '' })}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitQuickNote}
                disabled={!noteModal.note.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-500/25"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-700 dark:border-slate-200">
              <CheckSquare size={18} className="text-purple-400 dark:text-orange-500" />
              <span className="font-bold">{selectedLeads.length} Selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                onChange={(e) => {
                  if(e.target.value) {
                    handleBulkAction('status', e.target.value);
                    e.target.value = '';
                  }
                }}
                disabled={isBulkActioning}
                className="bg-slate-800 dark:bg-slate-100 border border-slate-700 dark:border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
              >
                <option value="">Change Status...</option>
                {Object.keys(statusColors).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>

              {user?.role === 'ADMIN' && (
                <>
                  <select 
                    onChange={(e) => {
                      if(e.target.value) {
                        handleBulkAction('assign', e.target.value);
                        e.target.value = '';
                      }
                    }}
                    disabled={isBulkActioning}
                    className="bg-slate-800 dark:bg-slate-100 border border-slate-700 dark:border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
                  >
                    <option value="">Assign To...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  
                  <button 
                    onClick={() => handleBulkAction('delete')}
                    disabled={isBulkActioning}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 dark:text-red-600 dark:hover:text-red-700 dark:hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete Selected"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
              
              <button 
                onClick={() => setSelectedLeads([])}
                className="p-1.5 text-slate-400 hover:text-white dark:text-slate-500 dark:hover:text-slate-900 rounded-lg transition-colors ml-2"
                title="Clear Selection"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
