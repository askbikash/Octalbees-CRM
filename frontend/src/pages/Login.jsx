import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Mail, Lock, ArrowRight, Loader2, Sun, Moon, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [apiError, setApiError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setApiError('');
      const response = await api.post('/auth/login', data);
      
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token);
        navigate('/');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const messages = error.response.data.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        setApiError(`Validation failed - ${messages}`);
      } else {
        setApiError(error.response?.data?.message || 'Failed to securely connect.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-slate-50 dark:bg-zinc-950 transition-colors duration-700">
      
      {/* Full Page Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-500/20 dark:from-purple-600/20 dark:to-indigo-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-orange-300/20 to-orange-400/20 dark:from-orange-500/10 dark:to-orange-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-10000 delay-1000" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
      </div>

      {/* Theme Toggle Floating Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 sm:top-8 sm:right-8 p-3 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm hover:shadow-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-zinc-800 transition-all z-50 border border-white/50 dark:border-zinc-700/50"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-6xl h-[85vh] min-h-[600px] max-h-[800px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] border border-white/60 dark:border-zinc-800/60 flex overflow-hidden relative z-10 animate-in zoom-in-95 duration-700">
        
        {/* Left Side - Vibrant Branding Panel (Hidden on small screens) */}
        <div className="hidden lg:flex w-[45%] xl:w-1/2 relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden flex-col justify-between p-12 lg:p-16">
          {/* Internal Glow Effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0" />
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/30 blur-[100px] rounded-full mix-blend-screen z-0" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full mix-blend-screen z-0" />

          {/* Logo */}
          <div className="relative z-10 animate-in fade-in slide-in-from-left-4 duration-1000 delay-100">
            <img src="/Logo-white.png" alt="Octalbees" className="h-10 w-auto object-contain drop-shadow-lg" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 my-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
              <Sparkles size={14} className="text-orange-300" />
              <span className="text-xs font-semibold text-white tracking-wide uppercase">CRM 2.0 is Here</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-6 tracking-tight drop-shadow-md">
              Accelerate your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-purple-300">sales momentum.</span>
            </h1>
            <p className="text-purple-100/80 text-lg leading-relaxed max-w-md font-light">
              Log in to access your intelligent workspace. Close deals faster with powerful tracking, smart follow-ups, and real-time analytics.
            </p>
          </div>

          {/* Feature Badges Footer */}
          <div className="relative z-10 flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <TrendingUp size={18} className="text-orange-300" />
              </div>
              <span className="text-sm font-medium text-white">Higher Conversion</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <ShieldCheck size={18} className="text-purple-300" />
              </div>
              <span className="text-sm font-medium text-white">Secure Access</span>
            </div>
          </div>
        </div>

        {/* Right Side - Clean Login Form */}
        <div className="flex-1 flex flex-col justify-center relative p-8 sm:p-12 lg:p-16 xl:p-24 bg-white/40 dark:bg-zinc-950/40">
          
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-10 flex justify-center animate-in fade-in slide-in-from-top-4 duration-700">
              {isDarkMode ? (
                <img src="/Logo-white.png" alt="Octalbees" className="h-10 w-auto object-contain" />
              ) : (
                <img src="/logo-black.png" alt="Octalbees" className="h-10 w-auto object-contain" />
              )}
            </div>

            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 font-medium">
                Enter your credentials to access your account.
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50/80 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-3 animate-in shake duration-300">
                <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-orange-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    {...register('email')}
                    type="email"
                    placeholder="name@octalbees.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-orange-500/10 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-300 outline-none font-medium shadow-sm hover:shadow-md focus:shadow-md"
                  />
                </div>
                {errors.email && <p className="mt-2 text-xs text-red-500 font-bold">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300">Password</label>
                  <a href="#" className="text-sm font-bold text-purple-600 dark:text-orange-500 hover:text-purple-700 dark:hover:text-orange-400 hover:underline transition-colors">Forgot password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-orange-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-purple-500/10 dark:focus:ring-orange-500/10 text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-300 outline-none font-medium shadow-sm hover:shadow-md focus:shadow-md"
                  />
                </div>
                {errors.password && <p className="mt-2 text-xs text-red-500 font-bold">{errors.password.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 transition-all duration-300 disabled:opacity-70 mt-8 group shadow-lg shadow-purple-600/20 dark:shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign In securely
                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
