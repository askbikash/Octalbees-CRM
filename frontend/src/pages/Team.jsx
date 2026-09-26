import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Loader2, Mail, Phone, Shield, ShieldCheck, X, Activity, MoreHorizontal, Power } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/ui/Skeleton';

const Team = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Performance Modal State
  const [isPerfModalOpen, setIsPerfModalOpen] = useState(false);
  const [perfData, setPerfData] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      role: 'BDE'
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      await api.post('/users', data);
      setIsModalOpen(false);
      reset();
      fetchUsers();
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (id === currentUser.id) {
      alert("You cannot deactivate your own account.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;

    try {
      await api.patch(`/users/${id}/status`, { is_active: !currentStatus });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const viewPerformance = async (u) => {
    setSelectedUser(u);
    setIsPerfModalOpen(true);
    setPerfLoading(true);
    try {
      const res = await api.get(`/users/${u.id}/performance`);
      setPerfData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setPerfLoading(false);
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Shield size={48} className="text-red-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
        <p className="text-slate-500 dark:text-zinc-400 mt-2 max-w-md">
          You do not have permission to view or manage the team directory. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-purple-600 dark:text-orange-400" />
            Team Directory
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">Manage users and access permissions</p>
        </div>
        
        <button 
          onClick={() => { reset(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 dark:text-white text-white rounded-xl font-bold transition-colors shadow-sm shadow-purple-600/20 dark:shadow-purple-500/20 w-fit shrink-0"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-0 relative">
        <div className="overflow-auto flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-slate-50/95 dark:bg-zinc-900/95 backdrop-blur-md text-slate-500 dark:text-zinc-400 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">User Info</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Contact</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/50 bg-white dark:bg-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-0">
                    <TableSkeleton columns={4} rows={5} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center text-slate-500 dark:text-zinc-400">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="text-slate-400" size={24} />
                    </div>
                    <p className="font-medium">No users found in directory.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors bg-white dark:bg-zinc-900">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white text-base">{u.name}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Added {new Date(u.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                        <Mail size={14} className="text-slate-400" />
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                          <Phone size={14} className="text-slate-400" />
                          {u.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={12} /> : <Users size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${u.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
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
                        <div className="absolute right-0 mt-1 w-36 origin-top-right bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 flex flex-col p-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); viewPerformance(u); }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-zinc-300 dark:hover:text-orange-400 dark:hover:bg-orange-500/10 rounded-lg transition-colors text-left font-medium"
                          >
                            <Activity size={14} /> Performance
                          </button>
                          
                          {u.id !== currentUser.id && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleStatus(u.id, u.is_active); }}
                              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left font-medium ${u.is_active ? 'text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-zinc-300 dark:hover:text-red-400 dark:hover:bg-red-500/10' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-zinc-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10'}`}
                            >
                              <Power size={14} /> {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
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
          <span>Showing {users.length} team members</span>
          <span className="flex items-center gap-1.5 opacity-70">
            <ShieldCheck size={14} className="text-purple-500 dark:text-orange-500" /> Secure Directory
          </span>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/30">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="text-purple-600 dark:text-orange-400" />
                Add New User
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {submitError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 text-sm flex items-center gap-2">
                  <Shield size={16} />
                  {submitError}
                </div>
              )}

              <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Full Name</label>
                  <input 
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    placeholder="Jane Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Email Address</label>
                  <input 
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Phone Number</label>
                  <input 
                    {...register('phone')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    placeholder="+91..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Role</label>
                    <select 
                      {...register('role')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="BDE">Sales (BDE)</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Initial Password</label>
                    <input 
                      type="password"
                      {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                      placeholder="Secret123"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 flex justify-end gap-3 mt-auto">
              <button 
                form="user-form"
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 dark:text-white disabled:opacity-50 transition-colors shadow-sm shadow-purple-500/25 dark:shadow-purple-500/25"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {isPerfModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/30">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="text-purple-600 dark:text-orange-400" />
                Performance Snapshot
              </h2>
              <button 
                onClick={() => setIsPerfModalOpen(false)}
                className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-600/10 mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-purple-600 dark:text-orange-400">{selectedUser.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-slate-500 dark:text-zinc-400 text-sm">{selectedUser.role}</p>
              </div>

              {perfLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-purple-500 dark:text-orange-500" size={32} />
                </div>
              ) : perfData ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-1">Assigned</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{perfData.assigned}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-1">Converted</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{perfData.converted}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-1">Follow-ups</p>
                    <p className="text-2xl font-black text-purple-600 dark:text-orange-400">{perfData.followups}</p>
                  </div>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Team;
