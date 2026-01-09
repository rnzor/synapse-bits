
import React, { useState, useEffect } from 'react';
import { IconNetwork, IconX } from './Icons';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] flex items-center space-x-3 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-500 ${
        !isOnline 
        ? 'bg-rose-900/80 border-rose-500/50 text-rose-200 translate-y-0 opacity-100' 
        : 'bg-emerald-900/80 border-emerald-500/50 text-emerald-200 translate-y-0 opacity-100'
    }`}>
      <div className={`p-1.5 rounded-full ${!isOnline ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
        {!isOnline ? <IconX className="w-3 h-3" /> : <IconNetwork className="w-3 h-3" />}
      </div>
      <span className="text-xs font-bold font-mono uppercase tracking-wider">
        {!isOnline ? 'Connection Lost' : 'System Online'}
      </span>
    </div>
  );
};

export default NetworkStatus;
