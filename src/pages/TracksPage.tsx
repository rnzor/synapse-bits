import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TRACKS } from '../data/tracks';
import { TOPICS } from '../data/topics';
import { IconStar, IconLock } from '../../components/Icons';

const TracksPage: React.FC = () => {
  const navigate = useNavigate();

  const getTopicColor = (topicSlug: string) => {
    const colors: Record<string, string> = {
      networking: 'blue',
      'system-design': 'purple',
      database: 'green',
      programming: 'indigo',
      devops: 'orange',
      security: 'red',
      general: 'gray'
    };
    return colors[topicSlug] || 'gray';
  };

  const getTopicName = (topicSlug: string) => {
    const topic = TOPICS.find(t => t.slug === topicSlug);
    return topic?.label || topicSlug;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-4">Learning Tracks</h2>
        <p className="text-slate-400">Structured learning paths to master engineering topics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRACKS.map((track) => {
          const topicColor = getTopicColor(track.topicSlug);

          return (
            <div
              key={track.id}
              className={`glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer ${
                track.isPro ? 'relative' : ''
              }`}
              onClick={() => navigate(`/track/${track.slug}`)}
            >
              {track.isPro && (
                <div className="absolute top-4 right-4 bg-amber-500/20 border border-amber-500/30 rounded-full px-2 py-1 flex items-center space-x-1">
                  <IconLock className="w-3 h-3 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">PRO</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{track.title}</h3>
                  <p className="text-slate-300 text-sm mb-3">{track.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`px-2 py-1 rounded text-xs font-medium bg-${topicColor}-500/20 text-${topicColor}-400`}>
                    {getTopicName(track.topicSlug)}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    track.level === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                    track.level === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {track.level}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{track.bitIds.length} bits</span>
                  <span>{track.estimatedTime}</span>
                </div>

                {track.prerequisites && track.prerequisites.length > 0 && (
                  <div className="text-xs text-slate-500">
                    Prerequisites: {track.prerequisites.length} track{track.prerequisites.length > 1 ? 's' : ''}
                  </div>
                )}

                {track.projects && track.projects.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-indigo-400">
                    <IconStar className="w-4 h-4" />
                    <span>{track.projects.length} project{track.projects.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TracksPage;