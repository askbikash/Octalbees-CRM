import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MapPin, Globe, Loader2, X, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Colleges = () => {
  const { user } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [editingCollege, setEditingCollege] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    fetchColleges();
  }, [search]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/colleges?search=${search}`);
      setColleges(res.data.data);
    } catch (error) {
      console.error('Failed to fetch colleges', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      // Clean up empty optional fields
      const payload = { ...data };
      if (!payload.website) delete payload.website;
      if (!payload.email) delete payload.email;
      if (!payload.phone) delete payload.phone;

      if (editingCollege) {
        await api.put(`/colleges/${editingCollege.id}`, payload);
      } else {
        await api.post('/colleges', payload);
      }
      
      setIsModalOpen(false);
      setEditingCollege(null);
      reset();
      fetchColleges();
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle Zod validation errors from backend
        const messages = error.response.data.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        setSubmitError(`Validation failed - ${messages}`);
      } else {
        setSubmitError(error.response?.data?.message || 'Failed to save college');
      }
    }
  };

  const openEditModal = (college) => {
    setEditingCollege(college);
    reset({
      name: college.name,
      type: college.type || 'COLLEGE',
      phone: college.phone || '',
      email: college.email || '',
      website: college.website || '',
      city: college.city || '',
      state: college.state || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone unless there are active leads.`)) {
      return;
    }
    try {
      await api.delete(`/colleges/${id}`);
      fetchColleges();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete college. Ensure it has no active leads.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-purple-600 dark:text-orange-400" />
            College Database
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">Manage all university and college contacts</p>
        </div>
        
        <button 
          onClick={() => { setEditingCollege(null); reset({}); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-zinc-950 text-white rounded-xl font-bold transition-colors shadow-sm shadow-purple-600/20 dark:shadow-orange-500/20 w-fit"
        >
          <Plus size={18} />
          Add College
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/30 shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search colleges by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 focus:border-purple-500 dark:focus:border-orange-500 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-slate-50/95 dark:bg-zinc-900/95 backdrop-blur-md text-slate-500 dark:text-zinc-400 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">College Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Location</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Type</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Website</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Added On</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/50 bg-white dark:bg-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-3 text-purple-500 dark:text-orange-500" size={28} />
                    <p className="font-medium">Loading colleges...</p>
                  </td>
                </tr>
              ) : colleges.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center text-slate-500 dark:text-zinc-400">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building2 className="text-slate-400" size={24} />
                    </div>
                    <p className="font-medium">No colleges found in the database.</p>
                  </td>
                </tr>
              ) : (
                colleges.map((college) => (
                  <tr key={college.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer bg-white dark:bg-zinc-900">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{college.name}</div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{college.email || 'No email provided'}</div>
                      {college.phone && (
                        <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{college.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                        <MapPin size={14} className="text-slate-400 dark:text-zinc-500" />
                        {college.city || 'Unknown'}, {college.state || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-orange-500/10 text-purple-700 dark:text-orange-400 text-xs font-bold border border-purple-100 dark:border-orange-500/20">
                        {college.type || 'COLLEGE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {college.website ? (
                        <a href={college.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-purple-600 dark:text-orange-400 hover:underline">
                          <Globe size={14} /> View Site
                        </a>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 text-xs font-medium">
                      {new Date(college.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(user.role === 'ADMIN' || college.created_by === user.id) && (
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
                              onClick={(e) => { e.stopPropagation(); openEditModal(college); }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-zinc-300 dark:hover:text-orange-400 dark:hover:bg-orange-500/10 rounded-lg transition-colors text-left"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(college.id, college.name); }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-zinc-300 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/50 flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400 font-medium shrink-0 backdrop-blur-md">
          <span>Showing {colleges.length} colleges</span>
          <span className="flex items-center gap-1.5 opacity-70">
            <Building2 size={14} className="text-purple-500 dark:text-orange-500" /> College Database
          </span>
        </div>
      </div>

      {/* Add College Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCollege ? 'Edit College' : 'Add New College'}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingCollege(null); reset({}); setSubmitError(''); }}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {submitError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                  {submitError}
                </div>
              )}

              <form id="college-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">College Name *</label>
                  <input 
                    {...register('name', { required: 'College name is required' })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    placeholder="e.g. ABC Engineering College"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Institution Type</label>
                    <select 
                      {...register('type')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="COLLEGE">College</option>
                      <option value="UNIVERSITY">University</option>
                      <option value="INSTITUTE">Institute</option>
                      <option value="TRAINING_INSTITUTE">Training Institute</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Contact Number</label>
                    <input 
                      {...register('phone')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Email Address</label>
                    <input 
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="e.g. info@college.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Website URL</label>
                    <input 
                      type="url"
                      {...register('website')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">City</label>
                    <input 
                      {...register('city')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">State</label>
                    <input 
                      {...register('state')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 flex justify-end gap-3">
              <button 
                onClick={() => { setIsModalOpen(false); setEditingCollege(null); reset({}); }}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                form="college-form"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-zinc-950 disabled:opacity-70 transition-colors shadow-sm shadow-purple-500/25 dark:shadow-orange-500/25"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                {editingCollege ? 'Update College' : 'Save College'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Colleges;
