
import React, { useState } from 'react';
import { IconX, IconDiscord, IconGoogle, IconZap } from './Icons';
import { AuthUser } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProviderLogin = (provider: 'google' | 'discord') => {
    setIsLoading(true);
    // Simulate OAuth Redirect & Data Fetch
    setTimeout(() => {
        const mockUser: AuthUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: provider === 'discord' ? 'CyberPunk_Dev' : 'Google User',
            provider: provider,
            avatar: provider === 'discord' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' : undefined,
        };

        if (provider === 'discord') {
            mockUser.discord = {
                id: '123456789012345678', // Mock Discord ID
                username: 'CyberPunk_Dev#4096',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                linkedAt: Date.now()
            };
        }

        onLogin(mockUser);
        setIsLoading(false);
    }, 1500);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      setIsLoading(true);
      setTimeout(() => {
          const mockUser: AuthUser = {
              id: Math.random().toString(36).substr(2, 9),
              name: email.split('@')[0],
              provider: 'email',
              email: email
          };
          onLogin(mockUser);
          setIsLoading(false);
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md glass-modal rounded-2xl border border-white/10 shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <IconX className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <IconZap className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Initialize Session</h2>
            <p className="text-slate-400 text-sm">Connect your neural identity to sync progress, save bits, and join the community.</p>
        </div>

        <div className="space-y-4">
            <button 
                onClick={() => handleProviderLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <IconGoogle className="w-5 h-5" />
                        <span>Continue with Google</span>
                    </>
                )}
            </button>

            <button 
                onClick={() => handleProviderLogin('discord')}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 py-3 bg-[#5865F2] text-white font-bold rounded-xl hover:bg-[#4752C4] transition-colors disabled:opacity-50"
            >
                 {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <IconDiscord className="w-5 h-5 fill-white" />
                        <span>Continue with Discord</span>
                    </>
                )}
            </button>
        </div>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0b101b] px-2 text-slate-500 font-mono">Or access via protocol</span>
            </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
                <input 
                    type="email" 
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                />
            </div>
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-white/10 transition-all shadow-lg hover:shadow-indigo-500/10 disabled:opacity-50"
            >
                {isLoading ? 'Authenticating...' : 'Sign In with Email'}
            </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
            By accessing the network, you agree to our <span className="text-indigo-400 cursor-pointer hover:underline">Neural Protocols</span> and <span className="text-indigo-400 cursor-pointer hover:underline">Data Privacy Logic</span>.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
