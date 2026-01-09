
import React, { useEffect, useState } from 'react';
import { AuthUser, UserStats, Bit } from '../types';
import { fetchUserProgress, UserProgressData } from '../services/userService';
import { IconFire, IconZap, IconCheck, IconClock, IconTrophy, IconArrowRight, IconDiscord } from './Icons';
import { slugify } from '../utils';
import { useNavigate } from 'react-router-dom';

interface ProgressDashboardProps {
  user: AuthUser;
  localStats: UserStats;
  bits: Bit[]; // To find next bit
  xp: number;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ user, localStats, bits, xp }) => {
  const [data, setData] = useState<UserProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Data (Simulate API Polling)
  useEffect(() => {
    const loadData = async () => {
        try {
            const progress = await fetchUserProgress(user, localStats, xp);
            setData(progress);
            setLoading(false);
        } catch (e) {
            console.error("Failed to load progress", e);
        }
    };

    loadData();

    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [user, localStats, xp]);

  const handleContinueLearning = () => {
     // Simple heuristic: Random bit or the daily one
     const nextBit = bits[Math.floor(Math.random() * bits.length)];
     if (nextBit) {
         navigate(`/bit/${slugify(nextBit.title)}`);
     }
  };

  if (loading || !data) {
      return (
          <div className="w-full h-48 rounded-3xl bg-slate-900/50 border border-white/5 animate-pulse flex items-center justify-center mb-12">
              <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-2"></div>
                  <span className="text-xs text-slate-500 font-mono uppercase">Syncing Neural Data...</span>
              </div>
          </div>
      );
  }

  const milestoneProgress = Math.min(100, Math.max(0, ((data.nextMilestone.current % 100) / 100) * 100));

  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex justify-between items-end mb-4 px-2">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Your Neural Progress</h2>
                <p className="text-sm text-slate-400">Weekly learning statistics</p>
            </div>
            {user.discord && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-full text-xs text-[#5865F2]">
                    <IconDiscord className="w-3 h-3" />
                    <span className="font-bold">Connected</span>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Streak Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-emerald-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IconFire className="w-16 h-16 text-emerald-500" />
                </div>
                <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                        <IconFire className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Streak</span>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-white">{data.streak}</span>
                        <span className="text-sm text-slate-400 ml-1">days</span>
                    </div>
                </div>
            </div>

            {/* XP Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-blue-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IconZap className="w-16 h-16 text-blue-500" />
                </div>
                <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex items-center space-x-2 text-blue-400 mb-2">
                        <IconZap className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Total XP</span>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-white">{data.totalXp}</span>
                        <span className="text-sm text-slate-400 ml-1">xp</span>
                    </div>
                </div>
            </div>

            {/* Bits Completed */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-purple-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IconCheck className="w-16 h-16 text-purple-500" />
                </div>
                <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex items-center space-x-2 text-purple-400 mb-2">
                        <IconCheck className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Bits Read</span>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-white">{data.bitsCompleted}</span>
                        <span className="text-sm text-slate-400 ml-1">bits</span>
                    </div>
                </div>
            </div>

            {/* Time Spent */}
             <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-cyan-500/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IconClock className="w-16 h-16 text-cyan-500" />
                </div>
                <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                        <IconClock className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Time (Week)</span>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-white">{data.timeSpentWeek}</span>
                        <span className="text-sm text-slate-400 ml-1">mins</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Milestone & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6 rounded-3xl bg-[#0B101B] border border-white/5 shadow-xl flex flex-col justify-center">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-white">Next Milestone: {data.nextMilestone.name}</h3>
                        <p className="text-xs text-slate-400">Keep going to reach the next level</p>
                    </div>
                    <div className="text-right">
                         <span className="text-2xl font-black text-indigo-400">{data.nextMilestone.current % 100}</span>
                         <span className="text-sm text-slate-500"> / 100 XP</span>
                    </div>
                </div>
                
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                    <div 
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000 ease-out"
                        style={{ width: `${milestoneProgress}%` }}
                    >
                         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleContinueLearning}
                    className="flex-1 flex items-center justify-between px-6 py-4 bg-white text-black rounded-2xl font-bold hover:bg-slate-200 transition-colors group shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                >
                    <span>Continue Learning</span>
                    <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                {!user.discord && (
                     <button className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-[#5865F2] text-white rounded-2xl font-bold hover:bg-[#4752C4] transition-colors">
                        <IconDiscord className="w-5 h-5" />
                        <span>Link Discord</span>
                    </button>
                )}

                {user.discord && (
                    <button className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-colors border border-white/5">
                        <IconTrophy className="w-5 h-5 text-amber-400" />
                        <span>View Achievements</span>
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default ProgressDashboard;
