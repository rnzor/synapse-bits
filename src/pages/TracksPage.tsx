import React from 'react';
import { useNavigate } from 'react-router-dom';
import DevDebugOverlay from '../components/DevDebugOverlay';
import { IconStar, IconLock } from '../../components/Icons';
import { Bit } from '../../types';
import { deriveTracks } from '../utils/derive';

interface TracksPageProps {
  bits: Bit[];
}

const TracksPage: React.FC<TracksPageProps> = ({ bits }) => {
  const navigate = useNavigate();

  const hasBits = Array.isArray(bits) && bits.length > 0;

  const derivedTracks = deriveTracks(bits);

  console.log('[TracksPage] bits', bits.length, 'tracksDerived', derivedTracks.length);



  if (!hasBits) {
    return (
      <div className="space-y-12">
        <DevDebugOverlay bits={bits} label="TracksPage" />
        <div>
          <h2 className="text-3xl font-black text-white mb-4">Learning Tracks</h2>
          <p className="text-slate-400">Structured learning paths to master engineering topics</p>
        </div>
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-white">No bits found</h3>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-12">
      <DevDebugOverlay bits={bits} label="TracksPage" />
      <div>
        <h2 className="text-3xl font-black text-white mb-4">Learning Tracks</h2>
        <p className="text-slate-400">Structured learning paths to master engineering topics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {derivedTracks.map((track) => {
          return (
            <div
              key={track.slug}
              className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer"
              onClick={() => navigate(`/track/${track.slug}`)}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">{track.title}</h4>
                  <p className="text-slate-300 text-sm mb-3">Master {track.title} concepts with {track.bits.length} bite-sized lessons</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                    Beginner
                  </div>
                  <div className="text-sm text-slate-400">
                    {track.bits.length} bits
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{Math.ceil(track.bits.length * 5 / 60)} hours</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TracksPage;