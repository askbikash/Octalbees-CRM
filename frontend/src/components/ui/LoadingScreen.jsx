import React from 'react';

const LoadingScreen = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 w-full space-y-6">
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Background track */}
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-zinc-800"></div>
        {/* Spinning highlight */}
        <div className="absolute inset-0 rounded-full border-[3px] border-purple-600 border-t-transparent animate-[spin_1s_cubic-bezier(0.55,0.085,0.68,0.53)_infinite]"></div>
        
        {/* Inner pulse */}
        <div className="w-4 h-4 bg-purple-600 dark:bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(147,51,234,0.5)]"></div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300">
          {text}
        </h3>
      </div>
    </div>
  );
};

export default LoadingScreen;
