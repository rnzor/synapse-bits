
import React, { useEffect } from 'react';
import { IconTrophy, IconStar, IconZap, IconX } from './Icons';
import confetti from 'https://esm.sh/canvas-confetti@1.9.2';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, onClose }) => {
  useEffect(() => {
    // Fire confetti from multiple angles
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm glass-modal rounded-3xl border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.3)] p-8 text-center animate-in zoom-in-50 duration-500 overflow-hidden">
        
        {/* Background Beams */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-purple-500/20 animate-pulse-slow"></div>
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/30 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/30 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 mb-6 relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl">
                    <IconTrophy className="w-14 h-14 text-white drop-shadow-md" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white text-amber-600 rounded-full p-2 shadow-lg animate-bounce">
                    <IconStar className="w-6 h-6 fill-current" />
                </div>
            </div>

            <h2 className="text-4xl font-black text-white mb-2 tracking-tight uppercase italic">Level Up!</h2>
            <p className="text-amber-200 font-mono text-lg mb-6">Neural Capacity Expanded</p>

            <div className="bg-black/40 rounded-2xl p-4 w-full border border-white/5 mb-8">
                <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-400">Current Level</span>
                    <span className="font-bold text-white text-2xl">{level}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 w-full animate-[shimmer_2s_linear_infinite]"></div>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-transform active:scale-95 shadow-xl flex items-center justify-center space-x-2"
            >
                <IconZap className="w-5 h-5 text-amber-600" />
                <span>Continue Learning</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
