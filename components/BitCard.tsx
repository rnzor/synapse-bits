import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bit } from '../types';
import { IconCode, IconNetwork, IconHeart, IconShare, IconBookmark } from './Icons';
import SimpleSyntaxHighlighter from './SimpleSyntaxHighlighter';
import { slugify } from '../utils';

interface BitCardProps {
  bit: Bit;
  isBookmarked?: boolean;
  onClick: (bit: Bit) => void;
  onShare: (bit: Bit) => void;
  onTagClick: (tag: string) => void;
  onBookmark?: (bit: Bit) => void;
  locked?: boolean;
  onLockedClick?: () => void;
}

const BitCard: React.FC<BitCardProps> = ({ bit, isBookmarked = false, onClick, onShare, onTagClick, onBookmark, locked = false, onLockedClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Intermediate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Advanced': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      if (!cardRef.current) return;
      
      // Disable 3D tilt on mobile for performance/usability
      if (window.innerWidth < 768) return;

      const card = cardRef.current;
      const box = card.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
      setRotate({ x: 0, y: 0 });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    console.log('handleShareClick called for bit:', bit.title);
    e.stopPropagation();
    e.preventDefault();
    onShare(bit);
  };



  const handleBookmarkClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (onBookmark) onBookmark(bit);
  };

  const isNew = Date.now() - bit.timestamp < 86400000 * 3; // 3 days

  return (
    <article 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative h-full perspective-1000"
        style={{ perspective: '1000px' }}
    >
      <Link
          to={`/bit/${slugify(bit.title)}`}
          onClick={(e) => {
            if (locked) {
              e.preventDefault();
              if (onLockedClick) onLockedClick();
            } else {
              onClick(bit);
            }
          }}
          className={`flex flex-col h-full bg-[#0B101B] rounded-3xl overflow-hidden transition-all duration-300 ease-out shadow-2xl relative z-10 ${
              isNew
              ? 'border border-cyan-500/40 shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]'
              : 'border border-white/5 hover:border-white/10'
          }`}
      >
          <div
              style={{
                  transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                  transformStyle: 'preserve-3d',
              }}
              className="flex flex-col h-full"
          >
          {/* Holographic Glow Border (Mouse Follow) */}
          <div className="hidden md:block absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
               style={{
                   background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,102,241,0.15), transparent 40%)`
               }}
          ></div>
          
          {/* Active "Fresh" Glow for New Items */}
          {isNew && (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none z-0"></div>
          )}
          
          {/* Scanline Effect - Subtle constant on mobile, animated on desktop hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent md:opacity-0 md:group-hover:opacity-100 md:animate-scan opacity-20 pointer-events-none z-20"></div>

          {/* Content Container */}
          <div className="p-6 flex flex-col h-full relative z-10 bg-gradient-to-b from-transparent to-[#02040a]">
              
              {/* Header */}
              <header className="flex justify-between items-start mb-5">
                <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getDifficultyColor(bit.difficulty)}`}>
                        {bit.difficulty}
                    </span>
                    
                    {/* Modern "New" Chip */}
                    {isNew && (
                        <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md border border-cyan-500/30 bg-cyan-950/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">Fresh</span>
                        </div>
                    )}
                </div>

                <div className="text-slate-500 group-hover:text-primary transition-colors p-2 bg-white/5 rounded-full border border-white/5 group-hover:border-white/10">
                    {bit.language === 'network' ? <IconNetwork className="w-4 h-4"/> : <IconCode className="w-4 h-4"/>}
                </div>
              </header>

              {/* Title & Summary */}
              <h3 className="text-xl font-bold text-white mb-3 leading-tight md:group-hover:text-indigo-300 transition-colors">
                {bit.title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed font-light">
                {bit.summary}
              </p>

              {/* Code Snippet Preview */}
              {bit.codeSnippet && (
                <div className="mt-auto mb-6 relative rounded-xl border border-white/5 bg-[#050912] overflow-hidden md:group-hover:border-indigo-500/20 transition-colors">
                  <div className="p-3 opacity-80 md:opacity-70 md:group-hover:opacity-100 transition-opacity">
                     <SimpleSyntaxHighlighter code={bit.codeSnippet} language={bit.language} className="text-[10px] bg-transparent" />
                  </div>
                  {/* Fade out bottom */}
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#050912] to-transparent"></div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="flex -space-x-1">
                     {/* Fake Avatars for social proof feel */}
                     {[...Array(3)].map((_, i) => (
                         <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] text-slate-500">
                             {String.fromCharCode(65+i)}
                         </div>
                     ))}
                     <span className="pl-2 text-[10px] text-slate-500 flex items-center">+{Math.floor(bit.votes / 10)}</span>
                </div>

                <div className="flex items-center space-x-3">
                     <button 
                        onClick={handleBookmarkClick}
                        className={`transition-colors ${isBookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-white'}`}
                        title={isBookmarked ? "Saved" : "Save for later"}
                     >
                        <IconBookmark className="w-4 h-4" fill={isBookmarked} />
                     </button>
                     <button 
                        onClick={handleShareClick}
                        className="text-slate-600 hover:text-white transition-colors"
                     >
                        <IconShare className="w-4 h-4" />
                     </button>
                     <div className="flex items-center space-x-1 text-xs font-mono font-bold text-slate-500 group-hover:text-rose-400 transition-colors">
                        <IconHeart className="w-3.5 h-3.5" />
                        <span>{bit.votes}</span>
                    </div>
                </div>
              </div>
          </div>
          </div> {/* Closing div for transform container */}
      </Link>
    </article>
  );
};

export default BitCard;
