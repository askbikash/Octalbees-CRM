import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Loader2, ShieldCheck, Mail, Phone, Briefcase, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Settings = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const { register: regProfile, handleSubmit: handleProfile, formState: { isSubmitting: isSubmittingProfile } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email_signature: user?.email_signature || '',
      working_hours_start: user?.working_hours_start || '09:00',
      working_hours_end: user?.working_hours_end || '18:00',
      working_days: user?.working_days || 'MON,TUE,WED,THU,FRI'
    }
  });

  const { register: regPass, handleSubmit: handlePass, reset: resetPass, formState: { errors: passErrors, isSubmitting: isSubmittingPass } } = useForm();

  const onProfileSubmit = async (data) => {
    try {
      setProfileMsg(null);
      const res = await api.put('/users/profile', data);
      const updatedUser = res.data.data;
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(updatedUser, currentToken);
      }
      setProfileMsg({ type: 'success', text: 'Settings updated successfully!' });
      toast.success('Settings updated successfully!');
    } catch (error) {
      setProfileMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update settings' });
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    try {
      setPasswordMsg(null);
      await api.put('/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      toast.success('Password updated successfully!');
      resetPass();
    } catch (error) {
      setPasswordMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-orange-400 dark:to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
            <Camera size={14} />
          </button>
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h1>
          <p className="text-slate-500 dark:text-zinc-400 font-medium">{user?.role} • {user?.email}</p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Tabs Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-2 shadow-sm sticky top-8 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${isActive ? 'bg-purple-50 text-purple-700 dark:bg-orange-500/10 dark:text-orange-400 shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Icon size={18} className={isActive ? 'text-purple-600 dark:text-orange-400' : ''} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1">
          
          {/* Profile Panel */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Update your basic profile details.</p>
              </div>
              
              <div className="p-6 sm:p-8">
                {profileMsg && (
                  <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {profileMsg.type === 'success' ? <ShieldCheck size={18} /> : <SettingsIcon size={18} />}
                    {profileMsg.text}
                  </div>
                )}

                <form id="profile-form" onSubmit={handleProfile(onProfileSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        disabled 
                        value={user?.email || ''} 
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 dark:group-focus-within:text-orange-500 transition-colors" size={18} />
                      <input 
                        {...regProfile('name', { required: true })}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-orange-500/10 text-slate-900 dark:text-white outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 dark:group-focus-within:text-orange-500 transition-colors" size={18} />
                      <input 
                        {...regProfile('phone')}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-orange-500/10 text-slate-900 dark:text-white outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25 dark:shadow-orange-500/25 transform hover:-translate-y-0.5"
                    >
                      {isSubmittingProfile ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Preferences Panel */}
          {activeTab === 'preferences' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Work Preferences</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Configure your working hours and email signature.</p>
              </div>
              
              <div className="p-6 sm:p-8">
                <form id="preferences-form" onSubmit={handleProfile(onProfileSubmit)} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-1">Email Signature</label>
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-3">This will be automatically appended to all emails you send from the CRM.</p>
                    <textarea 
                      {...regProfile('email_signature')}
                      rows={5}
                      placeholder={`Thanks,\n\nJohn Doe\nOctalbees CRM`}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-orange-500/10 text-slate-900 dark:text-white outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Working Hours (Start)</label>
                      <input 
                        type="time"
                        {...regProfile('working_hours_start')}
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-orange-500/10 text-slate-900 dark:text-white outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Working Hours (End)</label>
                      <input 
                        type="time"
                        {...regProfile('working_hours_end')}
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-orange-500/10 text-slate-900 dark:text-white outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Working Days</label>
                    <input 
                      type="text"
                      {...regProfile('working_days')}
                      placeholder="e.g. MON,TUE,WED,THU,FRI"
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-orange-500/10 text-slate-900 dark:text-white outline-none transition-all uppercase font-medium"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25 dark:shadow-orange-500/25 transform hover:-translate-y-0.5"
                    >
                      {isSubmittingProfile ? <Loader2 className="animate-spin" size={18} /> : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Security Panel */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Password</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Keep your account secure by updating your password regularly.</p>
              </div>
              
              <div className="p-6 sm:p-8">
                {passwordMsg && (
                  <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {passwordMsg.type === 'success' ? <ShieldCheck size={18} /> : <SettingsIcon size={18} />}
                    {passwordMsg.text}
                  </div>
                )}

                <form id="password-form" onSubmit={handlePass(onPasswordSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Current Password</label>
                    <input 
                      type="password"
                      {...regPass('currentPassword', { required: 'Current password is required' })}
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 dark:text-white outline-none transition-all font-medium"
                      placeholder="••••••••"
                    />
                    {passErrors.currentPassword && <p className="text-red-500 text-xs mt-2 font-medium">{passErrors.currentPassword.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">New Password</label>
                    <input 
                      type="password"
                      {...regPass('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 dark:text-white outline-none transition-all font-medium"
                      placeholder="••••••••"
                    />
                    {passErrors.newPassword && <p className="text-red-500 text-xs mt-2 font-medium">{passErrors.newPassword.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Confirm New Password</label>
                    <input 
                      type="password"
                      {...regPass('confirmPassword', { required: 'Please confirm password' })}
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 dark:text-white outline-none transition-all font-medium"
                      placeholder="••••••••"
                    />
                    {passErrors.confirmPassword && <p className="text-red-500 text-xs mt-2 font-medium">{passErrors.confirmPassword.message}</p>}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSubmittingPass}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25 transform hover:-translate-y-0.5"
                    >
                      {isSubmittingPass ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
