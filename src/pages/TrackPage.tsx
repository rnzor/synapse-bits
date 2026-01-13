import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Bit, UserStats } from '../../types';
import { deriveTracks } from '../utils/derive';
import { getTrackProgress, getNextBitInTrack, canAccessTrack } from '../utils/progress';
import DevDebugOverlay from '../components/DevDebugOverlay';
import { IconClock, IconStar, IconLock, IconPlay } from '../../components/Icons';
import { slugify } from '../../utils';

interface TrackPageProps {
  bits: Bit[];
  stats: UserStats;
  user?: any;
}

const TrackPage: React.FC<TrackPageProps> = ({ bits, stats, user }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const track = useMemo(() => {
    const allTracks = deriveTracks(bits);
    return allTracks.find(t => t.slug === slug);
  }, [bits, slug]);

  if (!track) {
    return (
      <div className="space-y-8">
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Track Not Found</h2>
          <p className="text-slate-400 mb-8">We couldn't find the learning path you're looking for.</p>
          <button onClick={() => navigate('/tracks')} className="px-6 py-2 bg-indigo-600 rounded-lg text-white font-bold hover:bg-indigo-500 transition-colors">
            Back to Tracks
          </button>
        </div>
      </div>
    );
  }

  const trackProgress = getTrackProgress(track, stats);
  const nextBitId = getNextBitInTrack(track, stats);
  const canAccess = canAccessTrack(track, stats, user);
  const trackBits = bits.filter(bit => track.bitIds.includes(bit.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DevDebugOverlay bits={bits} label="TrackPage" />
      
      {/* Header */}
      <div>
        <button onClick={() => navigate('/tracks')} className="text-indigo-400 hover:text-indigo-300 mb-6 flex items-center space-x-2 font-medium transition-colors">
          <span>← Back to Tracks</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h2 className="text-4xl font-black text-white tracking-tight">{track.title}</h2>
              {track.isPro && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 flex items-center space-x-2">
                  <IconLock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400">PRO</span>
                </div>
              )}
            </div>
            <p className="text-lg text-slate-300 mb-6 max-w-3xl leading-relaxed">{track.description}</p>

            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <IconClock className="w-4 h-4 text-indigo-400" />
                <span>{track.estimatedTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconStar className="w-4 h-4 text-amber-400" />
                <span>{track.bitIds.length} bits</span>
              </div>
              <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                track.level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                track.level === 'Intermediate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {track.level}
              </div>
            </div>
          </div>

          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all hover:scale-105 shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            onClick={() => {
              const targetBitId = nextBitId || track.bitIds[0];
              const targetBit = bits.find(b => b.id === targetBitId);
              if (targetBit) {
                navigate(`/bit/${slugify(targetBit.title)}`, {
                  state: {
                    from: `/track/${track.slug}`,
                    context: 'track',
                    trackSlug: track.slug,
                    trackBitIds: track.bitIds,
                    currentIndex: track.bitIds.indexOf(targetBitId),
                    contextLabel: track.title
                  }
                });
              }
            }}
            disabled={!canAccess}
          >
            <IconPlay className="w-5 h-5" />
            <span>
              {trackProgress.percentage === 100 ? 'Review Track' :
               trackProgress.percentage > 0 ? 'Continue Track' :
               'Start Track'}
            </span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/5">
          <div className="flex justify-between text-sm font-medium text-slate-400 mb-3">
            <span>Course Progress</span>
            <span className="text-white">{Math.round(trackProgress.percentage)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${trackProgress.percentage}%` }}
            ></div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {trackProgress.completed} of {track.bitIds.length} bits completed
          </p>
        </div>
      </div>

      {/* Track Content */}
      <div className="space-y-6 pt-4">
        <h3 className="text-2xl font-black text-white tracking-tight">Curriculum</h3>

        <div className="grid gap-4">
          {track.bitIds.map((bitId, index) => {
            const bit = trackBits.find(b => b.id === bitId);
            const isCompleted = stats.completedBits.includes(bitId);
            // Sequential access: bits are "next" if they are the first incomplete one
            const isNext = bitId === nextBitId || (!nextBitId && index === 0);
            
            return (
              <div
                key={bitId}
                className={`group glass-panel rounded-2xl p-5 border transition-all duration-300 ${
                  isCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-80'
                    : isNext
                    ? 'border-indigo-500/40 bg-indigo-500/5 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5'
                    : 'border-white/5 hover:border-white/20'
                } cursor-pointer`}
              >
                <Link 
                  to={`/bit/${slugify(bit?.title || bitId)}`}
                  state={{
                    from: `/track/${track.slug}`,
                    context: 'track',
                    trackSlug: track.slug,
                    trackBitIds: track.bitIds,
                    currentIndex: index,
                    contextLabel: track.title
                  }}
                  className="block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isNext
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div>
                        <h4 className={`font-bold transition-colors ${isCompleted ? 'text-slate-400' : 'text-white group-hover:text-indigo-400'}`}>
                          {bit?.title || `Bit ${bitId}`}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-slate-500 font-medium">{bit?.difficulty || 'Beginner'}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <span className="text-xs text-slate-500 capitalize">{bit?.language || 'Technical'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {isCompleted && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Learned</span>}
                      {isNext && !isCompleted && <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded">Next Up</span>}
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <IconPlay className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackPage;
