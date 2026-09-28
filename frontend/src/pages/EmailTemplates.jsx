import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, X, Edit, Trash2, Copy, Eye, Loader2, AlertTriangle, Users, Building2, ChevronDown, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const audienceConfig = {
  STUDENT: { label: 'Student', icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
  PLACEMENT_CELL: { label: 'Placement Cell', icon: Building2, color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' },
};

const categoryLabels = {
  INTRODUCTION: 'Introduction',
  CAREER_PITCH: 'Career Pitch',
  FOLLOW_UP: 'Follow-Up',
  RE_ENGAGEMENT: 'Re-engagement',
  NEXT_STEPS: 'Next Steps',
  FINAL_FOLLOW_UP: 'Final Follow-Up',
  COLLABORATION: 'Collaboration',
  PROPOSAL: 'Proposal',
  SHORT_OUTREACH: 'Short Outreach',
};

const EmailTemplates = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, template: null });
  const [formData, setFormData] = useState({
    name: '', audience: 'STUDENT', category: 'INTRODUCTION', subject: '', body: '', variables: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [search, filterAudience]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      let query = '/templates?';
      if (search) query += `search=${search}&`;
      if (filterAudience) query += `audience=${filterAudience}&`;
      const res = await api.get(query);
      setTemplates(res.data.data);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingTemplate) {
        await api.put(`/templates/${editingTemplate.id}`, formData);
        toast.success('Template updated');
      } else {
        await api.post('/templates', formData);
        toast.success('Template created');
      }
      setIsModalOpen(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/templates/${deleteModal.template.id}`);
      toast.success('Template deleted');
      setDeleteModal({ open: false, template: null });
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      audience: template.audience,
      category: template.category,
      subject: template.subject,
      body: template.body,
      variables: template.variables || '',
    });
    setIsModalOpen(true);
  };

  const handleCopyBody = (template) => {
    navigator.clipboard.writeText(template.body);
    setCopiedId(template.id);
    toast.success('Template body copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setFormData({ name: '', audience: 'STUDENT', category: 'INTRODUCTION', subject: '', body: '', variables: '' });
  };

  const studentTemplates = templates.filter(t => t.audience === 'STUDENT');
  const placementTemplates = templates.filter(t => t.audience === 'PLACEMENT_CELL');

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-purple-600 dark:text-orange-400" />
            Email Templates
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">Pre-built outreach templates for students & placement cells</p>
        </div>
        <button
          onClick={() => { setEditingTemplate(null); resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 dark:text-white text-white rounded-xl font-bold transition-colors shadow-sm shadow-purple-600/20 dark:shadow-purple-500/20 w-fit"
        >
          <Plus size={18} />
          New Template
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 focus:border-purple-500 dark:focus:border-orange-500 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['', 'STUDENT', 'PLACEMENT_CELL'].map(val => (
            <button
              key={val}
              onClick={() => setFilterAudience(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                filterAudience === val
                  ? 'bg-purple-600 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-500'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              {val === '' ? 'All' : val === 'STUDENT' ? '🎓 Students' : '🏫 Placement Cells'}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto space-y-8 pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-purple-500 dark:text-orange-500" size={28} />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-zinc-500">
            <FileText size={32} className="mb-2" />
            <p className="font-medium">No templates found</p>
          </div>
        ) : (
          <>
            {/* Student Templates */}
            {studentTemplates.length > 0 && (filterAudience === '' || filterAudience === 'STUDENT') && (
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  Student Templates
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 normal-case tracking-normal">({studentTemplates.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {studentTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onPreview={() => setPreviewTemplate(template)}
                      onEdit={() => handleEdit(template)}
                      onDelete={() => setDeleteModal({ open: true, template })}
                      onCopy={() => handleCopyBody(template)}
                      copiedId={copiedId}
                      isAdmin={user.role === 'ADMIN'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Placement Cell Templates */}
            {placementTemplates.length > 0 && (filterAudience === '' || filterAudience === 'PLACEMENT_CELL') && (
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 size={16} className="text-purple-500" />
                  Placement Cell Templates
                  <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 normal-case tracking-normal">({placementTemplates.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {placementTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onPreview={() => setPreviewTemplate(template)}
                      onEdit={() => handleEdit(template)}
                      onDelete={() => setDeleteModal({ open: true, template })}
                      onCopy={() => handleCopyBody(template)}
                      copiedId={copiedId}
                      isAdmin={user.role === 'ADMIN'}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{previewTemplate.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${audienceConfig[previewTemplate.audience].color}`}>
                    {audienceConfig[previewTemplate.audience].label}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500">{categoryLabels[previewTemplate.category]}</span>
                </div>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Subject Line</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">{previewTemplate.subject}</p>
              </div>
              {previewTemplate.variables && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Variables Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewTemplate.variables.split(',').map(v => (
                      <span key={v} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md text-xs font-mono border border-purple-200 dark:border-purple-500/20">
                        {`{{${v.trim()}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Email Body</p>
                <div className="text-sm text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                  {previewTemplate.body}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setEditingTemplate(null); resetForm(); }} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Template Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    placeholder="e.g. Student Introduction"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Audience *</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData(f => ({ ...f, audience: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 text-slate-900 dark:text-white outline-none transition-all"
                  >
                    <option value="STUDENT">🎓 Student</option>
                    <option value="PLACEMENT_CELL">🏫 Placement Cell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 text-slate-900 dark:text-white outline-none transition-all"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Variables (comma-separated)</label>
                  <input
                    value={formData.variables}
                    onChange={(e) => setFormData(f => ({ ...f, variables: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 text-slate-900 dark:text-white outline-none transition-all font-mono text-xs"
                    placeholder="student_name,college_name,duration"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Subject Line *</label>
                <input
                  value={formData.subject}
                  onChange={(e) => setFormData(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  placeholder="Email subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Email Body *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData(f => ({ ...f, body: e.target.value }))}
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Write your email body here... Use {{variable_name}} for dynamic content."
                />
              </div>

              </div>

              <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 shrink-0 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingTemplate(null); resetForm(); }}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors shadow-sm shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600 dark:text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Template</h3>
              <p className="text-slate-500 dark:text-zinc-400 mb-6">
                Are you sure you want to delete "{deleteModal.template?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ open: false, template: null })}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >Cancel</button>
                <button onClick={handleDelete}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TemplateCard = ({ template, onPreview, onEdit, onDelete, onCopy, copiedId, isAdmin }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${audienceConfig[template.audience].color}`}>
              {audienceConfig[template.audience].label}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
              {categoryLabels[template.category]}
            </span>
          </div>
          {template.is_default && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">DEFAULT</span>
          )}
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 line-clamp-2">{template.name}</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3 line-clamp-1 font-mono bg-slate-50 dark:bg-zinc-800/50 px-2 py-1 rounded">
          📧 {template.subject}
        </p>
        <p className="text-xs text-slate-400 dark:text-zinc-500 line-clamp-3 leading-relaxed">
          {template.body.substring(0, 150)}...
        </p>

        {template.variables && (
          <div className="flex flex-wrap gap-1 mt-3">
            {template.variables.split(',').slice(0, 3).map(v => (
              <span key={v} className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400 rounded border border-purple-100 dark:border-purple-500/20">
                {`{{${v.trim()}}}`}
              </span>
            ))}
            {template.variables.split(',').length > 3 && (
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">+{template.variables.split(',').length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
        <button onClick={onPreview} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          <Eye size={14} /> Preview
        </button>
        <button onClick={onCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
          {copiedId === template.id ? <><Check size={14} className="text-emerald-500" /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
        {isAdmin && (
          <>
            <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors ml-auto">
              <Edit size={14} /> Edit
            </button>
            {!template.is_default && (
              <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;
