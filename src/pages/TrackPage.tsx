import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TRACKS } from '../data/tracks';
import { Bit } from '../../types';
import { IconArrowRight, IconClock, IconStar, IconLock, IconPlay } from '../../components/Icons';

// Mock bits data - in real implementation this would come from props
const MOCK_BITS: Bit[] = [];

const TrackPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const track = TRACKS.find(t => t.slug === slug);

  if (!track) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Track Not Found</h2>
          <button onClick={() => navigate('/tracks')} className="px-4 py-2 bg-indigo-600 rounded-lg text-white">
            Back to Tracks
          </button>
        </div>
      </div>
    );
  }

  const trackBits = MOCK_BITS.filter(bit => track.bitIds.includes(bit.id));
  const completedCount = 0; // Would be calculated from user stats
  const progress = track.bitIds.length > 0 ? (completedCount / track.bitIds.length) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/tracks')} className="text-indigo-400 hover:text-indigo-300 mb-4 flex items-center space-x-2">
          <span>← Back to Tracks</span>
        </button>

        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-3xl font-black text-white">{track.title}</h2>
              {track.isPro && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 flex items-center space-x-2">
                  <IconLock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">PRO</span>
                </div>
              )}
            </div>
            <p className="text-lg text-slate-300 mb-4">{track.description}</p>

            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <IconClock className="w-4 h-4" />
                <span>{track.estimatedTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconStar className="w-4 h-4" />
                <span>{track.bitIds.length} bits</span>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                track.level === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                track.level === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {track.level}
              </div>
            </div>
          </div>

          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            onClick={() => navigate(`/bit/${track.bitIds[0]}`)}
          >
            <IconPlay className="w-4 h-4" />
            <span>Start Track</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{completedCount}/{track.bitIds.length} bits completed</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {track.prerequisites && track.prerequisites.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5">
          <h3 className="text-lg font-bold text-white mb-3">Prerequisites</h3>
          <p className="text-slate-300 text-sm mb-4">
            Complete these tracks first for the best learning experience:
          </p>
          <div className="flex flex-wrap gap-2">
            {track.prerequisites.map(prereqSlug => {
              const prereqTrack = TRACKS.find(t => t.slug === prereqSlug);
              return prereqTrack ? (
                <button
                  key={prereqSlug}
                  onClick={() => navigate(`/track/${prereqSlug}`)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  {prereqTrack.title}
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Track Content */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Track Content</h3>

        {track.bitIds.map((bitId, index) => {
          const bit = trackBits.find(b => b.id === bitId);
          const isCompleted = false; // Would be calculated from user stats
          const isLocked = false; // Would be calculated based on prerequisites

          return (
            <div
              key={bitId}
              className={`glass-panel rounded-xl p-6 border transition-all ${
                isCompleted
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : isLocked
                  ? 'border-slate-600 bg-slate-800/50 cursor-not-allowed'
                  : 'border-white/10 hover:border-indigo-500/30 cursor-pointer'
              }`}
              onClick={() => !isLocked && navigate(`/bit/${bitId}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isLocked
                      ? 'bg-slate-600 text-slate-400'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div>
                    <h4 className={`font-medium ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                      {bit?.title || `Bit ${bitId}`}
                    </h4>
                    <p className={`text-sm ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                      {bit?.summary || 'Loading...'}
                    </p>
                  </div>
                </div>

                {isLocked && (
                  <IconLock className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects */}
      {track.projects && track.projects.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Projects</h3>

          <div className="grid gap-4">
            {track.projects.map(project => (
              <div key={project.id} className="glass-panel rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">{project.title}</h4>
                    <p className="text-slate-300 mb-4">{project.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>{project.estimatedTime}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        project.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                        project.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {project.difficulty}
                      </span>
                    </div>
                  </div>

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      View on GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPage;