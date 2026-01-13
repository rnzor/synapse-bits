import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bit, Track, UserStats } from '../../types';
import { getContinueLearningRecommendation } from '../utils/progress';
import { IconPlay, IconArrowRight } from '../../components/Icons';
import { slugify } from '../../utils';


interface ContinueLearningProps {
  tracks: Track[];
  bits: Bit[];
  stats: UserStats;
  user?: any;
  className?: string;
}

const ContinueLearning: React.FC<ContinueLearningProps> = ({
  tracks,
  bits,
  stats,
  user: _user,
  className = ''
}) => {
  const navigate = useNavigate();

  const recommendation = getContinueLearningRecommendation(tracks, bits, stats);

  if (recommendation.reason === 'none') {
    return (
      <div className={`glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/5 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">🎉</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-slate-300 text-sm">You've completed all available content. Check back later for new tracks!</p>
        </div>
      </div>
    );
  }

  let title = '';
  let description = '';
  let actionText = '';
  let actionPath = '';
  let bit: Bit | undefined;
  let track: Track | undefined;

  if (recommendation.nextBitId) {
    bit = bits.find(b => b.id === recommendation.nextBitId);
    if (bit) {
      title = 'Continue Learning';
      description = `Continue with "${bit.title}"`;
      actionText = 'Continue';
      actionPath = `/bit/${slugify(bit.title)}`;
    }
  } else if (recommendation.nextTrackSlug) {

    track = tracks.find(t => t.slug === recommendation.nextTrackSlug);
    if (track) {
      title = 'Start New Track';
      description = `Begin "${track.title}"`;
      actionText = 'Start Track';
      actionPath = `/track/${track.slug}`;
    }
  }

  if (!bit && !track) return null;

  return (
    <div className={`glass-panel rounded-2xl p-6 border border-indigo-500/20 bg-indigo-500/5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-300 mb-4">{description}</p>

          {bit && (
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>{bit.difficulty}</span>
              <span>•</span>
              <span>{bit.author}</span>
            </div>
          )}

          {track && (
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>{track.estimatedTime}</span>
              <span>•</span>
              <span>{track.bitIds.length} bits</span>
              {track.isPro && (
                <>
                  <span>•</span>
                  <span className="text-amber-400">PRO</span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(actionPath)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ml-4"
        >
          <IconPlay className="w-4 h-4" />
          <span>{actionText}</span>
          <IconArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContinueLearning;