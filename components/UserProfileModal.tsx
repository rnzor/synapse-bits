
import React from 'react';
import { UserStats, Badge, AuthUser } from '../types';
import { IconX, IconTrophy, IconFire, IconBrain, IconMedal, IconCode, IconZap, IconDiscord, IconLogout, IconCheck } from './Icons';

interface UserProfileModalProps {
  stats: UserStats;
  xp: number;
  level: number;
  badges: Badge[]; // All available badges to show status
  onClose: () => void;
  onLogout: () => void;
  user: AuthUser;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ stats, xp, level, badges, onClose, onLogout, user }) => {
  const nextLevelXp = level * 100;
  const progress = (xp % 100) / 100 * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl glass-modal rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20"></div>

        {/* Header */}
        <div className="relative p-6 pt-12 flex flex-col items-center">
             <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                <IconX className="w-5 h-5" />
             </button>
             
             <button onClick={onLogout} className="absolute top-4 left-4 p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-full text-rose-400 transition-colors" title="Disconnect Session">
                <IconLogout className="w-5 h-5" />
             </button>

             {/* Avatar / Level Circle */}
             <div className="relative mb-4">
                 <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] overflow-hidden">
                     {user.discord?.avatarUrl || user.avatar ? (
                         <img src={user.discord?.avatarUrl || user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                         <span className="text-4xl">👾</span>
                     )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black font-bold px-3 py-1 rounded-full text-xs border-2 border-slate-900">
                     Lvl {level}
                 </div>
             </div>
             
             <h2 className="text-2xl font-bold text-white">{user.name}</h2>
             <p className="text-slate-400 text-sm mb-6">Learning Protocol Active</p>

             {/* XP Progress */}
             <div className="w-full max-w-sm space-y-2">
                 <div className="flex justify-between text-xs text-slate-400 font-mono uppercase">
                     <span>Current XP</span>
                     <span>{Math.floor(xp)} / {level * 100}</span>
                 </div>
                 <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                     <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.max(5, progress)}%` }}
                     ></div>
                 </div>
             </div>
        </div>

        {/* Neural Link / Integration Section */}
        <div className="px-6 pb-6">
            <div className={`border rounded-xl p-4 flex items-center justify-between transition-all ${user.discord ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#5865F2]/10 border-[#5865F2]/30'}`}>
                <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg text-white ${user.discord ? 'bg-emerald-500' : 'bg-[#5865F2]'}`}>
                        <IconDiscord className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">Discord Neural Link</h4>
                            {user.discord && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <IconCheck className="w-3 h-3" /> LINKED
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">
                            {user.discord 
                                ? `Connected as ${user.discord.username}` 
                                : 'Sync XP and Roles with the community bot.'}
                        </p>
                    </div>
                </div>
                {user.discord ? (
                    <div className="flex flex-col items-end">
                        <label className="flex items-center cursor-pointer space-x-2">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Notifications</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            </div>
                        </label>
                    </div>
                ) : (
                    <button className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-lg transition-colors">
                        Connect Bot
                    </button>
                )}
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 px-6 pb-6 border-b border-white/5">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <IconFire className="w-6 h-6 text-orange-500 mb-2" />
                <span className="text-2xl font-bold text-white">{stats.streak}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Day Streak</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <IconMedal className="w-6 h-6 text-emerald-500 mb-2" />
                <span className="text-2xl font-bold text-white">{stats.quizzesWon}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Quizzes Won</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                <IconCode className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-2xl font-bold text-white">{stats.bitsRead}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Bits Read</span>
            </div>
        </div>

        {/* Badges Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/30">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Achievements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map(badge => {
                    const isUnlocked = stats.badges.includes(badge.id);
                    return (
                        <div 
                            key={badge.id}
                            className={`p-4 rounded-xl border flex items-start space-x-4 transition-all ${
                                isUnlocked 
                                ? 'bg-indigo-500/10 border-indigo-500/30' 
                                : 'bg-slate-900/50 border-white/5 opacity-50 grayscale'
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
                                {badge.icon === 'medal' && <IconMedal className="w-5 h-5" />}
                                {badge.icon === 'brain' && <IconBrain className="w-5 h-5" />}
                                {badge.icon === 'fire' && <IconFire className="w-5 h-5" />}
                                {badge.icon === 'code' && <IconCode className="w-5 h-5" />}
                                {badge.icon === 'zap' && <IconZap className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{badge.name}</h4>
                                <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                                {isUnlocked && <span className="inline-block mt-2 text-[10px] text-emerald-400 font-mono">UNLOCKED</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfileModal;
