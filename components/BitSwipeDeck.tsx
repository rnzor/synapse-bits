
import React, { useState, useRef, useEffect } from 'react';
import { Bit } from '../types';
import { IconCode, IconNetwork, IconHeart, IconShare, IconX, IconCheck, IconRefresh, IconEye, IconArrowRight } from './Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { slugify } from '../utils';

interface BitSwipeDeckProps {
  bits: Bit[];
  onVote: (id: string) => void;
  onShare: (bit: Bit) => void;
}

const BitSwipeDeck: React.FC<BitSwipeDeckProps> = ({ bits, onVote, onShare }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset index when list changes (e.g. search filter)
  useEffect(() => {
    setCurrentIndex(0);
  }, [bits]);

  const currentBit = bits[currentIndex];
  const nextBit = bits[currentIndex + 1];

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    (cardRef.current as any).startX = clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startX = (cardRef.current as any).startX || clientX;
    setDragX(clientX - startX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    const threshold = 100;

    if (dragX > threshold) {
      handleVote();
    } else if (dragX < -threshold) {
      handleSkip();
    } else {
      setDragX(0); // Reset if not far enough
    }
  };

  const handleVote = () => {
      onVote(currentBit.id);
      setDragX(500); // Animate out right
      setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setDragX(0);
      }, 200);
  };

  const handleSkip = () => {
      setDragX(-500); // Animate out left
      setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setDragX(0);
      }, 200);
  };

  const handleCardClick = () => {
    if (Math.abs(dragX) < 5) {
        navigate(`/bit/${slugify(currentBit.title)}`, { state: { from: location.pathname } });
    }
  };


  if (!currentBit) {
    return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <IconCheck className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">All Caught Up!</h3>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">You've mastered all the bits in this feed for now.</p>
            <button 
                onClick={() => setCurrentIndex(0)}
                className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 rounded-2xl text-white font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
            >
                <IconRefresh className="w-5 h-5" />
                <span>Start Over</span>
            </button>
        </div>
    );
  }

  const rotation = dragX * 0.05;
  const opacityVote = Math.min(Math.max(dragX / 100, 0), 1);
  const opacityNope = Math.min(Math.max(-dragX / 100, 0), 1);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative">
        <div className="relative w-full flex-1 perspective-1000 mt-2 mb-20">
            
            {/* Background Card (Next) */}
            {nextBit && (
                <div className="absolute inset-0 top-6 scale-[0.92] opacity-60 bg-slate-800 rounded-[32px] border border-white/5 pointer-events-none shadow-2xl translate-y-4">
                    <div className="p-8 h-full flex flex-col">
                        <div className="h-6 w-24 bg-white/10 rounded mb-6"></div>
                        <div className="h-10 w-3/4 bg-white/10 rounded mb-6"></div>
                        <div className="h-32 w-full bg-white/10 rounded"></div>
                    </div>
                </div>
            )}

            {/* Active Card */}
            <div 
                ref={cardRef}
                className="absolute inset-0 bg-[#0B101B] rounded-[32px] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
                style={{
                    transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onClick={handleCardClick}
            >
                {/* Subtle sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B101B]/20 to-[#02040a] z-0"></div>

                {/* Swipe Indicators - High Impact */}
                <div className="absolute top-10 left-8 border-4 border-emerald-500 rounded-xl px-6 py-2 transform -rotate-12 z-20 bg-black/20 backdrop-blur-sm" style={{ opacity: opacityVote }}>
                    <span className="text-4xl font-black text-emerald-500 uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]">LIKE</span>
                </div>
                <div className="absolute top-10 right-8 border-4 border-rose-500 rounded-xl px-6 py-2 transform rotate-12 z-20 bg-black/20 backdrop-blur-sm" style={{ opacity: opacityNope }}>
                    <span className="text-4xl font-black text-rose-500 uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(244,63,94,0.5)]">NOPE</span>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col h-full relative z-10">
                    <header className="flex justify-between items-start mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border bg-black/40 backdrop-blur-md ${
                            currentBit.difficulty === 'Beginner' ? 'border-emerald-500/30 text-emerald-400' :
                            currentBit.difficulty === 'Intermediate' ? 'border-amber-500/30 text-amber-400' :
                            'border-rose-500/30 text-rose-400'
                        }`}>
                            {currentBit.difficulty}
                        </span>
                        <div className="text-slate-400 p-3 bg-white/5 rounded-full border border-white/5">
                            {currentBit.language === 'network' ? <IconNetwork className="w-6 h-6"/> : <IconCode className="w-6 h-6"/>}
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-3xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-lg">
                            {currentBit.title}
                        </h3>
                        <p className="text-slate-300 text-lg mb-6 leading-relaxed line-clamp-5 font-light">
                            {currentBit.summary}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                            {currentBit.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-mono tracking-wide">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center text-sm font-medium text-slate-500">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{new Date(currentBit.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <IconHeart className="w-4 h-4 text-rose-500" fill />
                            <span className="text-white">{currentBit.votes}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Controls - Premium Floating Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center items-center pb-2">
            <div className="flex items-center gap-6 px-8 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                
                {/* Skip / Nope */}
                <button 
                    onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                    className="group relative w-14 h-14 rounded-full bg-[#1e293b]/50 backdrop-blur-md border border-white/5 text-rose-500 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 hover:bg-[#1e293b] hover:border-rose-500/30 hover:shadow-rose-900/20"
                    aria-label="Skip"
                >
                    <IconX className="w-6 h-6 transition-transform group-hover:rotate-90" />
                </button>
                
                 {/* Details / Read */}
                <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/bit/${slugify(currentBit.title)}`, { state: { from: location.pathname } }); }}
                    className="group w-12 h-12 rounded-full bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 hover:bg-white/10 hover:text-white"
                    aria-label="Details"
                >
                    <IconEye className="w-5 h-5" />
                </button>


                {/* Vote / Like (Primary) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); handleVote(); }}
                    className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/20 border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 hover:shadow-emerald-500/40"
                    aria-label="Vote Up"
                >
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <IconHeart className="w-7 h-7 relative z-10 transition-transform group-hover:scale-110" fill />
                </button>
            </div>
        </div>
    </div>
  );
};

export default BitSwipeDeck;
