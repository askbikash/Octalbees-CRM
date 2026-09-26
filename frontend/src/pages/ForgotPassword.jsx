import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  Mail, ArrowRight, ArrowLeft, Loader2, Sun, Moon,
  ShieldCheck, AlertTriangle, KeyRound, Lock,
  Eye, EyeOff, CheckCircle2, HelpCircle, Fingerprint
} from 'lucide-react';

const STEPS = {
  EMAIL: 0,
  SECURITY: 1,
  OTP: 2,
  NEW_PASSWORD: 3,
  SUCCESS: 4,
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(STEPS.EMAIL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data across steps
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ─── Step 1: Submit Email ───
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSecurityQuestion(res.data.data.security_question);
        setStep(STEPS.SECURITY);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Submit Security Answer ───
  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-security', { email, answer: securityAnswer });
      if (res.data.success) {
        setStep(STEPS.OTP);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect answer.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input Handler ───
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
    }
  };

  // ─── Step 3: Submit OTP ───
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpString });
      if (res.data.success) {
        setResetToken(res.data.data.resetToken);
        setStep(STEPS.NEW_PASSWORD);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 4: Reset Password ───
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, resetToken, newPassword });
      if (res.data.success) {
        setStep(STEPS.SUCCESS);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step indicators ───
  const stepLabels = ['Email', 'Security', 'OTP', 'Password'];
  const activeStepIndex = Math.min(step, 3);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0a0f] transition-colors duration-700">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full blur-[140px] opacity-50 dark:opacity-25"
          style={{ width: '40vw', height: '40vw', top: '-10%', right: '-5%', background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }} />
        <div className="absolute rounded-full blur-[120px] opacity-35 dark:opacity-15"
          style={{ width: '30vw', height: '30vw', bottom: '-10%', left: '-5%', background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }} />
        <div className="absolute inset-0 opacity-0 dark:opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .anim-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-fade-in { animation: fade-in 0.6s ease forwards; }
      `}</style>

      {/* Theme Toggle */}
      <button onClick={toggleTheme}
        className="absolute top-5 right-5 z-50 p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Main Card */}
      <div className={`w-full max-w-[460px] mx-4 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_80px_-10px_rgba(124,58,237,0.12)] dark:shadow-[0_20px_80px_-10px_rgba(124,58,237,0.15)] border border-white/80 dark:border-white/[0.06] p-8 sm:p-10 relative z-10 transition-all duration-500 ${mounted ? 'anim-scale-in' : 'opacity-0'}`}>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          {isDarkMode ? (
            <img src="/Logo-white.png" alt="Octalbees" className="h-8 w-auto object-contain" />
          ) : (
            <img src="/logo-black.png" alt="Octalbees" className="h-8 w-auto object-contain" />
          )}
        </div>

        {/* Step Progress Bar */}
        {step < STEPS.SUCCESS && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < activeStepIndex ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' :
                  i === activeStepIndex ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 scale-110' :
                  'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-zinc-600'
                }`}>
                  {i < activeStepIndex ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                {i < 3 && (
                  <div className={`w-6 sm:w-10 h-0.5 rounded-full transition-all duration-500 ${
                    i < activeStepIndex ? 'bg-purple-500' : 'bg-slate-200 dark:bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50/90 dark:bg-red-500/[0.08] border border-red-200/80 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-2.5 anim-scale-in">
            <AlertTriangle className="shrink-0 mt-0.5" size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* ════ STEP 1: EMAIL ════ */}
        {step === STEPS.EMAIL && (
          <div className="anim-slide-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Forgot your password?</h2>
              <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">Enter your email to start the recovery process.</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                  placeholder="you@octalbees.com"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 transition-all duration-300 outline-none text-[15px] font-medium"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-white font-bold text-[15px] transition-all duration-300 disabled:opacity-60 group shadow-[0_8px_30px_-6px_rgba(124,58,237,0.4)] hover:shadow-[0_12px_40px_-6px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)' }}>
                {loading ? <Loader2 className="animate-spin" size={19} /> : <><span>Continue</span><ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          </div>
        )}

        {/* ════ STEP 2: SECURITY QUESTION ════ */}
        {step === STEPS.SECURITY && (
          <div className="anim-slide-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Security Verification</h2>
              <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">Answer your security question to proceed.</p>
            </div>
            <form onSubmit={handleSecuritySubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">Your Security Question</label>
                <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-500/[0.06] border border-purple-200/60 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-[15px] font-semibold">
                  {securityQuestion}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">Your Answer</label>
                <input
                  type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required autoFocus
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 transition-all duration-300 outline-none text-[15px] font-medium"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(STEPS.EMAIL); setError(''); }}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-slate-600 dark:text-zinc-400 font-bold text-sm bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all">
                  <ArrowLeft size={16} />
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-[15px] transition-all duration-300 disabled:opacity-60 group shadow-[0_8px_30px_-6px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)' }}>
                  {loading ? <Loader2 className="animate-spin" size={19} /> : <><span>Verify & Send OTP</span><ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════ STEP 3: OTP ════ */}
        {step === STEPS.OTP && (
          <div className="anim-slide-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Fingerprint size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Enter OTP</h2>
              <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">
                We sent a 6-digit code to <strong className="text-slate-700 dark:text-zinc-300">{email}</strong>
              </p>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl text-center text-xl sm:text-2xl font-extrabold bg-slate-50/80 dark:bg-white/[0.04] border-2 border-slate-200 dark:border-white/[0.1] focus:border-purple-500 dark:focus:border-purple-400 focus:ring-[3px] focus:ring-purple-500/15 text-slate-900 dark:text-white transition-all duration-200 outline-none"
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(STEPS.SECURITY); setError(''); setOtp(['', '', '', '', '', '']); }}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-slate-600 dark:text-zinc-400 font-bold text-sm bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all">
                  <ArrowLeft size={16} />
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-[15px] transition-all duration-300 disabled:opacity-60 group shadow-[0_8px_30px_-6px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)' }}>
                  {loading ? <Loader2 className="animate-spin" size={19} /> : <><span>Verify OTP</span><ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════ STEP 4: NEW PASSWORD ════ */}
        {step === STEPS.NEW_PASSWORD && (
          <div className="anim-slide-up">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Set New Password</h2>
              <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">Choose a strong password for your account.</p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoFocus
                    placeholder="Min 6 characters"
                    className="w-full px-4 pr-12 py-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 transition-all outline-none text-[15px] font-medium"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-zinc-600 hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    placeholder="Re-enter your password"
                    className="w-full px-4 pr-12 py-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-[3px] focus:ring-purple-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 transition-all outline-none text-[15px] font-medium"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-zinc-600 hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-[15px] transition-all duration-300 disabled:opacity-60 group shadow-[0_8px_30px_-6px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)' }}>
                {loading ? <Loader2 className="animate-spin" size={19} /> : <><Lock size={17} /><span>Reset Password</span></>}
              </button>
            </form>
          </div>
        )}

        {/* ════ STEP 5: SUCCESS ════ */}
        {step === STEPS.SUCCESS && (
          <div className="anim-slide-up text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-slate-500 dark:text-zinc-500 text-sm mb-8">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
            <button onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-[15px] transition-all duration-300 group shadow-[0_8px_30px_-6px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)' }}>
              <span>Back to Sign In</span>
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        {step < STEPS.SUCCESS && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-semibold text-slate-500 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        )}

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <ShieldCheck size={13} className="text-emerald-500/70" />
          <span className="text-[11px] text-slate-400 dark:text-zinc-600 font-medium">
            256-bit SSL encrypted · Enterprise grade security
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
