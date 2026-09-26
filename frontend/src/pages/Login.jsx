import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  Mail, Lock, ArrowRight, Loader2, Sun, Moon,
  Sparkles, TrendingUp, ShieldCheck, AlertTriangle,
  Eye, EyeOff, Zap, BarChart3, Users
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0a0f] transition-colors duration-700">

      {/* === Animated Background Layer === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        <div
          className="absolute rounded-full blur-[140px] opacity-60 dark:opacity-30"
          style={{
            width: '45vw', height: '45vw', top: '-15%', left: '-10%',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #818cf8 100%)',
            animation: 'float-slow 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-[120px] opacity-40 dark:opacity-20"
          style={{
            width: '35vw', height: '35vw', bottom: '-10%', right: '-5%',
            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6d28d9 100%)',
            animation: 'float-slow 25s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute rounded-full blur-[100px] opacity-30 dark:opacity-15"
          style={{
            width: '20vw', height: '20vw', top: '40%', left: '50%',
            background: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 100%)',
            animation: 'float-slow 18s ease-in-out infinite 2s',
          }}
        />
        {/* Noise grain overlay */}
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`
        }} />
        {/* Grid pattern for dark mode */}
        <div className="absolute inset-0 opacity-0 dark:opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* CSS Keyframes injected inline */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          50% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-up { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-right { animation: slide-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fade-in 0.8s ease forwards; }
        .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 sm:top-7 sm:right-7 z-50 p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* === Main Split Card === */}
      <div
        className={`w-full max-w-[1100px] mx-4 sm:mx-8 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_80px_-10px_rgba(124,58,237,0.12)] dark:shadow-[0_20px_80px_-10px_rgba(124,58,237,0.15)] border border-white/80 dark:border-white/[0.06] flex flex-col lg:flex-row overflow-hidden relative z-10 min-h-[580px] lg:min-h-[640px] transition-all duration-500 ${mounted ? 'animate-scale-in' : 'opacity-0'}`}
      >

        {/* ====== LEFT PANEL — Immersive Branding ====== */}
        <div className="hidden lg:flex w-[48%] relative overflow-hidden flex-col justify-between p-10 xl:p-14">
          {/* Deep gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e0a3c] via-[#2d1065] to-[#0f0528]" />

          {/* Animated mesh overlay */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.2) 0%, transparent 70%)'
          }} />

          {/* Floating glass circles */}
          <div className="absolute top-16 right-10 w-28 h-28 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" style={{ animation: 'float-slow 15s ease-in-out infinite' }} />
          <div className="absolute bottom-20 left-8 w-16 h-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" style={{ animation: 'float-slow 12s ease-in-out infinite reverse' }} />
          <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full border border-white/10 bg-purple-500/10 backdrop-blur-sm" style={{ animation: 'float-slow 18s ease-in-out infinite 3s' }} />

          {/* Glowing top-right accent line */}
          <div className="absolute top-0 right-0 w-px h-1/2 bg-gradient-to-b from-purple-400/40 via-purple-500/10 to-transparent" />

          {/* Logo */}
          <div className="relative z-10 opacity-0 animate-slide-right delay-200">
            <img src="/Logo-white.png" alt="Octalbees" className="h-9 w-auto object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 my-auto py-6">
            <div className="opacity-0 animate-slide-up delay-300">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-md mb-8">
                <Sparkles size={13} className="text-purple-300" />
                <span className="text-[11px] font-semibold text-purple-200 tracking-[0.15em] uppercase">Enterprise CRM</span>
              </div>
            </div>

            <h1 className="opacity-0 animate-slide-up delay-400">
              <span className="block text-3xl xl:text-[2.6rem] font-extrabold text-white leading-[1.15] tracking-tight">
                Drive results,
              </span>
              <span className="block text-3xl xl:text-[2.6rem] font-extrabold leading-[1.15] tracking-tight mt-1"
                style={{
                  background: 'linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 30%, #a78bfa 60%, #f0abfc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 4s linear infinite',
                }}
              >
                not spreadsheets.
              </span>
            </h1>

            <p className="text-purple-200/60 text-[15px] leading-relaxed max-w-[340px] mt-6 font-light opacity-0 animate-slide-up delay-500">
              One platform to manage every lead, track every follow-up, and empower your entire sales team — from first contact to closed deal.
            </p>
          </div>

          {/* Feature Stats Strip */}
          <div className="relative z-10 opacity-0 animate-slide-up delay-700">
            <div className="flex items-center gap-4">
              {[
                { icon: <Zap size={15} />, label: 'Lead Tracking', color: 'text-amber-300' },
                { icon: <BarChart3 size={15} />, label: 'Analytics', color: 'text-purple-300' },
                { icon: <Users size={15} />, label: 'Team Sync', color: 'text-emerald-300' },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
                  <span className={feat.color}>{feat.icon}</span>
                  <span className="text-xs font-medium text-white/80">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ====== RIGHT PANEL — Login Form ====== */}
        <div className="flex-1 flex flex-col justify-center relative p-6 sm:p-10 lg:p-14 xl:p-16">
          {/* Subtle gradient accent on form side */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent lg:hidden" />

          <div className="w-full max-w-[380px] mx-auto">
            {/* Mobile Logo */}
            <div className={`lg:hidden mb-8 flex justify-center ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
              {isDarkMode ? (
                <img src="/Logo-white.png" alt="Octalbees" className="h-9 w-auto object-contain" />
              ) : (
                <img src="/logo-black.png" alt="Octalbees" className="h-9 w-auto object-contain" />
              )}
            </div>

            {/* Heading */}
            <div className={`mb-8 ${mounted ? 'opacity-0 animate-slide-up delay-200' : 'opacity-0'}`}>
              <h2 className="text-2xl sm:text-[1.75rem] font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sign in to your workspace
              </h2>
              <p className="text-slate-500 dark:text-zinc-500 mt-1.5 text-[15px]">
                Welcome back — your team is waiting for you.
              </p>
            </div>

            {/* Error Alert */}
            {apiError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50/90 dark:bg-red-500/[0.08] border border-red-200/80 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-2.5 animate-scale-in">
                <AlertTriangle className="shrink-0 mt-0.5" size={15} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-5 ${mounted ? 'opacity-0 animate-slide-up delay-300' : 'opacity-0'}`}>
              {/* Email Field */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-zinc-400 mb-2 tracking-wide uppercase">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-zinc-600 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors duration-300">
                    <Mail size={17} strokeWidth={2} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@octalbees.com"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:bg-white dark:focus:bg-white/[0.06] focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10 dark:focus:ring-purple-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 transition-all duration-300 outline-none text-[15px] font-medium hover:border-slate-300 dark:hover:border-white/[0.12]"
                  />
                </div>
                {errors.email && <p className="mt-2 text-xs text-red-500 dark:text-red-400 font-semibold flex items-center gap-1"><AlertTriangle size={11} /> {errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-semibold text-slate-600 dark:text-zinc-400 tracking-wide uppercase">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[13px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-zinc-600 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors duration-300">
                    <Lock size={17} strokeWidth={2} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:bg-white dark:focus:bg-white/[0.06] focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10 dark:focus:ring-purple-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 transition-all duration-300 outline-none text-[15px] font-medium hover:border-slate-300 dark:hover:border-white/[0.12]"
                  />
                  {/* Eye Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-zinc-600 hover:text-purple-500 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-xs text-red-500 dark:text-red-400 font-semibold flex items-center gap-1"><AlertTriangle size={11} /> {errors.password.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 rounded-2xl text-white font-bold text-[15px] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2 group relative overflow-hidden shadow-[0_8px_30px_-6px_rgba(124,58,237,0.4)] hover:shadow-[0_12px_40px_-6px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_4px_20px_-6px_rgba(124,58,237,0.4)]"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                }}
              >
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                }} />
                <span className="relative z-10 flex items-center gap-2.5">
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={19} />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Bottom Security Badge */}
            <div className={`mt-8 flex items-center justify-center gap-2 ${mounted ? 'opacity-0 animate-fade-in delay-700' : 'opacity-0'}`}>
              <ShieldCheck size={14} className="text-emerald-500/70" />
              <span className="text-xs text-slate-400 dark:text-zinc-600 font-medium">
                256-bit SSL encrypted · Enterprise grade security
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
