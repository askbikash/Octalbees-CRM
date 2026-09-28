import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ text = "Loading..." }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing');

  useEffect(() => {
    const steps = [
      { at: 15, text: 'Connecting to servers' },
      { at: 35, text: 'Loading your workspace' },
      { at: 55, text: 'Syncing pipeline data' },
      { at: 75, text: 'Preparing dashboard' },
      { at: 90, text: 'Almost ready' },
    ];

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + Math.random() * 8 + 2, 95);
        const step = steps.find(s => prev < s.at && next >= s.at);
        if (step) setStatusText(step.text);
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#06060e] w-full overflow-hidden relative">
      
      {/* Deep background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo with orbital rings */}
        <div className="relative mb-12 w-40 h-40 flex items-center justify-center">
          
          {/* Orbit ring 1 - slow */}
          <div className="absolute inset-0 rounded-full" style={{ animation: 'orbit1 6s linear infinite' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
          </div>
          
          {/* Orbit ring 2 - medium */}
          <div className="absolute inset-3 rounded-full" style={{ animation: 'orbit2 4s linear infinite' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.7)]" />
          </div>

          {/* Orbit ring 3 - fast */}
          <div className="absolute inset-6 rounded-full" style={{ animation: 'orbit1 3s linear infinite reverse' }}>
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,0.6)]" />
          </div>

          {/* Soft ring traces */}
          <div className="absolute inset-0 rounded-full border border-purple-500/[0.07]" />
          <div className="absolute inset-3 rounded-full border border-indigo-500/[0.06]" />
          <div className="absolute inset-6 rounded-full border border-violet-500/[0.05]" />

          {/* Breathing glow behind logo */}
          <div 
            className="absolute w-20 h-20 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
              animation: 'breathe 3s ease-in-out infinite',
            }} 
          />

          {/* Logo */}
          <img 
            src="/Logo-white.png" 
            alt="Octalbees" 
            className="relative z-10 h-14 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.3))' }}
          />
        </div>

        {/* Brand */}
        <p className="text-zinc-500 text-xs font-medium tracking-[0.25em] uppercase mb-10">Enterprise CRM Platform</p>

        {/* Progress bar */}
        <div className="w-56 mb-5">
          <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out relative"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c3aed, #818cf8)',
              }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
          <p className="text-zinc-500 text-[11px] font-medium tracking-wide">
            {statusText}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes orbit1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(120deg); }
          to { transform: rotate(480deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
