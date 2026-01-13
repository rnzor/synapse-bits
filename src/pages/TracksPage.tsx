import React from 'react';
import { useNavigate } from 'react-router-dom';
import DevDebugOverlay from '../components/DevDebugOverlay';
import { IconStar, IconLock, IconClock } from '../../components/Icons';
import { Bit } from '../../types';
import { deriveTracks } from '../utils/derive';

interface TracksPageProps {
  bits: Bit[];
}

const TracksPage: React.FC<TracksPageProps> = ({ bits }) => {
  const navigate = useNavigate();

  const hasBits = Array.isArray(bits) && bits.length > 0;
  const derivedTracks = deriveTracks(bits);

  if (!hasBits) {
    return (
      <div className="space-y-12">
        <DevDebugOverlay bits={bits} label="TracksPage" />
        <div>
          <h2 className="text-3xl font-black text-white mb-4">Learning Tracks</h2>
          <p className="text-slate-400">Structured learning paths to master engineering topics</p>
        </div>
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-white/10">
          <h3 className="text-xl font-bold text-white">No knowledge bits available</h3>
          <p className="text-slate-400 mt-2">Check back later for new learning tracks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <DevDebugOverlay bits={bits} label="TracksPage" />
      <div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Learning Tracks</h2>
        <p className="text-slate-400 text-lg font-light">Structured learning paths curated from our neural knowledge base.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {derivedTracks.map((track) => (
          <div
            key={track.slug}
            className="group glass-panel rounded-3xl p-8 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
            onClick={() => navigate(`/track/${track.slug}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 space-y-6 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                  track.level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  track.level === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {track.level}
                </div>
                {track.isPro && (
                  <IconLock className="w-4 h-4 text-amber-500/50" />
                )}
              </div>

              <div className="flex-1">
                <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{track.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 font-light">
                  {track.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
                <div className="flex items-center space-x-2">
                  <IconClock className="w-3.5 h-3.5" />
                  <span>{track.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <IconStar className="w-3.5 h-3.5" />
                  <span>{track.bitIds.length} Bits</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TracksPage;
