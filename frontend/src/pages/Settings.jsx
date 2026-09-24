import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Loader2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, login } = useAuth();
  
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const { register: regProfile, handleSubmit: handleProfile, formState: { isSubmitting: isSubmittingProfile } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  const { register: regPass, handleSubmit: handlePass, reset: resetPass, formState: { errors: passErrors, isSubmitting: isSubmittingPass } } = useForm();

  const onProfileSubmit = async (data) => {
    try {
      setProfileMsg(null);
      const res = await api.put('/users/profile', data);
      
      // Update local auth context by pseudo-logging in again with the new data + existing token
      // AuthContext expects token and user in localstorage, which shouldn't invalidate if we just update the user object
      const updatedUser = res.data.data;
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(updatedUser, currentToken);
      }
      
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setProfileMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
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
      resetPass();
    } catch (error) {
      setPasswordMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-purple-600 dark:text-orange-400" />
          My Settings
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">Manage your personal profile and security preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="text-purple-600 dark:text-orange-400" size={20} />
              Personal Information
            </h2>
          </div>
          
          <div className="p-6 flex-1">
            {profileMsg && (
              <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'}`}>
                {profileMsg.type === 'success' ? <ShieldCheck size={16} /> : <SettingsIcon size={16} />}
                {profileMsg.text}
              </div>
            )}

            <form id="profile-form" onSubmit={handleProfile(onProfileSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Email Address (Cannot be changed)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                  <input 
                    type="text" 
                    disabled 
                    value={user?.email || ''} 
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                  <input 
                    {...regProfile('name', { required: true })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                  <input 
                    {...regProfile('phone')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
              </div>
            </form>
          </div>
          
          <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
            <button 
              form="profile-form"
              type="submit"
              disabled={isSubmittingProfile}
              className="w-full flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-200 dark:text-zinc-950 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmittingProfile ? <Loader2 className="animate-spin" size={18} /> : 'Save Profile Changes'}
            </button>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="text-emerald-500" size={20} />
              Security & Password
            </h2>
          </div>
          
          <div className="p-6 flex-1">
            {passwordMsg && (
              <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'}`}>
                {passwordMsg.type === 'success' ? <ShieldCheck size={16} /> : <SettingsIcon size={16} />}
                {passwordMsg.text}
              </div>
            )}

            <form id="password-form" onSubmit={handlePass(onPasswordSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Current Password</label>
                <input 
                  type="password"
                  {...regPass('currentPassword', { required: 'Current password is required' })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  placeholder="••••••••"
                />
                {passErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passErrors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">New Password</label>
                <input 
                  type="password"
                  {...regPass('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  placeholder="••••••••"
                />
                {passErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Confirm New Password</label>
                <input 
                  type="password"
                  {...regPass('confirmPassword', { required: 'Please confirm password' })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  placeholder="••••••••"
                />
                {passErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passErrors.confirmPassword.message}</p>}
              </div>
            </form>
          </div>
          
          <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
            <button 
              form="password-form"
              type="submit"
              disabled={isSubmittingPass}
              className="w-full flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-500/25"
            >
              {isSubmittingPass ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
